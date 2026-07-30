import React, { useState } from 'react';
import { ArrowRight, Car, ShieldCheck, UserRound } from 'lucide-react';
import { useApp } from '../context/AppContext';

const roleDefaults = {
  customer: { email: 'maya@miso.app', phone: '', address: '', dietary: 'No preference' },
  driver: { email: 'arjun@miso.app', phone: '', vehicleType: 'Motorcycle', vehicleRegistration: '', licenseNumber: '', coverageArea: 'Bandra West' },
  admin: { email: 'nia@miso.app', phone: '', teamName: '', employeeId: '', approvalCode: '' },
};

const roleCopy = {
  customer: { label: 'Customer', icon: '🍽', title: 'Make every meal yours.', description: 'Save your delivery details so your next good idea arrives without friction.' },
  driver: { label: 'Partner', icon: '🚲', title: 'Get moving with miso.', description: 'Tell us how to reach you and which vehicle will carry every handoff.' },
  admin: { label: 'Admin', icon: '✦', title: 'Set up your operations desk.', description: 'Add the team details needed to manage restaurants, orders, and partners.' },
};

export function AuthPage() {
  const { login, signup, notify } = useApp();
  const [mode, setMode] = useState('login');
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: roleDefaults.customer.email, password: 'password' });
  const [details, setDetails] = useState(roleDefaults.customer);
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';
  const copy = roleCopy[role];
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const setDetail = (key, value) => setDetails((current) => ({ ...current, [key]: value }));
  const selectRole = (value) => { setRole(value); setForm((current) => ({ ...current, email: roleDefaults[value].email })); setDetails(roleDefaults[value]); };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try { await (isSignup ? signup({ ...form, role, details }) : login({ ...form, role })); }
    catch (error) { notify(error.message, 'error'); }
    finally { setBusy(false); }
  };
  const workspaceLabel = { customer: 'Let’s get this bread', driver: 'Hit the road', admin: 'Run the show' }[role];
  return <div className="auth"><div className="auth-art"><div className="wordmark">miso<span>•</span></div><div className="art-copy"><p className="eyebrow">A better bite, together</p><h1>Good food<br/><i>finds</i> you.</h1><p>Discover the places making your neighbourhood delicious.</p></div><div className="food-orbit"><span>🍣</span><span>🍛</span><span>🥐</span><span>🍝</span></div></div><form className={`auth-card ${isSignup ? 'auth-signup' : ''}`} onSubmit={submit}><div className="mobile-wordmark">miso<span>•</span></div><p className="eyebrow">{isSignup ? 'Join the table' : 'Welcome back'}</p><h2>{isSignup ? 'Create your miso account' : 'Sign in to miso'}</h2><p className="muted">Choose your workspace to continue.</p><div className="role-tabs">{Object.entries(roleCopy).map(([value, item]) => <button type="button" className={role === value ? 'selected' : ''} onClick={() => selectRole(value)} key={value}><span>{item.icon}</span>{item.label}</button>)}</div>{isSignup && <><div className="signup-intro"><span className={`signup-role-icon signup-${role}`}><RoleIcon role={role}/></span><div><strong>{copy.title}</strong><small>{copy.description}</small></div></div><label>Full name<input value={form.name} onChange={(e) => setField('name', e.target.value)} placeholder={role === 'admin' ? 'e.g. Nia Shah' : role === 'driver' ? 'e.g. Arjun Mehta' : 'e.g. Maya Iyer'} required/></label></>}<label>Email address<input type="email" required value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="you@example.com"/></label>{isSignup && <SignupDetails role={role} details={details} setDetail={setDetail}/>}<label>Password<input type="password" required minLength="6" value={form.password} onChange={(e) => setField('password', e.target.value)}/></label><button className="primary wide" type="submit" disabled={busy}>{busy ? 'Connecting…' : isSignup ? 'Create account' : workspaceLabel} <ArrowRight size={17}/></button><p className="auth-switch">{isSignup ? 'Already have an account?' : 'New to miso?'} <button type="button" onClick={() => setMode(isSignup ? 'login' : 'signup')}>{isSignup ? 'Sign in' : 'Create account'}</button></p><p className="demo-hint">Demo: maya@miso.app · arjun@miso.app · nia@miso.app · any password</p></form></div>;
}

function SignupDetails({ role, details, setDetail }) {
  if (role === 'customer') return <div className="signup-detail-grid"><label>Phone number<input type="tel" value={details.phone} onChange={(e) => setDetail('phone', e.target.value)} placeholder="+91 98765 43210" required/></label><label>Dietary preference<select value={details.dietary} onChange={(e) => setDetail('dietary', e.target.value)}><option>No preference</option><option>Vegetarian</option><option>Vegan</option><option>No nuts</option></select></label><label className="signup-full"><span>Primary delivery address</span><input value={details.address} onChange={(e) => setDetail('address', e.target.value)} placeholder="Flat, street, neighbourhood" required/></label></div>;
  if (role === 'driver') return <div className="signup-detail-grid"><label>Phone number<input type="tel" value={details.phone} onChange={(e) => setDetail('phone', e.target.value)} placeholder="+91 98765 43210" required/></label><label>Vehicle type<select value={details.vehicleType} onChange={(e) => setDetail('vehicleType', e.target.value)}><option>Motorcycle</option><option>Scooter</option><option>Bicycle</option></select></label><label>Registration number<input value={details.vehicleRegistration} onChange={(e) => setDetail('vehicleRegistration', e.target.value)} placeholder="MH 01 AB 1234" required/></label><label>Driving licence number<input value={details.licenseNumber} onChange={(e) => setDetail('licenseNumber', e.target.value)} placeholder="DL-0420230000" required/></label><label className="signup-full">Preferred delivery zone<select value={details.coverageArea} onChange={(e) => setDetail('coverageArea', e.target.value)}><option>Bandra West</option><option>Bandra East</option><option>Khar</option><option>Santacruz</option></select></label></div>;
  return <div className="signup-detail-grid"><label>Phone number<input type="tel" value={details.phone} onChange={(e) => setDetail('phone', e.target.value)} placeholder="+91 98765 43210" required/></label><label>Team / company<input value={details.teamName} onChange={(e) => setDetail('teamName', e.target.value)} placeholder="e.g. Miso Operations" required/></label><label>Employee ID<input value={details.employeeId} onChange={(e) => setDetail('employeeId', e.target.value)} placeholder="OPS-1042" required/></label><label>Admin invite code<input value={details.approvalCode} onChange={(e) => setDetail('approvalCode', e.target.value)} placeholder="Provided by workspace owner" required/></label></div>;
}

function RoleIcon({ role }) { return role === 'customer' ? <UserRound size={17}/> : role === 'driver' ? <Car size={17}/> : <ShieldCheck size={17}/>; }
