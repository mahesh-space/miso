import React, { useState } from 'react';
import { Bike, DollarSign, Filter, MoreHorizontal, Package, Plus, Star, Trash2, Users } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { money, statusLabels } from '../data/mockData';

export function AdminOverview() { const { orders, users } = useApp(); const revenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0); return <div className="content admin-page"><section className="admin-intro"><div><p className="eyebrow">Tuesday, 28 July 2026</p><h1>The city is <i>eating well.</i></h1><p>A quick read on everything moving through miso today.</p></div><div className="pulse-chart"><div className="bars">{[35, 52, 42, 70, 58, 87, 68, 92, 74, 80, 62, 96].map((height, index) => <i style={{ height: `${height}%` }} key={index}/>)}</div><small>Orders · last 12 hours</small></div></section><div className="stat-grid admin-stats"><Stat icon={<Package/>} label="Total orders" value={orders.length + 1282} note="↑ 18.4% this month"/><Stat icon={<Bike/>} label="Active deliveries" value={orders.filter((order) => order.status !== 'delivered').length + 46} note="9 need attention"/><Stat icon={<DollarSign/>} label="Gross revenue" value={money(revenue + 184200)} note="↑ 12.8% this month"/><Stat icon={<Users/>} label="Active users" value="8,492" note="+214 this week"/></div><div className="admin-columns"><div className="panel"><div className="panel-head"><div><p className="eyebrow">Needs a look</p><h2>Live orders</h2></div></div>{orders.slice(0, 4).map((order) => <AdminOrderRow key={order.id} order={order}/>)}</div><div className="panel"><div className="panel-head"><div><p className="eyebrow">Network health</p><h2>Partner pulse</h2></div></div>{users.filter((user) => user.role === 'driver').map((user) => <div className="partner-row" key={user.id}><div className="avatar avatar-partner">{user.name[0]}</div><div><strong>{user.name}</strong><small>{user.status === 'online' ? 'Online · ready for orders' : 'Offline'}</small></div><span className="online-dot">{user.status === 'online' ? 'Online' : 'Offline'}</span></div>)}</div></div></div>; }
export function AdminOrders() {
  const { orders, updateOrder, assignOrderRecord, users, notify } = useApp();
  const [filter, setFilter] = useState('all');
  const visible = filter === 'all' ? orders : orders.filter((order) => !order.driver_id);
  const unassigned = orders.filter((order) => !order.driver_id && order.status === 'placed');
  const autoAssign = async () => {
    if (!unassigned.length) return notify('There are no unassigned orders ready for dispatch', 'info');
    await Promise.all(unassigned.map((order) => assignOrderRecord(order)));
  };

  return (
    <div className="content admin-page">
      <div className="page-title">
        <div><p className="eyebrow">Platform-wide view</p><h1>All orders</h1></div>
        <div className="admin-order-actions">
          <button className="primary" onClick={autoAssign}>Auto-assign fastest drivers</button>
          <button className="filter-btn" onClick={() => setFilter(filter === 'all' ? 'unassigned' : 'all')}>
            <Filter size={15}/> {filter === 'all' ? 'Unassigned' : 'All orders'}
          </button>
        </div>
      </div>
      <div className="table-list">
        {visible.map((order) => {
          const currentDriverId = order.driver_id || '';
          const isDriverInList = users.some((user) => user.id === currentDriverId && user.role === 'driver');
          return (
            <div key={order.id} className="admin-order-detail">
              <AdminOrderRow order={order}/>
              <label>Assign driver
                <select
                  value={currentDriverId}
                  onChange={(e) => {
                    const newDriverId = e.target.value || null;
                    const driverUser = users.find((user) => user.id === newDriverId);
                    updateOrder(order.id, {
                      driver_id: newDriverId,
                      partner: driverUser?.name || (newDriverId ? order.partner || 'Driver' : 'Unassigned'),
                      status: newDriverId ? (order.status === 'placed' ? 'preparing' : order.status) : order.status
                    });
                    notify('Driver assignment updated', 'success');
                  }}
                >
                  <option value="">Unassigned</option>
                  {users.filter((user) => user.role === 'driver').map((user) => (
                    <option value={user.id} key={user.id}>{user.name}</option>
                  ))}
                  {currentDriverId && !isDriverInList && (
                    <option value={currentDriverId}>{order.partner || 'Assigned Driver'}</option>
                  )}
                </select>
              </label>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function AdminRestaurants() {
  const { restaurants, menuItems, addRestaurant, addMenuItem, removeRestaurant, notify } = useApp();
  const [rForm, setRForm] = useState({ name: '', cuisine: 'Indian', address: '', phone: '', description: '', delivery_time: '25–35 min', delivery_fee: '', min_order: '', image_url: '' });
  const [mForm, setMForm] = useState({ name: '', restaurant_id: '', category: 'Starters', price: '', description: '', is_vegetarian: false, is_spicy: false });
  const [showRForm, setShowRForm] = useState(false);
  const [showMForm, setShowMForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const setR = (k, v) => setRForm(f => ({ ...f, [k]: v }));
  const setM = (k, v) => setMForm(f => ({ ...f, [k]: v }));
  const cuisines = ['Indian','Chinese','Italian','Mexican','American','Japanese','Thai','Mediterranean','Pizza','Burgers','Café','Street Food','Seafood','Other'];
  const categories = ['Starters','Mains','Breads','Rice & Biryani','Pizza','Burgers','Desserts','Beverages','Sides','Specials','Combo Meals'];
  const createRestaurant = async () => {
    if (!rForm.name.trim()) return notify('Restaurant name is required', 'error');
    if (!rForm.address.trim()) return notify('Address is required', 'error');
    setBusy(true);
    try {
      await addRestaurant({ name: rForm.name.trim(), cuisine: rForm.cuisine, address: rForm.address.trim(), phone: rForm.phone || null, description: rForm.description || null, delivery_time: rForm.delivery_time || '30–45 min', delivery_fee: rForm.delivery_fee ? Number(rForm.delivery_fee) : 0, min_order: rForm.min_order ? Number(rForm.min_order) : 0, image_url: rForm.image_url || null, rating: 0 });
      setRForm({ name: '', cuisine: 'Indian', address: '', phone: '', description: '', delivery_time: '25–35 min', delivery_fee: '', min_order: '', image_url: '' });
      setShowRForm(false);
      notify('Restaurant added to your network', 'success');
    } finally { setBusy(false); }
  };
  const createMenuItem = async () => {
    if (!mForm.name.trim()) return notify('Item name is required', 'error');
    if (!mForm.restaurant_id) return notify('Select a restaurant', 'error');
    if (!mForm.price || Number(mForm.price) <= 0) return notify('Enter a valid price', 'error');
    setBusy(true);
    try {
      await addMenuItem({ restaurant_id: mForm.restaurant_id, restaurantId: mForm.restaurant_id, name: mForm.name.trim(), category: mForm.category, price: Number(mForm.price), description: mForm.description || null, is_vegetarian: mForm.is_vegetarian, is_spicy: mForm.is_spicy });
      setMForm(f => ({ ...f, name: '', price: '', description: '', is_vegetarian: false, is_spicy: false }));
      setShowMForm(false);
      notify('Menu item added', 'success');
    } finally { setBusy(false); }
  };
  return (
    <div className="content admin-page">
      <div className="page-title">
        <div><p className="eyebrow">Content management</p><h1>Restaurant network</h1></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="primary small" onClick={() => { setShowMForm(v => !v); setShowRForm(false); }}><Plus size={15}/> Add menu item</button>
          <button className="primary" onClick={() => { setShowRForm(v => !v); setShowMForm(false); }}><Plus size={17}/> Add restaurant</button>
        </div>
      </div>

      {showRForm && (
        <div className="admin-form-panel">
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>New restaurant</p>
          <div className="admin-form-grid">
            <label className="admin-form-full">Restaurant name *<input value={rForm.name} onChange={e => setR('name', e.target.value)} placeholder="e.g. The Bombay Kitchen" required/></label>
            <label>Cuisine type *<select value={rForm.cuisine} onChange={e => setR('cuisine', e.target.value)}>{cuisines.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Est. delivery time<input value={rForm.delivery_time} onChange={e => setR('delivery_time', e.target.value)} placeholder="25–35 min"/></label>
            <label className="admin-form-full">Full address *<input value={rForm.address} onChange={e => setR('address', e.target.value)} placeholder="Street, neighbourhood, city" required/></label>
            <label>Contact phone<input type="tel" value={rForm.phone} onChange={e => setR('phone', e.target.value)} placeholder="+91 98765 43210"/></label>
            <label>Delivery fee (₹)<input type="number" min="0" value={rForm.delivery_fee} onChange={e => setR('delivery_fee', e.target.value)} placeholder="0 — free delivery"/></label>
            <label>Minimum order (₹)<input type="number" min="0" value={rForm.min_order} onChange={e => setR('min_order', e.target.value)} placeholder="e.g. 199"/></label>
            <label className="admin-form-full">Short description<input value={rForm.description} onChange={e => setR('description', e.target.value)} placeholder="One line about what makes this place special"/></label>
            <label className="admin-form-full">Cover image URL<input type="url" value={rForm.image_url} onChange={e => setR('image_url', e.target.value)} placeholder="https://… (leave blank for default icon)"/></label>
          </div>
          <div className="admin-form-actions">
            <button className="primary" onClick={createRestaurant} disabled={busy}>{busy ? 'Saving…' : 'Add restaurant'}</button>
            <button onClick={() => setShowRForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {showMForm && (
        <div className="admin-form-panel">
          <p className="eyebrow" style={{ marginBottom: '1rem' }}>New menu item</p>
          <div className="admin-form-grid">
            <label>Item name *<input value={mForm.name} onChange={e => setM('name', e.target.value)} placeholder="e.g. Butter Chicken" required/></label>
            <label>Restaurant *<select value={mForm.restaurant_id} onChange={e => setM('restaurant_id', e.target.value)}><option value="">— select restaurant —</option>{restaurants.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
            <label>Category *<select value={mForm.category} onChange={e => setM('category', e.target.value)}>{categories.map(c => <option key={c}>{c}</option>)}</select></label>
            <label>Price (₹) *<input type="number" min="1" value={mForm.price} onChange={e => setM('price', e.target.value)} placeholder="e.g. 280" required/></label>
            <label className="admin-form-full">Description<input value={mForm.description} onChange={e => setM('description', e.target.value)} placeholder="A short, appetising description of the dish"/></label>
            <label className="admin-form-check"><input type="checkbox" checked={mForm.is_vegetarian} onChange={e => setM('is_vegetarian', e.target.checked)}/> <span>🟢 Vegetarian</span></label>
            <label className="admin-form-check"><input type="checkbox" checked={mForm.is_spicy} onChange={e => setM('is_spicy', e.target.checked)}/> <span>🌶 Spicy</span></label>
          </div>
          <div className="admin-form-actions">
            <button className="primary" onClick={createMenuItem} disabled={busy}>{busy ? 'Saving…' : 'Add menu item'}</button>
            <button onClick={() => setShowMForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="table-list">
        {restaurants.length === 0 && <p className="empty"><span>🍽️</span>No restaurants yet. Add your first one above.</p>}
        {restaurants.map(restaurant => {
          const itemCount = menuItems.filter(item => (item.restaurantId || item.restaurant_id) === restaurant.id).length;
          return (
            <div className="restaurant-row" key={restaurant.id}>
              <span className="row-food" style={{ background: restaurant.color || '#f0dfba' }}>
                {(restaurant.image_url || restaurant.imageUrl) ? (
                  <img src={restaurant.image_url || restaurant.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '7px' }} />
                ) : (
                  restaurant.image || '🍽️'
                )}
              </span>
              <div>
                <strong>{restaurant.name}</strong>
                <small>{restaurant.cuisine} · {restaurant.address}</small>
                <small className="muted">{itemCount} menu item{itemCount !== 1 ? 's' : ''}{restaurant.delivery_time ? ` · ${restaurant.delivery_time}` : ''}{restaurant.delivery_fee > 0 ? ` · ₹${restaurant.delivery_fee} delivery` : ' · Free delivery'}{restaurant.min_order > 0 ? ` · Min ₹${restaurant.min_order}` : ''}</small>
              </div>
              <span className="rating"><Star size={13} fill="currentColor"/> {restaurant.rating ?? 0}</span>
              <button className="icon-btn" aria-label={`Remove ${restaurant.name}`} onClick={async () => { await removeRestaurant(restaurant.id); notify('Restaurant removed', 'success'); }}><Trash2 size={16}/></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export function AdminPartners() { const { users, orders, addDriver, updateDriver, notify } = useApp(); const [name, setName] = useState(''); const [email, setEmail] = useState(''); const [openId, setOpenId] = useState(null); const createDriver = async () => { if (!name.trim() || !email.trim()) return notify('Add a name and email for the partner', 'error'); if (!/^\S+@\S+\.\S+$/.test(email)) return notify('Enter a valid partner email', 'error'); await addDriver({ name: name.trim(), email: email.trim() }); setName(''); setEmail(''); notify('Delivery partner added', 'success'); }; const actOnDriver = async (driver, action) => { await updateDriver(driver.id, action); setOpenId(null); notify(`${driver.name} is now ${action}`, 'success'); }; return <div className="content admin-page"><div className="page-title"><div><p className="eyebrow">People on the ground</p><h1>Delivery partners</h1></div></div><div className="partner-create-row"><input aria-label="Delivery partner name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Partner name"/><input aria-label="Delivery partner email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Partner email"/><button className="primary" onClick={createDriver}><Plus size={17}/> Add delivery partner</button></div><div className="table-list">{users.filter((user) => user.role === 'driver').map((user) => <div className="partner-row partner-row-large" key={user.id}><div className="avatar avatar-partner">{user.name[0]}</div><div><strong>{user.name}</strong><small>{user.email}</small></div><span className={user.account_status === 'active' && user.status === 'online' ? 'online-dot' : 'partner-state'}>{user.account_status === 'active' ? (user.status === 'online' ? 'Online' : 'Offline') : user.account_status}</span><span className="muted">{orders.find((order) => order.driver_id === user.id && order.status !== 'delivered')?.id || 'No active order'}</span><div className="partner-actions"><button className="icon-btn" aria-label={`Actions for ${user.name}`} aria-expanded={openId === user.id} onClick={() => setOpenId(openId === user.id ? null : user.id)}><MoreHorizontal size={18}/></button>{openId === user.id && <div className="partner-menu" role="menu"><button role="menuitem" onClick={() => actOnDriver(user, 'active')}>Activate</button><button role="menuitem" onClick={() => actOnDriver(user, 'frozen')}>Freeze account</button><button role="menuitem" onClick={() => actOnDriver(user, 'deactivated')}>Deactivate</button><button role="menuitem" onClick={() => actOnDriver(user, 'offline')}>Set offline</button></div>}</div></div>)}</div></div>; }
function Stat({ icon, label, value, note }) { return <div className="stat-card"><div className="stat-icon">{icon}</div><p>{label}</p><h2>{value}</h2><small>{note}</small></div>; }
function AdminOrderRow({ order }) { return <div className="order-row"><div className="mini-food">🍱</div><div className="order-row-main"><span className="order-id">{order.id}</span><strong>{order.restaurant}</strong><small>{order.customer || 'Customer'} · {order.partner || 'Unassigned'}</small></div><span className={`status status-${order.status.replaceAll('_', '-').toLowerCase()}`}>{statusLabels[order.status] || order.status}</span><b>{money(order.total_amount)}</b></div>; }
