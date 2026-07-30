import React from 'react';
import { ChevronDown, DollarSign, LayoutDashboard, LogOut, Menu, Package, Settings2, Store, Users, Search, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const rolePath = { customer: '/customer', driver: '/driver', admin: '/admin' };

export function AppShell({ children }) {
  const { session, logout, notify } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(() => window.localStorage.getItem('miso-sidebar-collapsed') === 'true');
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const isActive = (path) => location.pathname === path;
  const go = (path) => { setMobileOpen(false); navigate(path); };
  const toggleSidebar = () => setSidebarCollapsed((collapsed) => {
    const next = !collapsed;
    window.localStorage.setItem('miso-sidebar-collapsed', String(next));
    return next;
  });
  const settingsPath = `${rolePath[session.role]}/settings`;
  const nav = session.role === 'customer' ? [{ path: '/customer', label: 'Discover', icon: LayoutDashboard }, { path: '/customer/orders', label: 'Your orders', icon: Package }] : session.role === 'driver' ? [{ path: '/driver', label: 'Overview', icon: LayoutDashboard }, { path: '/driver/earnings', label: 'Earnings', icon: DollarSign }] : [{ path: '/admin', label: 'Overview', icon: LayoutDashboard }, { path: '/admin/orders', label: 'Orders', icon: Package }, { path: '/admin/restaurants', label: 'Restaurants', icon: Store }, { path: '/admin/partners', label: 'Partners', icon: Users }];
  const sidebarClass = ['sidebar', sidebarCollapsed ? 'sidebar-collapsed' : '', mobileOpen ? 'mobile-open' : ''].filter(Boolean).join(' ');
  return <div className="app-shell"><aside className={sidebarClass}><div className="sidebar-brand-row"><div className="brand">miso<span>•</span></div><button className="sidebar-toggle" onClick={toggleSidebar} aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>{sidebarCollapsed ? <PanelLeftOpen size={17}/> : <PanelLeftClose size={17}/>}</button></div><button className="workspace workspace-button" onClick={() => setSettingsOpen(true)} aria-label="Open profile actions"><div className={`avatar avatar-${session.role}`}>{session.name[0]}</div><div><strong>{session.name}</strong><small>{session.role === 'driver' ? 'Delivery partner' : session.role === 'admin' ? 'Operations' : 'Customer'}</small></div><ChevronDown size={15}/></button><nav><p className="nav-label">Workspace</p>{nav.map(({ path, label, icon: Icon }) => <button className={isActive(path) ? 'nav-item active' : 'nav-item'} key={path} onClick={() => go(path)} title={sidebarCollapsed ? label : undefined}><Icon size={18}/><span>{label}</span>{label === 'Your orders' && <b>{session.role === 'customer' ? '2' : ''}</b>}</button>)}<p className="nav-label lower">Personal</p><button className={isActive(settingsPath) ? 'nav-item active' : 'nav-item'} onClick={() => go(settingsPath)} title={sidebarCollapsed ? 'Settings' : undefined}><Settings2 size={18}/><span>Settings</span></button></nav><button className="logout" onClick={logout} title={sidebarCollapsed ? 'Sign out' : undefined}><LogOut size={17}/><span>Sign out</span></button>{settingsOpen && <QuickActions onClose={() => setSettingsOpen(false)} onSettings={() => { setSettingsOpen(false); go(settingsPath); }} />}</aside><main className="main"><Topbar onMenu={() => setMobileOpen((open) => !open)} onProfile={() => setSettingsOpen(true)} />{children}</main></div>;
}

function Topbar({ onMenu, onProfile }) { const { session, notify } = useApp(); const search = () => { const input = document.querySelector('.search-field input'); if (input) input.focus(); else notify('Use the page filters to narrow this view', 'info'); }; return <header className="topbar"><button className="mobile-menu" aria-label="Toggle navigation" onClick={onMenu}><Menu size={21}/></button><div><p className="eyebrow">{session.role === 'customer' ? 'Tuesday, 28 July 2026' : 'Live operations'}</p><h3>{session.role === 'customer' ? 'What are you craving?' : session.role === 'driver' ? `Ready when you are, ${session.name.split(' ')[0]}.` : `Good morning, ${session.name.split(' ')[0]}.`}</h3></div><div className="top-actions"><button className="icon-btn" aria-label="Focus search" onClick={search}><Search size={18}/></button><button className="top-avatar" aria-label="Open settings" onClick={onProfile}>{session.name[0]}</button></div></header>; }

function QuickActions({ onClose, onSettings }) { const { session, logout } = useApp(); return <div className="settings-overlay"><section className="quick-actions-panel" role="dialog" aria-modal="true" aria-label="Profile actions"><button className="close" aria-label="Close profile actions" onClick={onClose}><X/></button><div className="settings-profile"><div className={`settings-avatar avatar-${session.role}`}>{session.name[0]}</div><div><p className="eyebrow">{session.role} account</p><h2>{session.name}</h2><small>{session.email}</small></div></div><div className="quick-actions-list"><button onClick={onSettings}><Settings2 size={17}/><span><strong>Open full settings</strong><small>Manage your account and workspace preferences</small></span><ChevronDown size={15}/></button><button onClick={onClose}><Users size={17}/><span><strong>Account status</strong><small>{session.status === 'online' ? 'Currently online' : 'Currently offline'}</small></span></button><button onClick={logout} className="quick-danger"><LogOut size={17}/><span><strong>Sign out</strong><small>End this session securely</small></span></button></div></section></div>; }
