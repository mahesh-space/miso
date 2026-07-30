import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { mockMenuItems, mockOrders, mockRestaurants, mockUsers } from '../data/mockData';
import { chooseBestDriver } from '../lib/dispatch';

const AppContext = createContext(null);

const clone = (value) => JSON.parse(JSON.stringify(value));
const normalizeOrder = (order, restaurants, users) => ({
  ...order,
  restaurant: order.restaurant || restaurants.find((r) => r.id === order.restaurant_id)?.name || 'Kitchen',
  partner: order.partner || users.find((u) => u.id === order.driver_id)?.name || (order.driver_id ? 'Driver' : 'Unassigned'),
  customer: order.customer || users.find((u) => u.id === order.customer_id)?.name || 'Customer',
  status: order.status || 'placed',
  total_amount: order.total_amount ?? order.total,
});

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState(() => clone(mockUsers));
  const [restaurants, setRestaurants] = useState(() => clone(mockRestaurants));
  const [menuItems, setMenuItems] = useState(() => clone(mockMenuItems));
  const [orders, setOrders] = useState(() => clone(mockOrders));
  const [toasts, setToasts] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const dispatchReservations = useRef(new Set());
  const signupInFlight = useRef(false);

  const notify = useCallback((message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((current) => [...current, { id, message, tone }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4500);
  }, []);

  const hydrateSupabase = async () => {
    if (!supabase) return;

    // Phase 1: always fetch public data (restaurants & menu items have SELECT using(true))
    // This runs regardless of login state so data persists across refreshes.
    const [restaurantsResult, menuResult] = await Promise.all([
      supabase.from('restaurants').select('*').order('created_at', { ascending: false }),
      supabase.from('menu_items').select('*').order('name'),
    ]);
    if (restaurantsResult.data) setRestaurants(restaurantsResult.data);
    if (menuResult.data) setMenuItems(menuResult.data.map((item) => ({ ...item, restaurantId: item.restaurant_id })));

    // Phase 2: session-gated data (profiles & orders require auth)
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) { setLoading(false); return; }
    const [profileResult, profilesResult, ordersResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', auth.session.user.id).single(),
      supabase.from('profiles').select('*'),
      supabase.from('orders').select('*').order('created_at', { ascending: false }),
    ]);
    const profile = profileResult.data;
    const dbProfiles = profilesResult.data?.map((profileRow) => ({ ...profileRow, name: profileRow.full_name })) || [];
    const combinedUsers = [...dbProfiles];
    mockUsers.forEach((mockUser) => {
      if (!combinedUsers.some((u) => u.id === mockUser.id || u.email === mockUser.email)) {
        combinedUsers.push(mockUser);
      }
    });
    const resolvedRestaurants = restaurantsResult.data || restaurants;
    if (profilesResult.data) setUsers(combinedUsers);
    if (ordersResult.data) setOrders(ordersResult.data.map((order) => normalizeOrder(order, resolvedRestaurants, combinedUsers)));
    if (profile) setSession({ id: profile.id, name: profile.full_name, email: profile.email, role: profile.role, phone: profile.phone, status: profile.status, ...profile });
    setLoading(false);
  };

  useEffect(() => { hydrateSupabase().catch(() => { setLoading(false); }); }, []);

  useEffect(() => {
    if (!supabase || !session) return undefined;
    const channel = supabase.channel('miso-orders-live').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async (payload) => {
      const incoming = payload.new || payload.old;
      if (payload.eventType === 'DELETE') {
        setOrders((current) => current.filter((order) => order.id !== incoming.id));
      } else {
        const next = normalizeOrder(incoming, restaurants, users);
        setOrders((current) => {
          const exists = current.some((order) => order.id === next.id);
          return exists ? current.map((order) => order.id === next.id ? { ...order, ...next } : order) : [next, ...current];
        });

        // Event-driven auto-assign when an unassigned order is inserted/updated
        if ((payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') && !incoming.driver_id && incoming.status === 'placed') {
          assignOrderRecord(next).catch((err) => console.error('[event-driven dispatch] error:', err));
        }
      }
      if (payload.eventType === 'INSERT' && session.role === 'admin') notify('New order received — auto-assigning fastest driver…', 'info');
      if (payload.eventType === 'UPDATE' && session.role === 'customer' && incoming.status === 'picked_up') notify('Your driver is on the way', 'success');
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [session, restaurants, users]);

  // Event-driven watcher: automatically dispatches any unassigned placed order as soon as it enters state
  useEffect(() => {
    if (!loading && session && (session.role === 'admin' || !supabase)) {
      const unassigned = orders.filter((o) => !o.driver_id && o.status === 'placed');
      if (unassigned.length > 0) {
        unassigned.forEach((order) => {
          assignOrderRecord(order, orders).catch((err) => console.error('[auto-dispatch watcher] error:', err));
        });
      }
    }
  }, [orders, loading, session]);

  const login = async ({ email, password, role }) => {
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
      if (profileError) throw profileError;
      if (profile.account_status && profile.account_status !== 'active') throw new Error(`This account is ${profile.account_status}. Contact an admin.`);
      if (role && profile.role !== role) throw new Error('This account does not have that workspace role.');
      setSession({ id: profile.id, name: profile.full_name, email: profile.email, role: profile.role, phone: profile.phone, status: profile.status, ...profile });
      return;
    }
    const user = users.find((candidate) => candidate.email.toLowerCase() === email.toLowerCase() && candidate.role === role);
    if (!user) throw new Error('Demo account not found. Use a seeded email or create an account.');
    if (user.account_status && user.account_status !== 'active') throw new Error(`This account is ${user.account_status}. Contact an admin.`);
    setSession(user);
  };

  const signup = async ({ name, email, password, role, details = {} }) => {
    // Guard: prevent duplicate calls from React StrictMode or fast double-clicks
    if (signupInFlight.current) return;
    signupInFlight.current = true;
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name, role } },
        });
        if (error) {
          console.error('[signup] supabase.auth.signUp error:', error);
          throw error;
        }
        if (data.user) {
          const profile = {
            id: data.user.id,
            email,
            full_name: name,
            role,
            phone: details.phone || null,
            address: details.address || null,
            dietary_preference: details.dietary || null,
            vehicle_type: details.vehicleType || null,
            vehicle_registration: details.vehicleRegistration || null,
            license_number: details.licenseNumber || null,
            coverage_area: details.coverageArea || null,
            team_name: details.teamName || null,
            employee_id: details.employeeId || null,
            status: 'offline',
          };
          const { error: profileError } = await supabase.from('profiles').upsert(profile);
          if (profileError) {
            console.error('[signup] profiles upsert error:', profileError);
            throw profileError;
          }
          setSession({ id: profile.id, name, email, role, status: 'offline', ...profile });
        }
        return;
      }
      const newUser = { id: `${role}-${Date.now()}`, name, email, role, status: 'offline', account_status: 'active', ...details, phone: details.phone || '' };
      setUsers((current) => [...current, newUser]);
      setSession(newUser);
    } finally {
      signupInFlight.current = false;
    }
  };

  const logout = async () => { if (supabase) await supabase.auth.signOut(); setSession(null); };
  const assignOrderRecord = async (order, orderPool = orders) => {
    const availableDrivers = users.filter((user) => user.role === 'driver' && !dispatchReservations.current.has(user.id));
    const choice = chooseBestDriver(order, availableDrivers, orderPool);
    if (!choice) return order;
    dispatchReservations.current.add(choice.driver.id);
    const assigned = {
      ...order,
      driver_id: choice.driver.id,
      partner: choice.driver.name,
      status: 'preparing'
    };
    setOrders((current) => current.map((candidate) => candidate.id === order.id ? { ...candidate, ...assigned } : candidate));
    try {
      if (supabase) {
        const { error } = await supabase.from('orders').update({
          driver_id: choice.driver.id,
          status: 'preparing'
        }).eq('id', order.id);
        if (error) throw error;
      }
      notify(`${choice.driver.name} assigned in ~${choice.etaMinutes} min`, 'success');
      return assigned;
    } catch (error) {
      console.error('[assignOrderRecord] dispatch error:', error);
      notify('Automatic dispatch could not be saved', 'error');
      throw error;
    } finally {
      dispatchReservations.current.delete(choice.driver.id);
    }
  };
  const createOrder = async (payload) => {
    const order = { ...payload, id: `ORD-${1050 + orders.length}`, status: 'placed', created_at: 'Just now', partner: 'Unassigned' };
    let created = order;
    if (supabase) {
      const { data, error } = await supabase.from('orders').insert({
        customer_id: payload.customer_id,
        restaurant_id: payload.restaurant_id,
        total_amount: payload.total_amount,
        delivery_address: payload.delivery_address,
        items: payload.items
      }).select().single();
      if (error) throw error;
      created = normalizeOrder(data, restaurants, users);
      setOrders((current) => [created, ...current]);
    } else {
      setOrders((current) => [order, ...current]);
    }
    // Automatically trigger the fastest driver algorithm on placement
    return assignOrderRecord(created, [created, ...orders]);
  };
  const updateOrder = async (id, changes) => {
    setOrders((current) => current.map((order) => order.id === id ? { ...order, ...changes } : order));
    if (supabase) { const dbChanges = { ...changes }; delete dbChanges.partner; const { error } = await supabase.from('orders').update(dbChanges).eq('id', id); if (error) { notify('The server could not save that update', 'error'); throw error; } }
  };
  const addRestaurant = async (restaurant) => {
    if (supabase) {
      const { data, error } = await supabase.from('restaurants').insert(restaurant).select().single();
      if (error) {
        console.error('[addRestaurant] error:', error);
        notify('Restaurant could not be saved to the database', 'error');
        throw error;
      }
      // Use the real DB-generated UUID so the row survives a page refresh
      setRestaurants((current) => [data, ...current]);
      return data;
    }
    const created = { ...restaurant, id: `r-${Date.now()}` };
    setRestaurants((current) => [created, ...current]);
    return created;
  };
  const removeRestaurant = async (id) => {
    setRestaurants((current) => current.filter((r) => r.id !== id));
    setMenuItems((current) => current.filter((item) => item.restaurantId !== id && item.restaurant_id !== id));
    if (supabase) {
      const { error } = await supabase.from('restaurants').delete().eq('id', id);
      if (error) {
        console.error('[removeRestaurant] error:', error);
        notify('Restaurant could not be deleted from the database', 'error');
        throw error;
      }
    }
  };
  const addMenuItem = async (item) => {
    const restaurantId = item.restaurantId || item.restaurant_id;
    if (supabase) {
      const { restaurantId: _rid, ...dbItem } = item;
      const { data, error } = await supabase
        .from('menu_items')
        .insert({ ...dbItem, restaurant_id: restaurantId, is_available: true })
        .select()
        .single();
      if (error) {
        console.error('[addMenuItem] error:', error);
        notify('Menu item could not be saved to the database', 'error');
        throw error;
      }
      // Use real DB-generated UUID and normalise restaurantId alias
      setMenuItems((current) => [{ ...data, restaurantId: data.restaurant_id }, ...current]);
      return data;
    }
    const created = { ...item, id: `i-${Date.now()}`, restaurantId, is_available: true };
    setMenuItems((current) => [created, ...current]);
    return created;
  };
  const addDriver = async ({ name, email }) => { const created = { id: `d-${Date.now()}`, name, email, role: 'driver', status: 'offline', account_status: 'active', phone: '' }; setUsers((current) => [...current, created]); if (supabase) notify('Partner added to this workspace. Connect an invite Edge Function to provision Supabase Auth access.', 'info'); return created; };
  const updateDriver = async (id, accountStatus) => { const normalizedStatus = accountStatus === 'offline' ? 'active' : accountStatus; setUsers((current) => current.map((user) => user.id === id ? { ...user, account_status: normalizedStatus, status: 'offline' } : user)); if (supabase) { const { error } = await supabase.from('profiles').update({ account_status: normalizedStatus, status: 'offline' }).eq('id', id); if (error) { notify('Driver action could not be saved', 'error'); throw error; } } };
  const updateProfile = async (changes) => { const next = { ...session, ...changes }; setSession(next); setUsers((current) => current.map((user) => user.id === session.id ? { ...user, ...changes } : user)); if (supabase) { const { error } = await supabase.from('profiles').update({ full_name: next.name, email: next.email, phone: next.phone, status: next.status }).eq('id', session.id); if (error) { notify('Profile could not be saved', 'error'); throw error; } } };

  const value = { session, setSession, users, restaurants, menuItems, orders, loading, toasts, notify, login, signup, logout, createOrder, updateOrder, assignOrderRecord, addRestaurant, removeRestaurant, addMenuItem, addDriver, updateDriver, updateProfile };
  return <AppContext.Provider value={value}>{children}<ToastViewport toasts={toasts} /></AppContext.Provider>;
}

function ToastViewport({ toasts }) { return <div className="toast-viewport" aria-live="polite">{toasts.map((toast) => <div className={`toast toast-${toast.tone}`} key={toast.id}>{toast.message}</div>)}</div>; }
export const useApp = () => useContext(AppContext);
