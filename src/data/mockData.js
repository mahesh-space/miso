export const mockUsers = [
  { id: 'u1', name: 'Maya Iyer', email: 'maya@miso.app', role: 'customer', phone: '+91 98765 43210', status: 'online', account_status: 'active' },
  { id: 'd1', name: 'Arjun Mehta', email: 'arjun@miso.app', role: 'driver', phone: '+91 98765 43211', status: 'online', account_status: 'active' },
  { id: 'a1', name: 'Nia Shah', email: 'nia@miso.app', role: 'admin', phone: '+91 98765 43212', status: 'online', account_status: 'active' },
];

export const mockRestaurants = [
  { id: 'r1', name: 'Kismet Kitchen', cuisine: 'Modern Indian', rating: 4.8, eta: '24–32 min', fee: 0, tag: 'Editor’s pick', color: '#e9b949', image: '🍛', imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=85', address: 'Linking Road, Bandra West', description: 'Small plates, big soul.' },
  { id: 'r2', name: 'Nori Social Club', cuisine: 'Japanese', rating: 4.7, eta: '18–26 min', fee: 29, tag: 'Trending', color: '#e86a4a', image: '🍣', imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=900&q=85', address: 'Hill Road, Bandra West', description: 'Tokyo flavours, city energy.' },
  { id: 'r3', name: 'Pasta Radio', cuisine: 'Italian', rating: 4.6, eta: '28–36 min', fee: 19, tag: 'Comfort food', color: '#a2cf51', image: '🍝', imageUrl: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=900&q=85', address: 'Pali Naka, Bandra West', description: 'Handmade, never hurried.' },
  { id: 'r4', name: 'Pão & Poetry', cuisine: 'Bakery', rating: 4.9, eta: '15–22 min', fee: 0, tag: 'New in town', color: '#d5a07c', image: '🥐', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=900&q=85', address: 'Waterfield Road, Bandra West', description: 'A little Paris, no flight needed.' },
];

export const mockMenuItems = [
  { id: 'i1', restaurantId: 'r1', name: 'Miso butter naan', description: 'Charred naan, cultured butter, black sesame', price: 180, category: 'Popular', image: '🫓', imageUrl: 'https://images.unsplash.com/photo-1601050690117-94f5f6fa8bd7?auto=format&fit=crop&w=500&q=85', rating: 4.9, is_available: true },
  { id: 'i2', restaurantId: 'r1', name: 'Smoked paneer tikka', description: 'Coal smoked paneer, green chilli chutney', price: 320, category: 'Mains', image: '🥘', imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=500&q=85', rating: 4.8, is_available: true },
  { id: 'i3', restaurantId: 'r2', name: 'Salmon aburi don', description: 'Torched salmon, sushi rice, ikura', price: 490, category: 'Popular', image: '🍣', imageUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=85', rating: 4.9, is_available: true },
  { id: 'i4', restaurantId: 'r2', name: 'Miso caramel mochi', description: 'Three soft bites with sea salt', price: 210, category: 'Dessert', image: '🍡', imageUrl: 'https://images.unsplash.com/photo-1582176604856-e824b4736522?auto=format&fit=crop&w=500&q=85', rating: 4.7, is_available: true },
  { id: 'i5', restaurantId: 'r3', name: 'Rigatoni vodka rosé', description: 'Tomato, parmesan, Calabrian chilli', price: 380, category: 'Popular', image: '🍝', imageUrl: 'https://images.unsplash.com/photo-1551892374-ecf8754cf8b0?auto=format&fit=crop&w=500&q=85', rating: 4.8, is_available: true },
  { id: 'i6', restaurantId: 'r3', name: 'Tiramisu cloud', description: 'Mascarpone, espresso, cocoa', price: 240, category: 'Dessert', image: '🍰', imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=85', rating: 4.6, is_available: true },
  { id: 'i7', restaurantId: 'r4', name: 'Pistachio morning bun', description: 'Laminated pastry, pistachio cream', price: 190, category: 'Popular', image: '🥐', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=85', rating: 4.9, is_available: true },
  { id: 'i8', restaurantId: 'r4', name: 'Rosemary focaccia', description: 'Olive oil, flaky salt, fresh rosemary', price: 160, category: 'Mains', image: '🍞', imageUrl: 'https://images.unsplash.com/photo-1586444248902-2f64eddc13df?auto=format&fit=crop&w=500&q=85', rating: 4.8, is_available: true },
];

export const mockOrders = [
  { id: 'ORD-1048', customer_id: 'u1', customer: 'Maya Iyer', restaurant_id: 'r1', restaurant: 'Kismet Kitchen', items: [{ name: 'Miso butter naan', qty: 2, notes: '' }], total_amount: 509, delivery_address: '14, Palm Grove, Bandra West', driver_id: 'd1', partner: 'Arjun Mehta', status: 'picked_up', created_at: 'Today, 12:42 PM' },
  { id: 'ORD-1047', customer_id: 'u1', customer: 'Maya Iyer', restaurant_id: 'r2', restaurant: 'Nori Social Club', items: [{ name: 'Salmon aburi don', qty: 1, notes: '' }], total_amount: 519, delivery_address: '14, Palm Grove, Bandra West', driver_id: 'd1', partner: 'Arjun Mehta', status: 'delivered', created_at: 'Yesterday, 8:10 PM' },
];

export const statusSteps = ['placed', 'preparing', 'picked_up', 'delivered'];
export const statusLabels = { placed: 'Placed', preparing: 'Preparing', picked_up: 'Out for Delivery', delivered: 'Delivered' };
export const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;
