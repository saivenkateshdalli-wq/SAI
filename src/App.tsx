/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Cpu, 
  Settings, 
  Building2, 
  Zap, 
  Info, 
  Calendar, 
  Image as ImageIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Upload,
  User,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Lock,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  LogOut,
  Users as UsersIcon,
  Trash2
} from 'lucide-react';

// --- Types ---
interface UserRequest {
  id: string;
  name: string;
  email: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  studentId?: string;
}

// --- Types ---
interface StudentData {
  fullName: string;
  rollNumber: string;
  branch: string;
  year: string;
  photo: string | null;
  studentId?: string;
}

// --- Components ---

const AdminPanel = ({ onLogout }: { onLogout: () => void }) => {
  const [users, setUsers] = useState<UserRequest[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'requests' | 'feedback'>('requests');

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFeedback = async () => {
    try {
      const res = await fetch('/api/admin/feedback');
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([fetchUsers(), fetchFeedback()]);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateStatus = async (userId: string, status: string) => {
    try {
      const res = await fetch('/api/admin/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to update status'}`);
        return;
      }
      
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  const deleteRequest = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this request?')) return;
    try {
      const res = await fetch(`/api/admin/delete-request/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errorData = await res.json();
        alert(`Error: ${errorData.error || 'Failed to delete request'}`);
        return;
      }
      await fetchUsers();
    } catch (err) {
      console.error(err);
      alert('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gold-500 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8" /> Admin Panel
            </h1>
            <p className="text-slate-400 mt-2 italic">Review and manage student access requests</p>
          </div>
          <div className="flex items-center gap-4">
            {activeTab === 'requests' && users.some(u => u.status === 'pending') && (
              <button 
                onClick={async () => {
                  if (!confirm('Approve all pending requests?')) return;
                  const pending = users.filter(u => u.status === 'pending');
                  for (const user of pending) {
                    await updateStatus(user.id, 'approved');
                  }
                }}
                className="flex items-center gap-2 px-6 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-full transition-all text-sm font-bold"
              >
                <CheckCircle2 className="w-4 h-4" /> Approve All
              </button>
            )}
            <div className="flex bg-navy-800 p-1 rounded-full border border-navy-700">
              <button 
                onClick={() => setActiveTab('requests')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-gold-500 text-navy-900' : 'text-slate-400 hover:text-white'}`}
              >
                Requests
              </button>
              <button 
                onClick={() => setActiveTab('feedback')}
                className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === 'feedback' ? 'bg-gold-500 text-navy-900' : 'text-slate-400 hover:text-white'}`}
              >
                Feedback
              </button>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-6 py-2 bg-navy-800 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-full transition-all"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold-500"></div>
          </div>
        ) : activeTab === 'requests' ? (
          <div className="grid gap-6">
            {users.length === 0 ? (
              <div className="text-center py-20 bg-navy-800/50 rounded-3xl border border-navy-700">
                <UsersIcon className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No access requests found.</p>
              </div>
            ) : (
              users.map((user) => (
                <motion.div 
                  key={user.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-navy-800/50 p-6 rounded-3xl border border-navy-700 flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{user.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                        user.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    <p className="text-slate-400 text-sm mb-2">{user.email}</p>
                    {user.studentId && (
                      <p className="text-gold-500/80 text-xs font-mono mb-2 flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> {user.studentId}
                      </p>
                    )}
                    <p className="text-slate-500 text-sm italic">"{user.reason}"</p>
                    <p className="text-[10px] text-slate-600 mt-4 uppercase tracking-widest">Requested: {new Date(user.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {user.status !== 'approved' && (
                      <button 
                        onClick={() => updateStatus(user.id, 'approved')}
                        className="px-6 py-2 bg-green-500 hover:bg-green-600 text-navy-900 font-bold rounded-full transition-all"
                      >
                        Approve
                      </button>
                    )}
                    {user.status !== 'rejected' && (
                      <button 
                        onClick={() => updateStatus(user.id, 'rejected')}
                        className="px-6 py-2 bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 font-bold rounded-full transition-all"
                      >
                        Reject
                      </button>
                    )}
                    <button 
                      onClick={() => deleteRequest(user.id)}
                      className="p-2 bg-red-500/10 hover:bg-red-500/30 text-red-400 border border-red-500/20 rounded-full transition-all"
                      title="Delete Request"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {feedback.length === 0 ? (
              <div className="text-center py-20 bg-navy-800/50 rounded-3xl border border-navy-700">
                <Mail className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No feedback received yet.</p>
              </div>
            ) : (
              feedback.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-navy-800/50 p-6 rounded-3xl border border-navy-700"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-xl font-bold">{item.studentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.type === 'issue' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-gold-500/20 text-gold-400 border border-gold-500/30'
                        }`}>
                          {item.type}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm">{item.studentEmail}</p>
                    </div>
                    <p className="text-[10px] text-slate-600 uppercase tracking-widest">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="bg-navy-900/50 p-4 rounded-2xl border border-navy-700">
                    <p className="text-slate-300 italic">"{item.message}"</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const VerificationGate = ({ onApproved }: { onApproved: (studentId: string) => void }) => {
  const [view, setView] = useState<'register' | 'status' | 'admin-login'>('register');
  const [formData, setFormData] = useState({ name: '', email: '', reason: '' });
  const [adminPassword, setAdminPassword] = useState('');
  const [statusEmail, setStatusEmail] = useState('');
  const [userStatus, setUserStatus] = useState<UserRequest | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true);

  useEffect(() => {
    const savedEmail = localStorage.getItem('vignan_user_email');
    if (savedEmail) {
      checkStatus(savedEmail);
    }
  }, []);

  const checkStatus = async (email: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/status/${email}`);
      if (res.ok) {
        const data = await res.json();
        setUserStatus(data);
        if (data.status === 'approved') {
          onApproved(data.studentId);
        } else {
          setView('status');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('vignan_user_email', data.email);
        setUserStatus(data);
        setView('status');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword }),
      });
      if (res.ok) {
        setIsAdminMode(true);
      } else {
        setError('Invalid admin password');
      }
    } catch (err) {
      setError('Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (isAdminMode) {
    return <AdminPanel onLogout={() => setIsAdminMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-navy-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-navy-800/50 backdrop-blur-xl border border-navy-700 rounded-[2.5rem] p-8 md:p-10 relative z-10 shadow-2xl"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-gold-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gold-500/20">
            <Lock className="w-10 h-10 text-gold-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Verification Gate</h2>
          <p className="text-slate-400 italic">Access restricted to verified students</p>
        </div>

        <AnimatePresence mode="wait">
          {view === 'register' && (
            <motion.form 
              key="register"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRegister}
              className="space-y-6"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Full Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">College Email</label>
                  <input 
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                    placeholder="example@vignanlara.org"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Reason for Access</label>
                  <textarea 
                    required
                    value={formData.reason}
                    onChange={(e) => setFormData({...formData, reason: e.target.value})}
                    className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all h-24 resize-none"
                    placeholder="Why do you need access to the student portal?"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-bold rounded-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-gold-500/20"
              >
                {loading ? 'Submitting...' : 'Request Verification'}
              </button>

              <div className="text-center pt-4">
                <button 
                  type="button"
                  onClick={() => setView('status')}
                  className="text-gold-500/60 hover:text-gold-500 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Check Existing Status
                </button>
              </div>
            </motion.form>
          )}

          {view === 'status' && (
            <motion.div 
              key="status"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              {!userStatus ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Enter Registered Email</label>
                    <input 
                      type="email"
                      value={statusEmail}
                      onChange={(e) => setStatusEmail(e.target.value)}
                      className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                      placeholder="example@vignanlara.org"
                    />
                  </div>
                  <button 
                    onClick={() => checkStatus(statusEmail)}
                    disabled={loading}
                    className="w-full py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-bold rounded-2xl transition-all"
                  >
                    {loading ? 'Checking...' : 'Check Status'}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-6">
                  <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 border ${
                    userStatus.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                    userStatus.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                    'bg-gold-500/10 border-gold-500/20 text-gold-500'
                  }`}>
                    {userStatus.status === 'approved' ? <CheckCircle2 className="w-10 h-10" /> :
                     userStatus.status === 'rejected' ? <X className="w-10 h-10" /> :
                     <Clock className="w-10 h-10 animate-pulse" />}
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {userStatus.status === 'approved' ? 'Access Granted!' :
                       userStatus.status === 'rejected' ? 'Access Denied' :
                       'Request Pending'}
                    </h3>
                    <p className="text-slate-400 italic">
                      {userStatus.status === 'approved' ? 'Welcome back, ' + userStatus.name :
                       userStatus.status === 'rejected' ? 'Your request was not approved at this time.' :
                       'Our admin team is reviewing your request.'}
                    </p>
                  </div>

                  {userStatus.status === 'approved' && (
                    <button 
                      onClick={() => onApproved(userStatus.studentId!)}
                      className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-2xl transition-all"
                    >
                      Enter Portal
                    </button>
                  )}

                  {userStatus.status === 'rejected' && (
                    <button 
                      onClick={() => {
                        localStorage.removeItem('vignan_user_email');
                        setUserStatus(null);
                        setView('register');
                      }}
                      className="w-full py-4 bg-navy-700 hover:bg-navy-600 text-white font-bold rounded-2xl transition-all"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              )}

              <div className="text-center pt-4">
                <button 
                  onClick={() => setView('register')}
                  className="text-gold-500/60 hover:text-gold-500 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Back to Registration
                </button>
              </div>
            </motion.div>
          )}

          {view === 'admin-login' && (
            <motion.form 
              key="admin-login"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              onSubmit={handleAdminLogin}
              className="space-y-6"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Admin Password</label>
                <input 
                  required
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-navy-700 hover:bg-navy-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all"
              >
                {loading ? 'Logging in...' : 'Login to Admin Panel'}
              </button>

              <div className="text-center pt-4">
                <button 
                  type="button"
                  onClick={() => setView('register')}
                  className="text-gold-500/60 hover:text-gold-500 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Back to Registration
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-navy-700/50 flex justify-center gap-8">
          <button 
            onClick={() => setView('admin-login')}
            className="flex items-center gap-2 text-slate-600 hover:text-gold-500/60 text-[10px] uppercase tracking-[0.2em] font-bold transition-all"
          >
            <ShieldCheck className="w-3 h-3" /> Admin Access
          </button>
          <button 
            onClick={() => onApproved('DEV-BYPASS-MODE')}
            className="flex items-center gap-2 text-slate-600 hover:text-gold-500/60 text-[10px] uppercase tracking-[0.2em] font-bold transition-all"
          >
            <Zap className="w-3 h-3" /> Bypass Gate
          </button>
        </div>
      </motion.div>
    </div>
  );
};
const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  const text = "Vignan's LARA";
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 800);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-navy-900"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="flex mb-8">
        {text.split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="text-4xl md:text-7xl font-display font-bold text-gold-500 gold-glow"
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </div>
      <div className="w-64 h-1 bg-navy-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gold-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 text-gold-500/60 font-mono text-sm tracking-widest"
      >
        LOADING EXCELLENCE...
      </motion.p>
    </motion.div>
  );
};

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Students', href: '#students' },
    { name: 'Departments', href: '#departments' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${isScrolled ? 'bg-navy-900/95 backdrop-blur-md py-4 shadow-lg' : 'bg-transparent py-6'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center font-display font-bold text-navy-900 text-xl">V</div>
          <span className="font-display font-bold text-2xl text-white tracking-tight">LARA<span className="text-gold-500">.</span></span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-sm font-medium text-slate-300 hover:text-gold-500 transition-colors uppercase tracking-wider"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-navy-800 border-b border-navy-700 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-lg font-medium text-slate-300 hover:text-gold-500"
                >
                  {link.name}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const IDCardGenerator = ({ studentId }: { studentId: string }) => {
  const [student, setStudent] = useState<StudentData>({
    fullName: '',
    rollNumber: '',
    branch: 'CSE',
    year: '1st Year',
    photo: null,
  });
  const [isVerified, setIsVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState('');
  const [showCard, setShowCard] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleVerify = () => {
    if (!student.rollNumber || student.rollNumber.length < 10) {
      setVerificationError('Please enter a valid 10-digit Roll Number.');
      return;
    }
    
    setIsVerifying(true);
    setVerificationError('');
    
    // Simulate API call for verification
    setTimeout(() => {
      const roll = student.rollNumber.toUpperCase();
      const isValidRoll = roll.startsWith('21FE') || 
                          roll.startsWith('22FE') ||
                          roll.startsWith('23FE') ||
                          roll.startsWith('24FE') ||
                          roll.startsWith('25FE');
      
      if (isValidRoll) {
        setIsVerified(true);
      } else {
        setVerificationError('Identity not found in college database. Please check your Roll Number.');
      }
      setIsVerifying(false);
    }, 1500);
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudent({ ...student, photo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section id="students" className="py-24 bg-navy-900">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Digital Identity</h2>
          <p className="text-slate-400 max-w-2xl mx-auto italic">Generate your official Vignan's LARA digital student ID card instantly.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-navy-800 p-8 rounded-2xl border border-navy-700 shadow-xl"
          >
            <h3 className="text-2xl font-display font-bold mb-6 text-gold-500 flex items-center gap-2">
              <User className="w-6 h-6" /> Student Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  placeholder="Enter your full name"
                  value={student.fullName}
                  onChange={(e) => setStudent({ ...student, fullName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Roll Number</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      className={`w-full bg-navy-900 border ${isVerified ? 'border-green-500/50' : 'border-navy-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-colors pr-10`}
                      placeholder="e.g. 21FE1A0501"
                      value={student.rollNumber}
                      onChange={(e) => {
                        setStudent({ ...student, rollNumber: e.target.value });
                        setIsVerified(false);
                        setVerificationError('');
                      }}
                    />
                    {isVerified && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </motion.div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Branch</label>
                  <select 
                    className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-colors"
                    value={student.branch}
                    onChange={(e) => setStudent({ ...student, branch: e.target.value })}
                  >
                    <option>CSE</option>
                    <option>CSD - A</option>
                    <option>ECE</option>
                    <option>MECH</option>
                    <option>CIVIL</option>
                    <option>EEE</option>
                    <option>IT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Year of Study</label>
                <select 
                  className="w-full bg-navy-900 border border-navy-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-gold-500 transition-colors"
                  value={student.year}
                  onChange={(e) => setStudent({ ...student, year: e.target.value })}
                >
                  <option>1st Year</option>
                  <option>2nd Year</option>
                  <option>3rd Year</option>
                  <option>4th Year</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Passport Photo</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-32 border-2 border-dashed border-navy-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-gold-500 transition-colors group"
                >
                  {student.photo ? (
                    <img src={student.photo} alt="Preview" className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-500 group-hover:text-gold-500 mb-2" />
                      <span className="text-sm text-slate-500">Click to upload photo</span>
                    </>
                  )}
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handlePhotoUpload}
                />
              </div>

              {verificationError && (
                <motion.p 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-xs font-medium"
                >
                  {verificationError}
                </motion.p>
              )}

              {!isVerified ? (
                <button 
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full bg-navy-900 border border-gold-500/50 text-gold-500 hover:bg-gold-500 hover:text-navy-900 font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isVerifying ? (
                    <>
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full"
                      />
                      Verifying Identity...
                    </>
                  ) : (
                    <>Verify Identity</>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => setShowCard(true)}
                  className="w-full bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 mt-4 shadow-lg shadow-gold-500/20"
                >
                  Generate ID Card
                </button>
              )}
            </div>
          </motion.div>

          {/* ID Card Preview */}
          <div className="flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {showCard ? (
                <motion.div 
                  key="id-card"
                  initial={{ opacity: 0, y: 50, rotateX: 20 }}
                  animate={{ opacity: 1, y: 0, rotateX: 0 }}
                  className="w-full max-w-[340px] aspect-[1/1.58] bg-navy-800/90 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 shadow-2xl relative overflow-hidden flex flex-col items-center text-center id-card-texture"
                >
                  {/* Modern Header */}
                  <div className="w-full flex flex-col items-center mb-6">
                    <div className="w-14 h-14 bg-gold-500 rounded-2xl flex items-center justify-center font-display font-bold text-navy-900 text-2xl mb-3 shadow-lg shadow-gold-500/20">V</div>
                    <h4 className="text-sm font-bold text-white tracking-[0.2em] uppercase">Vignan's Lara</h4>
                    <p className="text-[9px] text-gold-500/80 font-bold tracking-[0.4em] uppercase mt-1">Institute of Tech & Sci</p>
                  </div>

                  {/* Photo Section */}
                  <div className="relative mb-8">
                    <div className="w-36 h-36 rounded-full border-2 border-gold-500/30 p-1.5 bg-navy-900/50">
                      <div className="w-full h-full rounded-full bg-navy-900 overflow-hidden border border-white/10 flex items-center justify-center shadow-inner">
                        {student.photo ? (
                          <img src={student.photo} alt="Student" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-14 h-14 text-navy-700" />
                        )}
                      </div>
                    </div>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-gold-500 text-navy-900 text-[9px] font-bold px-4 py-1 rounded-full border-2 border-navy-800 uppercase tracking-widest shadow-lg">
                      Verified
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="w-full space-y-5 mb-6">
                    <div className="bg-white/5 py-3 px-4 rounded-2xl border border-white/5">
                      <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Full Name</p>
                      <p className="text-base font-bold text-white uppercase truncate">{student.fullName || 'YOUR NAME'}</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white/5 py-3 px-2 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Roll No</p>
                        <p className="text-xs font-bold text-white uppercase">{student.rollNumber || '21FE1AXXXX'}</p>
                      </div>
                      <div className="bg-white/5 py-3 px-2 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold mb-1">Branch</p>
                        <p className="text-xs font-bold text-white">{student.branch}</p>
                      </div>
                    </div>

                    <div className="bg-gold-500/5 py-3 px-4 rounded-2xl border border-gold-500/10">
                      <p className="text-[8px] text-gold-500 uppercase tracking-widest font-bold mb-1">Student ID</p>
                      <p className="text-sm font-bold text-gold-500 font-mono tracking-widest">{studentId || 'LARA-2026-XXXX'}</p>
                    </div>
                  </div>

                  {/* Footer / Barcode / Signature */}
                  <div className="w-full mt-auto pt-6 border-t border-white/5 flex flex-col items-center gap-4">
                    <div className="w-full flex justify-between items-end px-2">
                      <div className="flex flex-col items-start gap-1">
                        <p className="text-[7px] text-slate-500 uppercase tracking-widest font-bold">Verified By</p>
                        <img 
                          src="https://storage.googleapis.com/m-infra.appspot.com/public/res/ai-studio/f4702008-090c-4977-9694-547384738473.png" 
                          alt="Signature" 
                          className="h-8 w-auto invert opacity-80 mix-blend-screen"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex gap-[1.5px] h-6 items-center">
                        {[...Array(25)].map((_, i) => (
                          <div 
                            key={i} 
                            className="bg-white/40" 
                            style={{ 
                              width: `${Math.random() * 2 + 1}px`, 
                              height: `${Math.random() * 100}%`,
                              minHeight: '8px'
                            }} 
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-[8px] font-mono text-slate-600 tracking-[0.5em]">DIGITAL IDENTITY CARD</p>
                  </div>

                  {/* Background Glows */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gold-500/5 rounded-full blur-3xl" />
                </motion.div>
              ) : (
                <motion.div 
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="w-full max-w-[320px] aspect-[1/1.58] bg-navy-800/30 border-2 border-dashed border-navy-700 rounded-[2.5rem] flex flex-col items-center justify-center text-slate-600"
                >
                  <div className="w-16 h-16 rounded-2xl bg-navy-800/50 flex items-center justify-center mb-4 border border-navy-700">
                    <CreditCard className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-widest">ID Card Preview</p>
                </motion.div>
              )}
            </AnimatePresence>
            {showCard && (
              <p className="mt-6 text-xs text-slate-500 italic">Screenshot this card for your records.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

const Departments = () => {
  const depts = [
    { name: 'CSE', icon: <Cpu />, desc: 'Computer Science & Engineering focusing on AI, ML, and Data Science.' },
    { name: 'CSD', icon: <BookOpen />, desc: 'Computer Science and Design integrating computing with creative design principles.' },
    { name: 'ECE', icon: <Zap />, desc: 'Electronics & Communication Engineering exploring VLSI and Embedded Systems.' },
    { name: 'MECH', icon: <Settings />, desc: 'Mechanical Engineering with advanced robotics and manufacturing labs.' },
    { name: 'CIVIL', icon: <Building2 />, desc: 'Civil Engineering building sustainable infrastructure for the future.' },
    { name: 'EEE', icon: <Zap />, desc: 'Electrical & Electronics Engineering powering the world with clean energy.' },
    { name: 'IT', icon: <BookOpen />, desc: 'Information Technology bridging the gap between business and technology.' },
  ];

  return (
    <section id="departments" className="py-24 bg-navy-800/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Our Departments</h2>
          <p className="text-slate-400 max-w-2xl mx-auto italic">Excellence in every discipline, fostering innovation and technical prowess.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {depts.map((dept, i) => (
            <motion.div 
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -10 }}
              className="bg-navy-800 p-8 rounded-2xl border border-navy-700 hover:border-gold-500/50 transition-all group"
            >
              <div className="w-14 h-14 bg-navy-900 rounded-xl flex items-center justify-center text-gold-500 mb-6 group-hover:bg-gold-500 group-hover:text-navy-900 transition-colors">
                {dept.icon}
              </div>
              <h3 className="text-2xl font-bold mb-3">{dept.name}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{dept.desc}</p>
              <button className="mt-6 flex items-center gap-2 text-gold-500 font-bold text-sm group-hover:gap-3 transition-all">
                Learn More <ChevronRight className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Events = () => {
  const events = [
    { date: 'APR 15', title: 'LARA FIESTA 2026', desc: 'The annual cultural extravaganza featuring music, dance, and arts.' },
    { date: 'MAY 02', title: 'TECH-XPLORE', desc: 'National level technical symposium for engineering students.' },
    { date: 'JUN 10', title: 'ALUMNI MEET', desc: 'Reconnect with your seniors and network with industry leaders.' },
  ];

  return (
    <section id="events" className="py-24 bg-navy-900">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="text-left">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Upcoming Events</h2>
            <p className="text-slate-400 italic">Stay updated with the latest happenings on campus.</p>
          </div>
          <button className="px-8 py-3 border border-gold-500 text-gold-500 rounded-full font-bold hover:bg-gold-500 hover:text-navy-900 transition-all">
            View All Events
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {events.map((event, i) => (
            <motion.div 
              key={event.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-navy-800 rounded-2xl overflow-hidden border border-navy-700 flex flex-col"
            >
              <div className="h-48 bg-navy-900 relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-gold-500/20 to-transparent" />
                <Calendar className="w-16 h-16 text-gold-500/20" />
                <div className="absolute top-4 left-4 bg-gold-500 text-navy-900 font-bold px-3 py-1 rounded text-sm">
                  {event.date}
                </div>
              </div>
              <div className="p-6 flex-1">
                <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                <p className="text-slate-400 text-sm">{event.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Gallery = () => {
  const [filter, setFilter] = useState('All');
  
  const categories = ['All', 'Events', 'Sports', 'Academics', 'Campus'];
  
  const images = [
    { src: "https://picsum.photos/seed/lara-event1/800/600", category: "Events", title: "Lara Fiesta" },
    { src: "https://picsum.photos/seed/lara-sports1/800/600", category: "Sports", title: "Cricket Finals" },
    { src: "https://picsum.photos/seed/lara-acad1/800/600", category: "Academics", title: "Tech Symposium" },
    { src: "https://picsum.photos/seed/lara-campus1/800/600", category: "Campus", title: "Main Entrance" },
    { src: "https://picsum.photos/seed/lara-event2/800/600", category: "Events", title: "Cultural Fest" },
    { src: "https://picsum.photos/seed/lara-sports2/800/600", category: "Sports", title: "Basketball" },
    { src: "https://picsum.photos/seed/lara-acad2/800/600", category: "Academics", title: "AI Workshop" },
    { src: "https://picsum.photos/seed/lara-campus2/800/600", category: "Campus", title: "Digital Library" },
    { src: "https://picsum.photos/seed/lara-event3/800/600", category: "Events", title: "Freshers Day" },
  ];

  const filteredImages = filter === 'All' 
    ? images 
    : images.filter(img => img.category === filter);

  return (
    <section id="gallery" className="py-24 bg-navy-800/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Campus Life</h2>
          <p className="text-slate-400 max-w-2xl mx-auto italic">Glimpses of our vibrant campus and student achievements.</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
                filter === cat 
                  ? 'bg-gold-500 text-navy-900 shadow-lg shadow-gold-500/20' 
                  : 'bg-navy-800 text-slate-400 border border-navy-700 hover:border-gold-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <motion.div 
          layout
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredImages.map((img) => (
              <motion.div 
                layout
                key={img.src}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="relative group overflow-hidden rounded-2xl break-inside-avoid"
              >
                <img 
                  src={img.src} 
                  alt={img.title} 
                  className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110" 
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-navy-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-6 text-center">
                  <ImageIcon className="text-gold-500 w-8 h-8 mb-2" />
                  <h4 className="text-white font-bold text-lg">{img.title}</h4>
                  <p className="text-gold-500 text-xs font-bold uppercase tracking-widest mt-1">{img.category}</p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};

const FeedbackForm = () => {
  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    type: 'suggestion' as 'suggestion' | 'issue',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setSuccess(true);
        setFormData({ studentName: '', studentEmail: '', type: 'suggestion', message: '' });
        setTimeout(() => setSuccess(false), 5000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit feedback');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="feedback" className="py-24 bg-navy-900 border-t border-navy-800">
      <div className="container mx-auto px-6 max-w-4xl">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Student Feedback</h2>
          <p className="text-slate-400 italic">Help us improve your campus experience. Submit suggestions or report issues.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-navy-800/50 p-8 rounded-3xl border border-navy-700 shadow-xl"
        >
          {success ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-slate-400">Your feedback has been submitted successfully.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Your Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.studentName}
                    onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                    className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Email Address</label>
                  <input 
                    required
                    type="email"
                    value={formData.studentEmail}
                    onChange={(e) => setFormData({...formData, studentEmail: e.target.value})}
                    className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all"
                    placeholder="example@vignanlara.org"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Feedback Type</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'suggestion'})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                      formData.type === 'suggestion' 
                        ? 'bg-gold-500 text-navy-900 border-gold-500' 
                        : 'bg-navy-900/50 text-slate-400 border-navy-700 hover:border-gold-500/30'
                    }`}
                  >
                    Suggestion
                  </button>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, type: 'issue'})}
                    className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-all ${
                      formData.type === 'issue' 
                        ? 'bg-red-500 text-white border-red-500' 
                        : 'bg-navy-900/50 text-slate-400 border-navy-700 hover:border-red-500/30'
                    }`}
                  >
                    Report Issue
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-bold text-gold-500/60 mb-2">Message</label>
                <textarea 
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  className="w-full bg-navy-900/50 border border-navy-700 rounded-2xl px-5 py-4 text-white focus:border-gold-500 outline-none transition-all h-32 resize-none"
                  placeholder="Describe your suggestion or issue in detail..."
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-400/10 p-3 rounded-xl border border-red-400/20">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button 
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-gold-500 hover:bg-gold-600 disabled:opacity-50 text-navy-900 font-bold rounded-2xl transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg shadow-gold-500/20"
              >
                {loading ? 'Submitting...' : 'Send Feedback'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer id="contact" className="bg-navy-900 pt-24 pb-12 border-t border-navy-800">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gold-500 rounded-lg flex items-center justify-center font-display font-bold text-navy-900 text-xl">V</div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">LARA<span className="text-gold-500">.</span></span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed italic">
              Empowering students with knowledge, skills, and values to excel in the global technological landscape.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-slate-400 hover:bg-gold-500 hover:text-navy-900 transition-all"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-slate-400 hover:bg-gold-500 hover:text-navy-900 transition-all"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-slate-400 hover:bg-gold-500 hover:text-navy-900 transition-all"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="w-10 h-10 rounded-full bg-navy-800 flex items-center justify-center text-slate-400 hover:bg-gold-500 hover:text-navy-900 transition-all"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-gold-500/30">Quick Links</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li><a href="#home" className="hover:text-gold-500 transition-colors">Home</a></li>
              <li><a href="#students" className="hover:text-gold-500 transition-colors">Student Portal</a></li>
              <li><a href="#departments" className="hover:text-gold-500 transition-colors">Departments</a></li>
              <li><a href="#events" className="hover:text-gold-500 transition-colors">Events</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-gold-500/30">Contact Us</h4>
            <ul className="space-y-4 text-sm text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold-500 shrink-0" />
                <span>Vadlamudi, Guntur, Andhra Pradesh, 522213</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gold-500 shrink-0" />
                <span>+91 863 2347768</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gold-500 shrink-0" />
                <span>info@vignanlara.org</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6 flex items-center gap-2 underline underline-offset-8 decoration-gold-500/30">Newsletter</h4>
            <p className="text-slate-400 text-sm mb-4">Subscribe for campus updates.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-navy-800 border border-navy-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-gold-500 w-full"
              />
              <button className="bg-gold-500 text-navy-900 p-2 rounded-lg hover:bg-gold-600 transition-colors">
                <ChevronRight />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-navy-800 text-center text-xs text-slate-500">
          <p>© 2026 Vignan's LARA Institute of Technology and Science. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [studentId, setStudentId] = useState('');

  useEffect(() => {
    const savedEmail = localStorage.getItem('vignan_user_email');
    if (savedEmail) {
      fetch(`/api/status/${savedEmail}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'approved') {
            setIsApproved(true);
            setStudentId(data.studentId);
          }
        })
        .catch(console.error);
    }
  }, []);

  if (!isApproved) {
    return <VerificationGate onApproved={(id) => {
      setIsApproved(true);
      setStudentId(id);
    }} />;
  }

  return (
    <div className="relative overflow-x-hidden">
      <AnimatePresence>
        {loading && <SplashScreen onComplete={() => setLoading(false)} />}
      </AnimatePresence>

      {!loading && (
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="min-h-screen flex flex-col"
        >
          <Navbar />

          {/* Hero Section */}
          <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
              <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-500/10 rounded-full blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-navy-800/50" />
            </div>

            <div className="container mx-auto px-6 relative z-10">
              <div className="max-w-4xl">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <span className="inline-block py-1 px-4 rounded-full bg-gold-500/10 text-gold-500 text-sm font-bold tracking-widest mb-6 border border-gold-500/20">
                    ESTD. 2007
                  </span>
                  <h1 className="text-5xl md:text-8xl font-bold leading-tight mb-8">
                    Shape Your Future at <br />
                    <span className="text-gold-500 gold-glow">Vignan's LARA</span>
                  </h1>
                  <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl leading-relaxed italic">
                    A premier institution dedicated to nurturing technical excellence and holistic development in the heart of Andhra Pradesh.
                  </p>
                  <div className="flex flex-wrap gap-6">
                    <button className="px-10 py-4 bg-gold-500 hover:bg-gold-600 text-navy-900 font-bold rounded-full transition-all transform hover:scale-[1.05] shadow-lg shadow-gold-500/20">
                      Explore Programs
                    </button>
                    <button className="px-10 py-4 border border-slate-700 hover:border-gold-500 text-white font-bold rounded-full transition-all flex items-center gap-2 group">
                      Virtual Tour <Info className="w-5 h-5 group-hover:text-gold-500" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Scroll Indicator */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-30"
            >
              <div className="w-1 h-10 bg-gradient-to-b from-gold-500 to-transparent rounded-full" />
              <span className="text-[10px] uppercase tracking-widest font-bold">Scroll</span>
            </motion.div>
          </section>

          <IDCardGenerator studentId={studentId} />
          <Departments />
          <Events />
          <Gallery />
          <FeedbackForm />
          <Footer />
        </motion.main>
      )}
    </div>
  );
}
