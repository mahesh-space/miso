import React, { useMemo, useState } from 'react';
import { ArrowRight, Filter, MapPin, Plus, Search, ShoppingBag, Star, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { money, statusLabels } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { PaymentModal } from '../components/PaymentModal';
import { CartReview } from '../components/CartReview';
import { StatusTracker } from '../components/StatusTracker';

export function CustomerPage({ ordersOnly = false }) { const { session, restaurants, menuItems, orders, createOrder, notify } = useApp(); const navigate = useNavigate(); const [query, setQuery] = useState(''); const [cuisine, setCuisine] = useState('All'); const [cart, setCart] = useState([]); const [selected, setSelected] = useState(null); const [cartOpen, setCartOpen] = useState(false); const [paymentOpen, setPaymentOpen] = useState(false); const [address, setAddress] = useState('14, Palm Grove, Bandra West'); const cuisines = ['All', ...new Set(restaurants.map((restaurant) => restaurant.cuisine))]; const filtered = restaurants.filter((restaurant) => (cuisine === 'All' || cuisine === restaurant.cuisine) && `${restaurant.name} ${restaurant.cuisine}`.toLowerCase().includes(query.toLowerCase())); const customerOrders = orders.filter((order) => order.customer_id === session.id); const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0); const add = (item) => { if (!item) return notify('This kitchen is still setting the table'); setCart((current) => current.some((line) => line.id === item.id) ? current.map((line) => line.id === item.id ? { ...line, qty: line.qty + 1 } : line) : [...current, { ...item, qty: 1, notes: '' }]); notify(`${item.name} added to your bag`, 'success'); }; const place = async (payment) => { const first = cart[0]; await createOrder({ customer_id: session.id, restaurant_id: first.restaurantId || first.restaurant_id, total_amount: total + 49, delivery_address: address, items: cart.map(({ id, name, qty, notes, price }) => ({ id, name, qty, notes, price })) }); setCart([]); setCartOpen(false); notify(`Payment ${payment.payment_reference} approved — order placed`, 'success'); navigate('/customer/orders'); }; if (ordersOnly) return <div className="content orders-view"><button className="back-btn" onClick={() => navigate('/customer')}>← Back to discover</button><div className="section-head"><div><p className="eyebrow">Your table, wherever you are</p><h2>Orders & history</h2></div></div>{customerOrders.length ? customerOrders.map((order) => <div className="order-card" key={order.id}><div className="order-top"><div><span className="order-id">{order.id}</span><h3>{order.restaurant}</h3><p>{order.created_at} · {money(order.total_amount)}</p></div><span className={`status status-${order.status.replaceAll('_', '-').toLowerCase()}`}>{statusLabels[order.status] || order.status}</span></div><StatusTracker status={order.status}/><p className="order-address"><MapPin size={15}/>{order.delivery_address}</p></div>) : <div className="empty"><span>🛍</span><p>Your order history is ready for a good idea.</p></div>}</div>; return <div className="content"><section className="hero-banner"><div><p className="eyebrow">Curated for your Tuesday</p><h1>Eat <i>curiously.</i></h1><p>From your favourite comfort to the next thing you’ll obsess over.</p></div><div className="hero-stamp">NEW<br/><span>TABLE</span></div></section><div className="section-head"><div><p className="eyebrow">The neighbourhood edit</p><h2>Find your next favourite</h2></div><button className="text-btn" onClick={() => navigate('/customer/orders')}>Your orders <ArrowRight size={15}/></button></div><div className="filters"><div className="search-field"><Search size={16}/><input aria-label="Search restaurants" placeholder="Search a dish or restaurant" value={query} onChange={(e) => setQuery(e.target.value)}/></div><div className="chips">{cuisines.map((item) => <button className={cuisine === item ? 'chip active' : 'chip'} onClick={() => setCuisine(item)} key={item}>{item}</button>)}</div><button className="filter-btn" onClick={() => notify('Choose a cuisine chip to filter your table', 'info')}><Filter size={15}/> Filters</button></div><div className="restaurant-grid">{filtered.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} items={menuItems} onAdd={add} onOpen={() => setSelected(restaurant)}/>)}</div><div className="bag-float" role="button" tabIndex="0" onClick={() => setCartOpen(true)} onKeyDown={(e) => e.key === 'Enter' && setCartOpen(true)}><ShoppingBag size={19}/><span>{cart.reduce((sum, item) => sum + item.qty, 0)} items</span><strong>{money(total)}</strong></div>{selected && <MenuDialog restaurant={selected} items={menuItems.filter((item) => (item.restaurantId || item.restaurant_id) === selected.id)} onAdd={add} onClose={() => setSelected(null)}/>}<CartReview open={cartOpen} cart={cart} address={address} setAddress={setAddress} setCart={setCart} total={total} onClose={() => setCartOpen(false)} onContinue={() => { if (cart.length) { setCartOpen(false); setPaymentOpen(true); } }} /><PaymentModal open={paymentOpen && cart.length > 0} onOpenChange={setPaymentOpen} total={total + 49} onPaid={place}/></div>; }

function RestaurantCard({ restaurant, items, onAdd, onOpen }) {
  const item = items.find((candidate) => (candidate.restaurantId || candidate.restaurant_id) === restaurant.id);
  const img = restaurant.image_url || restaurant.imageUrl;
  const emoji = restaurant.image || '🍽️';
  const tag = restaurant.tag || 'New kitchen';
  const eta = restaurant.eta || restaurant.delivery_time || '25–35 min';
  const color = restaurant.color || '#f0dfba';
  const rating = restaurant.rating ?? 5;

  return (
    <article className="restaurant-card">
      <div className="restaurant-image" style={{ background: color }}>
        <span className="tag">{tag}</span>
        {img ? <img src={img} alt={`${restaurant.name} food`} /> : <em>{emoji}</em>}
        <button className="quick-add" aria-label={`Add ${item?.name || restaurant.name}`} onClick={() => onAdd(item)}><Plus size={18}/></button>
      </div>
      <div className="restaurant-info">
        <div>
          <h3>{restaurant.name}</h3>
          <p>{restaurant.cuisine} · {eta}</p>
        </div>
        <span className="rating"><Star size={13} fill="currentColor"/> {rating}</span>
      </div>
      <button className="card-link" onClick={onOpen}>See menu <ArrowRight size={14}/></button>
    </article>
  );
}

function MenuDialog({ restaurant, items, onAdd, onClose }) {
  const img = restaurant.image_url || restaurant.imageUrl;
  const emoji = restaurant.image || '🍽️';
  const eta = restaurant.eta || restaurant.delivery_time || '25–35 min';

  return (
    <div className="modal-backdrop">
      <div className="item-modal" role="dialog" aria-modal="true">
        <button className="close" aria-label="Close menu" onClick={onClose}><X/></button>
        <div className="item-hero" style={{ background: restaurant.color || '#f2dfb6' }}>
          {img ? (
            <img src={img} alt={`${restaurant.name} food`} />
          ) : items.length > 0 && items.some((i) => i.image || i.imageUrl || i.image_url) ? (
            items.map((item) => <span key={item.id}>{item.image || '🍱'}</span>)
          ) : (
            <em>{emoji}</em>
          )}
        </div>
        <p className="eyebrow">{restaurant.cuisine} · {eta}</p>
        <h2>{restaurant.name}</h2>
        <p className="muted">{restaurant.description || 'Made for your neighbourhood.'}</p>
        {items.map((item) => {
          const itemImg = item.image_url || item.imageUrl;
          const itemEmoji = item.image || '🍱';
          return (
            <button className="menu-line" onClick={() => onAdd(item)} key={item.id}>
              <span>
                {itemImg ? <img src={itemImg} alt="" /> : <em>{itemEmoji}</em>}
                <strong>{item.name}</strong>
                <small>{item.description}</small>
              </span>
              <b>{money(item.price)} <Plus size={15}/></b>
            </button>
          );
        })}
      </div>
    </div>
  );
}
