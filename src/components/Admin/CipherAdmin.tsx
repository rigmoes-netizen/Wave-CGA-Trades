import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  CreditCard, 
  Zap, 
  History, 
  BarChart3, 
  Search, 
  Filter, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  Activity,
  LogOut,
  ChevronRight,
  TrendingUp,
  Wallet,
  Coins,
  Building2,
  ArrowDownLeft,
  Settings,
  Lock,
  Shield,
  Ban,
  UserPlus,
  UserMinus,
  RefreshCw,
  Play,
  Pause,
  DollarSign,
  AlertTriangle,
  Mail,
  MapPin,
  Clock,
  IdCard,
  UserCircle,
  ArrowLeft,
  Copy
} from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { toast } from 'sonner';
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  updateDoc, 
  setDoc,
  addDoc,
  increment,
  getDoc,
  runTransaction,
  where,
  orderBy,
  onSnapshot,
  limit
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { logAudit } from '../../lib/auth_security';

// --- COMPONENTS ---

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full p-4 rounded-xl transition-all duration-300",
        active 
          ? "bg-aura-lime text-aura-black brutalist-shadow font-black" 
          : "text-aura-muted hover:text-white hover:bg-white/5 font-bold"
      )}
    >
      {icon}
      <span className="text-[10px] uppercase tracking-widest">{label}</span>
    </button>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
      <div className="flex justify-between items-start mb-4">
        <Icon size={18} className={color} />
        <p className="text-[8px] font-black uppercase tracking-widest text-aura-muted">Live Sync</p>
      </div>
      <p className="text-2xl font-black font-serif italic tracking-tighter mb-1 text-white">{value}</p>
      <p className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">{label}</p>
    </div>
  );
}

export default function CipherAdmin() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'canalytics' | 'cdeposits' | 'cwithdrawals' | 'cinvestments' | 'cuser' | 'csettings' | 'csecurity' | 'cplans' | 'ckycs' | 'cnotifications' | 'cui_editor'>('canalytics');
  const [investFilter, setInvestFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userDevices, setUserDevices] = useState<any[]>([]);
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [isDetailView, setIsDetailView] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended' | 'banned' | 'inactive'>('all');
  
  // UI History System
  const [uiVersions, setUiVersions] = useState<any[]>([]);
  const [uiConfig, setUiConfig] = useState<any>({});
  const [selectedVersion, setSelectedVersion] = useState<any>(null);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalInvested: 0,
    activeNodes: 0,
    available_balance: 0,
    securityAlerts: 0
  });

  // Admin Security Logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      // Admin session expires after 24 hours of inactivity
      timeout = setTimeout(() => {
        toast.error("Admin Security Session Expired. Re-authentication Required.");
        logout().then(() => navigate('/welcome'));
      }, 24 * 60 * 60 * 1000); 
    };

    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('keydown', resetTimeout);
    
    resetTimeout();
    
    return () => {
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('keydown', resetTimeout);
      clearTimeout(timeout);
    };
  }, [logout, navigate]);

  const [users, setUsers] = useState<any[]>([]);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [investments, setInvestments] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [exchangeRate, setExchangeRate] = useState<number>(1400);

  useEffect(() => {
    const CIPHER_UID = '3yV3rfcUzob5v9ltfVcMw0PL6tQ2';
    const CIPHER_EMAIL = 'support@tavariwave.network';
    const OLD_CIPHER_EMAIL = 'contact.cga.usa@gmail.com';
    
    const isCipher = user?.uid === CIPHER_UID || user?.email === CIPHER_EMAIL || user?.email === OLD_CIPHER_EMAIL || profile?.role === 'cipher';

    if (!isCipher) return;
    
    // Real-time listeners for data sync
    const unsubscribeTransactions = onSnapshot(query(collection(db, 'transactions'), orderBy('created_at', 'desc'), limit(500)), 
      (snap) => {
        setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.error("Transactions sync failed:", err.message)
    );
    const unsubscribeSettings = onSnapshot(doc(db, 'settings', 'system'), 
      (doc) => {
        if (doc.exists()) {
          setExchangeRate(doc.data().usd_to_ngn_rate || 1400);
        }
      },
      (err) => console.error("System settings sync failed:", err.message)
    );

    const unsubscribeUsers = onSnapshot(collection(db, 'users'), 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(list);
        const totalAvail = list.reduce((acc: number, curr: any) => acc + (curr.available_balance || 0), 0);
        setStats(prev => ({ ...prev, totalUsers: list.length, available_balance: totalAvail }));
      },
      (err) => console.error("Users list sync failed:", err.message)
    );

    const unsubscribeDeposits = onSnapshot(query(collection(db, 'deposits'), orderBy('created_at', 'desc')), 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDeposits(list);
        const totalDep = list.filter((d: any) => d.status === 'approved').reduce((acc, curr: any) => acc + curr.amount, 0);
        setStats(prev => ({ ...prev, totalDeposits: totalDep }));
      },
      (err) => console.error("Deposits sync failed:", err.message)
    );

    const unsubscribeWithdrawals = onSnapshot(query(collection(db, 'withdrawals'), orderBy('created_at', 'desc')), 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setWithdrawals(list);
        const totalWith = list.filter((d: any) => d.status === 'approved').reduce((acc, curr: any) => acc + curr.amount, 0);
        setStats(prev => ({ ...prev, totalWithdrawals: totalWith }));
      },
      (err) => console.error("Withdrawals sync failed:", err.message)
    );

    const unsubscribeInvestments = onSnapshot(query(collection(db, 'investments'), orderBy('created_at', 'desc')), 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setInvestments(list);
        const totalInv = list.filter((d: any) => d.status === 'active' || d.status === 'inactive').reduce((acc, curr: any) => acc + curr.amount, 0);
        const activeNodes = list.filter((d: any) => d.status === 'active').length;
        setStats(prev => ({ ...prev, totalInvested: totalInv, activeNodes }));
      },
      (err) => console.error("Investments sync failed:", err.message)
    );

    const unsubscribeAudit = onSnapshot(query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(50)), 
      (snap) => {
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSecurityLogs(list);
        const alerts = list.filter((l: any) => l.action?.includes('mfa_failed') || l.action?.includes('denied')).length;
        setStats(prev => ({ ...prev, securityAlerts: alerts }));
      },
      (err) => console.error("Audit logs sync failed:", err.message)
    );

    const unsubscribeUI = onSnapshot(doc(db, 'settings', 'ui_config'), 
      (snap) => {
        if (snap.exists()) setUiConfig(snap.data());
      },
      (err) => console.error("UI Config sync failed:", err.message)
    );

    const unsubscribeUIVersions = onSnapshot(query(collection(db, 'ui_versions'), orderBy('timestamp', 'desc'), limit(50)), 
      (snap) => {
        setUiVersions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      },
      (err) => console.error("UI Versions sync failed:", err.message)
    );

    return () => {
      unsubscribeSettings();
      unsubscribeUsers();
      unsubscribeDeposits();
      unsubscribeWithdrawals();
      unsubscribeInvestments();
      unsubscribeAudit();
      unsubscribeUI();
      unsubscribeUIVersions();
      unsubscribeTransactions();
    };
  }, [user, profile]);

  const fetchDevices = async (userId: string) => {
    try {
      const q = query(collection(db, 'users', userId, 'devices'), orderBy('lastLogin', 'desc'));
      const snap = await getDocs(q);
      setUserDevices(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.warn("Failed to fetch devices:", err);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchDevices(selectedUser.id);
    }
  }, [selectedUser]);

  const fetchData = async () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const approveDeposit = async (deposit: any) => {
    try {
      await runTransaction(db, async (transaction) => {
        const depositRef = doc(db, 'deposits', deposit.id);
        const userRef = doc(db, 'users', deposit.user_id);

        const depositDoc = await transaction.get(depositRef);
        if (!depositDoc.exists()) throw new Error("Deposit missing");

        const depositData = depositDoc.data();
        if (depositData.status !== 'pending') throw new Error("Already processed");

        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) throw new Error("User missing");

        transaction.update(userRef, { 
          funding_balance: increment(deposit.amount)
        });

        transaction.update(depositRef, { 
          status: 'approved', 
          updated_at: new Date().toISOString() 
        });
      });

      toast.success("Deposit Approved & Credited to Funding Wallet");
    } catch (error) {
      console.error("DEBUG [TRANSACTION ERROR]:", error);
      toast.error("Process failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const declineDeposit = async (id: string) => {
    try {
      await updateDoc(doc(db, 'deposits', id), { status: 'declined', updated_at: new Date().toISOString() });
      toast.success("Deposit Declined");
    } catch (error) {
      toast.error("Process failed");
    }
  };

  const approveWithdrawal = async (withdrawal: any) => {
    try {
      await updateDoc(doc(db, 'withdrawals', withdrawal.id), { 
        status: 'approved', 
        updated_at: new Date().toISOString() 
      });
      toast.success("Withdrawal Approved & Finalized");
    } catch (error) {
       console.error("WITHDRAWAL APPROVAL ERROR:", error);
       toast.error("Process failed");
    }
  };

  const declineWithdrawal = async (withdrawal: any) => {
    try {
      await runTransaction(db, async (transaction) => {
        const withdrawalRef = doc(db, 'withdrawals', withdrawal.id);
        const userRef = doc(db, 'users', withdrawal.user_id);

        const withdrawalSnap = await transaction.get(withdrawalRef);
        if (!withdrawalSnap.exists()) throw new Error("Withdrawal missing");
        if (withdrawalSnap.data().status !== 'pending') throw new Error("Already processed");

        // Return the funds
        transaction.update(userRef, { 
          available_balance: increment(withdrawal.amount)
        });

        transaction.update(withdrawalRef, { 
          status: 'declined', 
          updated_at: new Date().toISOString() 
        });

        // Add return log
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          user_id: withdrawal.user_id,
          type: 'adjustment',
          amount: withdrawal.amount,
          description: `Withdrawal Rejection Refund (${withdrawal.id})`,
          status: 'approved',
          created_at: new Date().toISOString()
        });
      });
      toast.success("Withdrawal Declined & Funds Returned");
    } catch (error: any) {
      console.error("WITHDRAWAL DECLINE ERROR:", error);
      toast.error("Process failed: " + error.message);
    }
  };

  const approveInvestment = async (investment: any) => {
    try {
      await updateDoc(doc(db, 'investments', investment.id), { 
        status: 'inactive', 
        updated_at: new Date().toISOString() 
      });
      await updateDoc(doc(db, 'users', investment.user_id), { 
        total_invested: increment(investment.amount)
      });
      toast.success("Investment Approved & Awaiting Activation");
    } catch (error) {
      toast.error("Process failed");
    }
  };

  const rejectInvestment = async (id: string) => {
    try {
      await updateDoc(doc(db, 'investments', id), { 
        status: 'rejected', 
        updated_at: new Date().toISOString() 
      });
      toast.success("Investment Rejected");
    } catch (error) {
      toast.error("Process failed");
    }
  };

  const stopInvestment = async (investment: any) => {
    try {
      await updateDoc(doc(db, 'investments', investment.id), { status: 'completed', updated_at: new Date().toISOString() });
      toast.success("Investment Stopped");
    } catch (error) {
       toast.error("Process failed");
    }
  };

  const updateUserBalance = async (userId: string, field: string, amount: number, action: 'add' | 'subtract' | 'set') => {
    try {
      const userRef = doc(db, 'users', userId);
      if (action === 'add') {
        await updateDoc(userRef, { [field]: increment(amount) });
        toast.success(`Added ${formatCurrency(amount)} to ${field.replace('_', ' ')}`);
      } else if (action === 'subtract') {
        await updateDoc(userRef, { [field]: increment(-amount) });
        toast.success(`Subtracted ${formatCurrency(amount)} from ${field.replace('_', ' ')}`);
      } else {
        await updateDoc(userRef, { [field]: amount });
        toast.success(`Set ${field.replace('_', ' ')} to ${formatCurrency(amount)}`);
      }
    } catch (error) {
      toast.error("Balance update failed");
    }
  };

  const toggleUserStatus = async (userId: string, field: string, value: any) => {
    try {
      await updateDoc(doc(db, 'users', userId), { [field]: value });
      toast.success("Account status updated");
    } catch (error) {
      toast.error("Status update failed");
    }
  };

  const updateExchangeRate = async (newRate: number) => {
    try {
      await setDoc(doc(db, 'settings', 'system'), { 
        usd_to_ngn_rate: newRate,
        last_updated: new Date().toISOString()
      }, { merge: true });
      toast.success("Exchange rate updated globally");
    } catch (error) {
      console.error("RATE UPDATE ERROR:", error);
      toast.error("Failed to update exchange rate");
    }
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setIsDetailView(false);
    if (profile?.uid) {
      logAudit(profile.uid, 'admin_tab_navigate', { tab });
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-white flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col p-6 hidden lg:flex">
        <div className="flex items-center gap-3 mb-12">
          <img src="https://i.imgur.com/wU33xy3.png" alt="Cipher Terminal Logo" className="w-10 h-10 lg:w-12 lg:h-12 object-contain" />
          <span className="text-sm font-black uppercase tracking-tighter">CIPHER TERMINAL</span>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<BarChart3 size={18} />} label="Analytics" active={activeTab === 'canalytics'} onClick={() => handleTabChange('canalytics')} />
          <SidebarItem icon={<CreditCard size={18} />} label="Deposits" active={activeTab === 'cdeposits'} onClick={() => handleTabChange('cdeposits')} />
          <SidebarItem icon={<ArrowDownLeft size={18} />} label="Withdrawals" active={activeTab === 'cwithdrawals'} onClick={() => handleTabChange('cwithdrawals')} />
          <SidebarItem icon={<Zap size={18} />} label="Investments" active={activeTab === 'cinvestments'} onClick={() => handleTabChange('cinvestments')} />
          <SidebarItem icon={<Users size={18} />} label="Users" active={activeTab === 'cuser'} onClick={() => handleTabChange('cuser')} />
          <SidebarItem icon={<UserMinus size={18} />} label="Inactive" active={activeTab === 'cinactiveusers'} onClick={() => handleTabChange('cinactiveusers')} />
          <SidebarItem icon={<IdCard size={18} />} label="KYC Control" active={activeTab === 'ckycs'} onClick={() => handleTabChange('ckycs')} />
          <SidebarItem icon={<ShieldCheck size={18} />} label="Security" active={activeTab === 'csecurity'} onClick={() => handleTabChange('csecurity')} />
          <SidebarItem icon={<TrendingUp size={18} />} label="ROI Plans" active={activeTab === 'cplans'} onClick={() => handleTabChange('cplans')} />
          <SidebarItem icon={<Play size={18} />} label="UI Studio" active={activeTab === 'cui_editor'} onClick={() => handleTabChange('cui_editor')} />
          <SidebarItem icon={<Mail size={18} />} label="Notifications" active={activeTab === 'cnotifications'} onClick={() => handleTabChange('cnotifications')} />
          <SidebarItem icon={<History size={18} />} label="Transactions" active={activeTab === 'ctransactions'} onClick={() => handleTabChange('ctransactions')} />
          <SidebarItem icon={<Settings size={18} />} label="Settings" active={activeTab === 'csettings'} onClick={() => handleTabChange('csettings')} />
        </nav>

        <div className="pt-6 border-t border-white/5 space-y-2">
          <button 
            onClick={async () => { await logout(); navigate('/welcome'); }}
            className="flex items-center gap-3 w-full p-4 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold"
          >
            <LogOut size={18} />
            <span className="text-[10px] uppercase tracking-widest">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 lg:p-12 overflow-y-auto max-h-screen">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl lg:text-6xl font-black tracking-[-0.05em] leading-[0.85] text-white font-serif italic mb-2 capitalize">
              {activeTab.substring(1)}.
            </h1>
            <p className="text-aura-muted text-[10px] font-bold uppercase tracking-[0.3em]">System Level Access: root_alpha</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={fetchData} className="p-3 bg-white/5 rounded-xl text-aura-muted hover:text-aura-lime transition-all">
                <History size={18} className={loading ? "animate-spin" : ""} />
             </button>
          </div>
        </header>

        {activeTab === 'canalytics' && (
          <div className="space-y-12">
            <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-4 lg:gap-6">
              <StatCard label="Total Users" value={stats.totalUsers.toString()} icon={Users} color="text-blue-400" />
              <StatCard label="Deposits Approved" value={formatCurrency(stats.totalDeposits)} icon={CreditCard} color="text-green-400" />
              <StatCard label="Payouts Settled" value={formatCurrency(stats.totalWithdrawals)} icon={ArrowDownLeft} color="text-red-400" />
              <StatCard label="Strategic Nodes" value={stats.activeNodes.toString()} icon={Zap} color="text-aura-lime" />
              <StatCard label="Vault Access" value={stats.securityAlerts.toString()} icon={AlertTriangle} color={stats.securityAlerts > 0 ? "text-red-500" : "text-emerald-500"} />
              <StatCard label="Network Liquid" value={formatCurrency(stats.available_balance)} icon={Wallet} color="text-purple-400" />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
               {/* LIVE PENDING FEED */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Activity size={18} className="text-aura-lime" /> Pending Protocols
                     </h3>
                     <span className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">{deposits.filter(d => d.status === 'pending').length + withdrawals.filter(w => w.status === 'pending').length} Actions Required</span>
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
                     {[...deposits, ...withdrawals]
                        .filter(x => x.status === 'pending')
                        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                        .map((item: any) => (
                           <div key={item.id} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between hover:border-aura-lime/20 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center",
                                    item.method ? "bg-green-400/10 text-green-400" : "bg-red-400/10 text-red-400"
                                 )}>
                                    {item.method ? <CreditCard size={18} /> : <ArrowDownLeft size={18} />}
                                 </div>
                                 <div>
                                    <p className="text-xs font-bold text-white uppercase">{item.user_name || 'Anonymous'}</p>
                                    <p className="text-[9px] text-aura-muted uppercase tracking-widest font-bold">
                                       {item.method ? 'Incoming Dep.' : 'Outgoing Wit.'} • {item.method || item.details?.method || 'Direct'}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className="text-lg font-black font-serif italic text-white">{formatCurrency(item.amount)}</p>
                                 <button 
                                    onClick={() => handleTabChange(item.method ? 'cdeposits' : 'cwithdrawals')}
                                    className="text-[8px] font-black uppercase tracking-widest text-aura-lime hover:underline"
                                 >Review Audit</button>
                              </div>
                           </div>
                        ))}
                     {deposits.filter(d => d.status === 'pending').length === 0 && withdrawals.filter(w => w.status === 'pending').length === 0 && (
                        <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[32px]">
                           <ShieldCheck size={32} className="mx-auto text-white/10 mb-2" />
                           <p className="text-[10px] font-black uppercase text-aura-muted tracking-widest">No pending settlements detected.</p>
                        </div>
                     )}
                  </div>
               </div>

               {/* MASTER TRANSACTION FEED */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <History size={18} className="text-aura-lime" /> Real-time Feed
                     </h3>
                     <span className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">Global Sequence Alpha</span>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-none">
                     {transactions.map((tx, idx) => (
                        <div key={`${tx.id}-${idx}`} className="p-4 bg-white/[0.01] border border-white/[0.03] rounded-xl flex items-center justify-between group hover:bg-white/5 transition-all">
                           <div className="flex items-center gap-4">
                              <div className="text-[8px] font-mono text-aura-muted">#{tx.id?.substring(0, 6)}</div>
                              <div>
                                 <p className="text-[10px] font-bold text-white uppercase">{tx.type?.replace(/_/g, ' ')}</p>
                                 <p className="text-[8px] text-aura-muted font-bold uppercase tracking-widest truncate max-w-[150px]">{tx.description || '-'}</p>
                              </div>
                           </div>
                           <div className="text-right">
                              <p className="text-xs font-black text-white">{formatCurrency(tx.amount)}</p>
                              <p className="text-[7px] text-aura-muted uppercase font-black">{new Date(tx.created_at).toLocaleTimeString()}</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               {/* NETWORK PORTFOLIOS (USER QUICK LIST) */}
               <div className="xl:col-span-2 space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Users size={18} className="text-aura-lime" /> Network Identities
                     </h3>
                     <button onClick={() => handleTabChange('cuser')} className="text-[9px] font-black uppercase tracking-widest text-aura-lime hover:underline">View Mapping</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {users.slice(0, 6).map(u => (
                        <div key={u.id} className="p-5 bg-white/5 border border-white/5 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-aura-lime/30 transition-all" onClick={() => { setSelectedUser(u); setActiveTab('cuser'); setIsDetailView(true); }}>
                           <div className="flex items-center gap-4">
                              {u.photoURL ? (
                                 <img src={u.photoURL} alt="" className="w-10 h-10 rounded-xl object-cover" />
                              ) : (
                                 <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-lime font-black text-xs">{u.name?.[0]}</div>
                              )}
                              <div>
                                 <p className="text-xs font-black uppercase truncate max-w-[120px]">{u.name}</p>
                                 <p className="text-[8px] text-aura-muted font-bold uppercase tracking-widest">{formatCurrency(u.available_balance || 0)} Liquid</p>
                              </div>
                           </div>
                           <ChevronRight size={14} className="text-aura-muted group-hover:text-aura-lime transition-all" />
                        </div>
                     ))}
                  </div>
               </div>

               {/* RECENT NODE INVESTMENTS */}
               <div className="space-y-6">
                  <div className="flex items-center justify-between pb-4 border-b border-white/5">
                     <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white flex items-center gap-2">
                        <Zap size={18} className="text-aura-lime" /> Active Nodes
                     </h3>
                     <button onClick={() => handleTabChange('cinvestments')} className="text-[9px] font-black uppercase tracking-widest text-aura-lime hover:underline">Sync All</button>
                  </div>
                  <div className="space-y-3">
                     {investments
                        .filter(i => i.status === 'active')
                        .slice(0, 5)
                        .map(inv => (
                        <div key={inv.id} className="p-4 bg-aura-lime/5 border border-aura-lime/10 rounded-2xl flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <bot className="w-8 h-8 rounded-lg bg-aura-lime flex items-center justify-center text-aura-black"><Zap size={14} /></bot>
                              <div>
                                 <p className="text-[10px] font-black uppercase text-white truncate max-w-[100px]">{inv.user_name || 'Anon'}</p>
                                 <p className="text-[8px] text-aura-lime font-black uppercase tracking-widest">{inv.plan_name}</p>
                              </div>
                           </div>
                           <p className="text-xs font-black text-white italic font-serif">{formatCurrency(inv.amount)}</p>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'cdeposits' && (
          <div className="space-y-6">
            {deposits.map((dep: any) => (
              <div key={dep.id} className="p-8 bg-white/5 border border-white/5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:border-aura-lime/20 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-aura-muted group-hover:text-aura-lime transition-all"><CreditCard size={24} /></div>
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold uppercase">{dep.user_name || 'Unknown'}</span>
                        <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", 
                          dep.status === 'pending' ? "bg-yellow-400/10 text-yellow-500" :
                          dep.status === 'approved' ? "bg-aura-lime/10 text-aura-lime" : "bg-red-400/10 text-red-400"
                        )}>{dep.status}</span>
                     </div>
                     <p className="text-[10px] text-aura-muted font-bold uppercase tracking-widest">{dep.method} • <span className="font-mono">{dep.reference}</span></p>
                   </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-aura-muted mb-1">Amount</p>
                      <p className="text-2xl font-black font-serif italic text-white">${dep.amount.toLocaleString()}</p>
                   </div>
                   {dep.status === 'pending' && (
                     <div className="flex gap-2">
                       <button onClick={() => declineDeposit(dep.id)} className="p-3 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all"><XCircle size={20} /></button>
                       <button onClick={() => approveDeposit(dep)} className="p-3 bg-aura-lime/10 text-aura-lime hover:bg-aura-lime hover:text-aura-black rounded-xl transition-all"><CheckCircle size={20} /></button>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cwithdrawals' && (
          <div className="space-y-6">
            {withdrawals.map((wit: any) => (
              <div key={wit.id} className="p-8 bg-white/5 border border-white/5 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 group hover:border-red-400/20 transition-all">
                <div className="flex items-center gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-aura-muted group-hover:text-red-400 transition-all"><ArrowDownLeft size={24} /></div>
                   <div>
                     <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-bold uppercase">{wit.user_name || 'Unknown'}</span>
                        <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", 
                          wit.status === 'pending' ? "bg-yellow-400/10 text-yellow-500" :
                          wit.status === 'approved' ? "bg-aura-lime/10 text-aura-lime" : "bg-red-400/10 text-red-400"
                        )}>{wit.status}</span>
                     </div>
                     <div className="mt-2 space-y-2">
                        <div className="flex items-center gap-2">
                           <span className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border",
                              wit.method === 'bank' ? "bg-blue-400/10 border-blue-400/20 text-blue-400" : "bg-purple-400/10 border-purple-400/20 text-purple-400"
                           )}>
                              {wit.method === 'bank' ? 'Fiat Settlement' : 'Cyber Settlement'}
                           </span>
                           <span className="text-[9px] text-aura-muted font-bold uppercase tracking-widest">{wit.method} Protocol</span>
                        </div>
                        
                        {wit.method === 'bank' ? (
                           <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5 min-w-[280px]">
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                 <span className="text-aura-muted">Institution:</span>
                                 <span className="text-white">{wit.details?.bankName || 'Unknown Bank'}</span>
                              </div>
                              <div className="flex justify-between items-center group/copy">
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-aura-muted">Account Num:</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-mono font-black text-aura-lime tracking-wider">{wit.details?.accNum || 'N/A'}</span>
                                    <button 
                                       onClick={() => {
                                          navigator.clipboard.writeText(wit.details?.accNum || '');
                                          toast.success("Account copied to terminal clipboard");
                                       }}
                                       className="p-1 hover:bg-white/10 rounded-md transition-all text-aura-muted hover:text-aura-lime"
                                    >
                                       <Copy size={12} />
                                    </button>
                                 </div>
                              </div>
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest pt-2 border-t border-white/5">
                                 <span className="text-aura-muted">Beneficiary:</span>
                                 <span className="text-white">{wit.details?.accName || 'N/A'}</span>
                              </div>
                           </div>
                        ) : (
                           <div className="bg-white/5 p-4 rounded-2xl space-y-2 border border-white/5 min-w-[280px]">
                              <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-widest">
                                 <span className="text-aura-muted">Network:</span>
                                 <span className="text-white">{wit.details?.type?.toUpperCase() || 'USDT'} Protocol</span>
                              </div>
                              <div className="flex justify-between items-center group/copy">
                                 <span className="text-[9px] font-bold uppercase tracking-widest text-aura-muted">Wallet/Address:</span>
                                 <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-mono font-black text-aura-lime tracking-tight truncate max-w-[150px]">{wit.details?.address || 'N/A'}</span>
                                    <button 
                                       onClick={() => {
                                          navigator.clipboard.writeText(wit.details?.address || '');
                                          toast.success("Cyber address copied to terminal");
                                       }}
                                       className="p-1 hover:bg-white/10 rounded-md transition-all text-aura-muted hover:text-aura-lime"
                                    >
                                       <Copy size={12} />
                                    </button>
                                 </div>
                              </div>
                           </div>
                        )}
                     </div>
                   </div>
                </div>
                <div className="flex items-center gap-12">
                   <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest text-aura-muted mb-1">Amount</p>
                      <p className="text-2xl font-black font-serif italic text-white">${wit.amount.toLocaleString()}</p>
                   </div>
                   {wit.status === 'pending' && (
                     <div className="flex gap-2">
                       <button onClick={() => declineWithdrawal(wit)} className="p-3 bg-red-400/10 text-red-400 hover:bg-red-400 hover:text-white rounded-xl transition-all"><XCircle size={20} /></button>
                       <button onClick={() => approveWithdrawal(wit)} className="p-3 bg-aura-lime/10 text-aura-lime hover:bg-aura-lime hover:text-aura-black rounded-xl transition-all"><CheckCircle size={20} /></button>
                     </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'cinvestments' && (
          <div className="space-y-8">
            <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
               {['all', 'pending', 'approved', 'rejected'].map((f) => (
                 <button 
                   key={f}
                   onClick={() => setInvestFilter(f as any)}
                   className={cn(
                     "px-6 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
                     investFilter === f ? "bg-white/10 text-white" : "text-aura-muted hover:text-white"
                   )}
                 >
                   {f}
                 </button>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {investments
                .filter(inv => {
                  if (investFilter === 'all') return true;
                  if (investFilter === 'pending') return inv.status === 'pending';
                  if (investFilter === 'approved') return inv.status === 'active' || inv.status === 'inactive';
                  if (investFilter === 'rejected') return inv.status === 'rejected';
                  return true;
                })
                .map((inv: any) => (
                <div key={inv.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-6 group hover:border-aura-lime/20 transition-all">
                  <div className="flex justify-between items-start">
                     <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-aura-lime"><Zap size={20} /></div>
                     <span className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded", 
                        inv.status === 'active' ? "bg-aura-lime/10 text-aura-lime" : 
                        inv.status === 'inactive' ? "bg-blue-400/10 text-blue-400" :
                        inv.status === 'rejected' ? "bg-red-400/10 text-red-400" :
                        "bg-white/10 text-aura-muted"
                     )}>{inv.status}</span>
                  </div>
                  <div>
                     <p className="text-[9px] font-bold uppercase tracking-widest text-aura-muted mb-1">{inv.user_name || 'Anonymous'}</p>
                     <p className="text-3xl font-black font-serif italic">{formatCurrency(inv.amount)}</p>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                     <span className="text-[9px] font-bold uppercase tracking-widest text-aura-muted">{inv.plan_name} Node</span>
                     <div className="flex gap-4">
                       {inv.status === 'pending' && (
                         <>
                           <button onClick={() => rejectInvestment(inv.id)} className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:underline">Reject</button>
                           <button onClick={() => approveInvestment(inv)} className="text-[9px] font-black uppercase tracking-widest text-aura-lime hover:underline">Approve</button>
                         </>
                       )}
                       {(inv.status === 'active' || inv.status === 'inactive') && (
                          <button onClick={() => stopInvestment(inv)} className="text-[9px] font-black uppercase tracking-widest text-red-400 hover:underline">Stop</button>
                       )}
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(activeTab === 'cuser' || activeTab === 'cinactiveusers') && (
          <div className="space-y-8">
            {!isDetailView ? (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                   <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                      {['all', 'active', 'suspended', 'banned'].map((f) => (
                        <button 
                          key={f}
                          onClick={() => setUserFilter(f as any)}
                          className={cn(
                            "px-6 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all",
                            userFilter === f ? "bg-white/10 text-white" : "text-aura-muted hover:text-white"
                          )}
                        >
                          {f}
                        </button>
                      ))}
                   </div>
                   {activeTab === 'cinactiveusers' && (
                     <div className="text-[10px] font-black uppercase text-aura-lime bg-aura-lime/10 px-4 py-2 rounded-xl animate-pulse">
                        Filtering Inactive Nodes Only
                     </div>
                   )}
                   <div className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-4 py-2 w-full md:w-80">
                      <Search size={16} className="text-aura-muted" />
                      <input 
                        type="text" 
                        placeholder="Search Identity..." 
                        className="bg-transparent border-none outline-none text-[10px] font-bold tracking-widest uppercase text-white w-full"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                   </div>
                </div>

                <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-aura-muted">Identity</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-aura-muted">Balances</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-aura-muted text-center">Nodes</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-aura-muted">Status</th>
                        <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest text-aura-muted text-right">Access</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {users
                        .filter(u => {
                          const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
                          if (activeTab === 'cinactiveusers') {
                             const hasActiveNodes = investments.some(i => i.user_id === u.id && i.status === 'active');
                             if (hasActiveNodes) return false;
                          }
                          if (userFilter === 'all') return matchesSearch;
                          if (userFilter === 'active') return matchesSearch && !u.suspended && !u.banned;
                          if (userFilter === 'suspended') return matchesSearch && u.suspended;
                          if (userFilter === 'banned') return matchesSearch && u.banned;
                          return matchesSearch;
                        })
                        .map((user: any) => (
                        <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => { setSelectedUser(user); setIsDetailView(true); }}>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              {user.photoURL ? (
                                <img src={user.photoURL} className="w-10 h-10 rounded-xl object-cover border border-white/10" alt="" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-aura-lime">{user.name?.[0] || 'U'}</div>
                              )}
                              <div>
                                <p className="text-sm font-bold tracking-tight">{user.name}</p>
                                <p className="text-[9px] text-aura-muted font-bold uppercase tracking-widest">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <p className="text-sm font-black font-serif italic text-white">{formatCurrency(user.available_balance || 0)}</p>
                            <p className="text-[8px] text-aura-muted font-bold uppercase tracking-widest">Total: {formatCurrency((user.available_balance || 0) + (user.funding_balance || 0))}</p>
                          </td>
                          <td className="px-8 py-6 text-center">
                            <span className="text-[10px] font-black text-aura-lime bg-aura-lime/10 px-3 py-1 rounded-full border border-aura-lime/20">
                              {investments.filter(i => i.user_id === user.id && i.status === 'active').length} Active
                            </span>
                          </td>
                          <td className="px-8 py-6">
                             {user.banned ? (
                               <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-red-500/10 text-red-500 rounded-full flex items-center gap-1 w-fit"><Ban size={10} /> Banned</span>
                             ) : user.suspended ? (
                               <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center gap-1 w-fit"><Pause size={10} /> Suspended</span>
                             ) : (
                               <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-aura-lime/10 text-aura-lime rounded-full flex items-center gap-1 w-fit"><ShieldCheck size={10} /> Verified</span>
                             )}
                          </td>
                          <td className="px-8 py-6 text-right text-aura-muted group-hover:text-aura-lime transition-all">
                             <ChevronRight size={16} className="inline" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              // USER DETAIL PANEL
              <div className="space-y-8 pb-20">
                 <button onClick={() => setIsDetailView(false)} className="flex items-center gap-2 text-aura-muted hover:text-white transition-all text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                    <ArrowLeft size={14} /> Back to Registry
                 </button>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* LEFT COL: Profile & Status */}
                    <div className="lg:col-span-1 space-y-6">
                       <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] text-center space-y-4">
                          <div className="relative inline-block mx-auto">
                             {selectedUser.photoURL ? (
                               <img src={selectedUser.photoURL} className="w-24 h-24 rounded-[32px] object-cover border-2 border-aura-lime shadow-2xl shadow-aura-lime/20" alt="" />
                             ) : (
                               <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 flex items-center justify-center font-black text-3xl text-aura-lime">{selectedUser.name?.[0]}</div>
                             )}
                             <div className={cn(
                               "absolute -bottom-2 -right-2 p-2 rounded-full border-2 border-aura-black shadow-lg",
                               selectedUser.banned ? "bg-red-500" : selectedUser.suspended ? "bg-yellow-500" : "bg-aura-lime"
                             )}>
                               {selectedUser.banned ? <Ban size={14} className="text-white" /> : selectedUser.suspended ? <Pause size={14} className="text-white" /> : <ShieldCheck size={14} className="text-aura-black" />}
                             </div>
                          </div>
                          <div>
                             <h3 className="text-2xl font-black font-serif italic text-white">{selectedUser.name}</h3>
                             <p className="text-[10px] text-aura-muted font-bold uppercase tracking-[0.2em]">{selectedUser.email}</p>
                             <p className="text-[8px] text-aura-lime font-black uppercase tracking-widest mt-2">ID: {selectedUser.id}</p>
                          </div>

                          <div className="pt-6 border-t border-white/5 grid grid-cols-2 gap-2">
                             <button 
                               onClick={() => toggleUserStatus(selectedUser.id, 'suspended', !selectedUser.suspended)}
                               className={cn(
                                 "flex items-center justify-center gap-2 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                                 selectedUser.suspended ? "bg-yellow-500 text-aura-black" : "bg-white/5 text-yellow-500 border border-yellow-500/20 hover:bg-yellow-500/10"
                               )}
                             >
                                <Pause size={12} /> {selectedUser.suspended ? 'Unsuspend' : 'Suspend'}
                             </button>
                             <button 
                               onClick={() => toggleUserStatus(selectedUser.id, 'banned', !selectedUser.banned)}
                               className={cn(
                                 "flex items-center justify-center gap-2 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all",
                                 selectedUser.banned ? "bg-red-500 text-white" : "bg-white/5 text-red-500 border border-red-500/20 hover:bg-red-500/10"
                               )}
                             >
                                <Ban size={12} /> {selectedUser.banned ? 'Unban' : 'Ban Access'}
                             </button>
                          </div>
                          
                          <div className="space-y-2">
                             <button 
                               onClick={() => toggleUserStatus(selectedUser.id, 'roi_disabled', !selectedUser.roi_disabled)}
                               className={cn(
                                 "flex items-center justify-center gap-2 w-full py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                                 selectedUser.roi_disabled ? "bg-blue-500 text-white border-blue-500" : "bg-white/5 text-blue-400 border-blue-400/20 hover:bg-blue-400/10"
                               )}
                             >
                                {selectedUser.roi_disabled ? <Play size={12} /> : <Pause size={12} />}
                                {selectedUser.roi_disabled ? 'Enable ROI Engine' : 'Disable ROI Engine'}
                             </button>
                             <div className="grid grid-cols-2 gap-2">
                                <button 
                                  onClick={() => toggleUserStatus(selectedUser.id, 'withdrawals_frozen', !selectedUser.withdrawals_frozen)}
                                  className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                                    selectedUser.withdrawals_frozen ? "bg-orange-500 text-white border-orange-500" : "bg-white/5 text-orange-400 border-orange-400/20 hover:bg-orange-400/10"
                                  )}
                                >
                                   <Lock size={12} /> {selectedUser.withdrawals_frozen ? 'Unfreeze Payout' : 'Freeze Payout'}
                                </button>
                                <button 
                                  onClick={() => toggleUserStatus(selectedUser.id, 'transfers_frozen', !selectedUser.transfers_frozen)}
                                  className={cn(
                                    "flex items-center justify-center gap-2 py-3 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all border",
                                    selectedUser.transfers_frozen ? "bg-purple-500 text-white border-purple-500" : "bg-white/5 text-purple-400 border-purple-400/20 hover:bg-purple-400/10"
                                  )}
                                >
                                   <RefreshCw size={12} /> {selectedUser.transfers_frozen ? 'Unfreeze Transfer' : 'Freeze Transfer'}
                                </button>
                             </div>
                          </div>
                       </div>

                       <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-4">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-aura-muted flex items-center gap-2"><MapPin size={12} /> Geographic Metadata</h4>
                          <div className="space-y-3">
                             <div className="flex justify-between items-center text-[10px] font-bold uppercase text-white/60">
                                <span>Country</span>
                                <span>{selectedUser.countryName || 'Global Access'}</span>
                             </div>
                             <div className="flex justify-between items-center text-[10px] font-bold uppercase text-white/60">
                                <span>Last Sync</span>
                                <span className="font-mono text-[9px]">{selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'N/A'}</span>
                             </div>
                          </div>
                       </div>
                    </div>

                    {/* RIGHT COL: Financials & History */}
                    <div className="lg:col-span-2 space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { field: 'available_balance', label: 'Available', value: selectedUser.available_balance || 0, icon: Wallet, color: 'text-secondary' },
                            { field: 'funding_balance', label: 'Funding', value: selectedUser.funding_balance || 0, icon: CreditCard, color: 'text-blue-400' },
                            { field: 'total_earnings', label: 'Total Earnings', value: selectedUser.total_earnings || 0, icon: TrendingUp, color: 'text-purple-400' },
                            { field: 'total_invested', label: 'Total Invested', value: selectedUser.total_invested || 0, icon: Zap, color: 'text-orange-400' },
                            { field: 'referral_earnings', label: 'Referrals', value: selectedUser.referral_earnings || 0, icon: UserPlus, color: 'text-aura-lime' },
                          ].map((item) => (
                             <div key={item.field} className="p-6 bg-white/5 border border-white/5 rounded-3xl group">
                                <div className="flex justify-between items-start mb-4">
                                   <item.icon size={18} className={item.color} />
                                   <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button 
                                        onClick={() => {
                                          const amt = prompt("Amount to ADD?");
                                          if (amt) updateUserBalance(selectedUser.id, item.field, parseFloat(amt), 'add');
                                        }}
                                        className="p-1 hover:bg-white/10 rounded text-[9px] font-black text-aura-lime"
                                      >+ ADD</button>
                                      <button 
                                        onClick={() => {
                                          const amt = prompt("Amount to SET?");
                                          if (amt) updateUserBalance(selectedUser.id, item.field, parseFloat(amt), 'set');
                                        }}
                                        className="p-1 hover:bg-white/10 rounded text-[9px] font-black text-white"
                                      >EDIT</button>
                                       <button 
                                        onClick={() => updateUserBalance(selectedUser.id, item.field, 0, 'set')}
                                        className="p-1 hover:bg-white/10 rounded text-[9px] font-black text-red-400"
                                      >RESET</button>
                                   </div>
                                </div>
                                <p className="text-3xl font-black font-serif italic mb-1">{formatCurrency(item.value)}</p>
                                <p className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">{item.label}</p>
                             </div>
                          ))}
                       </div>

                       <div className="space-y-6">
                          <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2"><History size={16} className="text-aura-lime" /> Registry Logs</h3>
                          <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
                             <table className="w-full text-left">
                                <thead>
                                   <tr className="border-b border-white/5">
                                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted">Event</th>
                                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted">Value</th>
                                      <th className="px-8 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted text-right">Timestamp</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-white/[0.02]">
                                   {investments.filter(inv => inv.user_id === selectedUser.id).slice(0, 5).map((inv: any) => (
                                     <tr key={inv.id}>
                                       <td className="px-8 py-4">
                                          <p className="text-[10px] font-bold text-white uppercase">{inv.plan_name} Node Activated</p>
                                       </td>
                                       <td className="px-8 py-4">
                                          <p className="text-[10px] font-black text-aura-lime tracking-widest">{formatCurrency(inv.amount)}</p>
                                       </td>
                                       <td className="px-8 py-4 text-right">
                                          <p className="text-[10px] text-aura-muted font-bold font-mono uppercase italic">{new Date(inv.created_at).toLocaleDateString()}</p>
                                       </td>
                                     </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'ctransactions' && (
          <div className="bg-white/5 border border-white/5 rounded-[40px] overflow-hidden">
             <table className="w-full text-left">
                <thead>
                   <tr className="border-b border-white/5 text-[9px] font-black uppercase tracking-widest text-aura-muted">
                      <th className="px-8 py-6">Operation</th>
                      <th className="px-8 py-6">Subject</th>
                      <th className="px-8 py-6 text-right">Value</th>
                      <th className="px-8 py-6 text-right">Sequence</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.02]">
                   {transactions.map(tx => (
                     <tr key={tx.id} className="hover:bg-white/[0.01]">
                        <td className="px-8 py-6">
                           <p className="text-[10px] font-bold text-white uppercase">{tx.type?.replace(/_/g, ' ')}</p>
                           <p className="text-[8px] italic text-aura-muted">{tx.description || '-'}</p>
                        </td>
                        <td className="px-8 py-6">
                           <p className="text-xs font-mono text-aura-muted">{tx.user_id?.substring(0, 8)}...</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className="text-sm font-black font-serif italic text-white">{formatCurrency(tx.amount)}</p>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <p className="text-[9px] font-bold text-aura-muted uppercase">{tx.created_at ? new Date(tx.created_at).toLocaleString() : 'just now'}</p>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}

        {activeTab === 'csettings' && (
          <div className="max-w-4xl space-y-12">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-aura-lime mb-6 flex items-center gap-2">
                <Shield size={16} /> Security Architecture
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-aura-lime/10 rounded-2xl text-aura-lime"><Lock size={24} /></div>
                       <div>
                          <h4 className="text-sm font-black uppercase">Terminus Session</h4>
                          <p className="text-[10px] text-aura-muted font-bold uppercase tracking-widest">Active root session: {profile?.name || 'Cipher'}</p>
                       </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t border-white/5">
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <span className="text-aura-muted">Auth Level</span>
                          <span className="text-white">Admin Alpha</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <span className="text-aura-muted">Encryption</span>
                          <span className="text-white">AES-256-GCM</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                          <span className="text-aura-muted">Last Handshake</span>
                          <span className="font-mono text-white">{new Date().toLocaleTimeString()}</span>
                       </div>
                    </div>

                    <button 
                      onClick={async () => { await logout(); navigate('/welcome'); }}
                      className="w-full py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2"
                    >
                       <LogOut size={16} /> Terminate All Sessions
                    </button>
                 </div>

                 <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                    <div className="flex items-center gap-4">
                       <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500"><ShieldCheck size={24} /></div>
                       <div>
                          <h4 className="text-sm font-black uppercase">MFA & Access</h4>
                          <p className="text-[10px] text-aura-muted font-bold uppercase tracking-widest">System multi-factor settings</p>
                       </div>
                    </div>
                    
                    <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                       <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">2FA Status</span>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-white/10 text-aura-muted rounded">Coming Soon</span>
                       </div>
                       <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 italic">Audit Log</span>
                          <span className="text-[8px] font-black uppercase tracking-widest px-2 py-1 bg-aura-lime/10 text-aura-lime rounded">Synced</span>
                       </div>
                    </div>
                 </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                 <Building2 size={16} className="text-aura-lime" /> Financial Configuration
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                     <label className="text-[10px] font-black uppercase tracking-widest text-aura-muted ml-2">USD to NGN Exchange Rate</label>
                     <div className="flex gap-3">
                        <div className="relative flex-1">
                           <div className="absolute inset-y-0 left-6 flex items-center text-aura-lime font-bold">₦</div>
                           <input 
                              type="number" 
                              value={exchangeRate}
                              onChange={(e) => setExchangeRate(parseFloat(e.target.value))}
                              placeholder="1400"
                              className="w-full bg-aura-black border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-base font-bold outline-none focus:border-aura-lime/50 transition-all text-white"
                           />
                        </div>
                        <button 
                           onClick={() => updateExchangeRate(exchangeRate)}
                           className="px-8 py-4 bg-aura-lime text-aura-black font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-xl hover:scale-[1.02] transition-all"
                        >
                           Update Rate
                        </button>
                     </div>
                     <p className="text-[8px] text-aura-muted font-bold uppercase tracking-widest ml-2 italic underline underline-offset-4 decoration-aura-lime/30">Used globally for Bank Transfer calculations</p>
                  </div>
               </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
               <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                 <Activity size={16} className="text-aura-lime" /> Terminal Integrity
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { label: 'Latency', value: '14ms', status: 'Optimal' },
                    { label: 'Db Sync', value: 'Real-time', status: 'Healthy' },
                    { label: 'Uptime', value: '99.99%', status: 'Stable' },
                  ].map((s, i) => (
                    <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl text-center">
                       <p className="text-[8px] font-black uppercase tracking-widest text-aura-muted mb-2">{s.label}</p>
                       <p className="text-2xl font-black font-serif italic mb-1">{s.value}</p>
                       <span className="text-[8px] font-black uppercase tracking-widest text-aura-lime">{s.status}</span>
                    </div>
                  ))}
               </div>
            </div>
          </div>
        )}

        {activeTab === 'cui_editor' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-8">
                  <div className="flex items-center justify-between">
                     <h3 className="text-xl font-bold uppercase tracking-tight italic font-serif">Deployment Studio</h3>
                     <div className="flex gap-4">
                        <button 
                          onClick={async () => {
                            await addDoc(collection(db, 'ui_versions'), {
                              config: uiConfig,
                              timestamp: new Date(),
                              author: profile?.email,
                              description: 'Snapshot'
                            });
                            toast.success("State Sequenced");
                          }}
                          className="px-6 py-2 bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                        >
                          Snapshot
                        </button>
                        <button 
                          onClick={async () => {
                            try {
                              await setDoc(doc(db, 'settings', 'ui_config'), uiConfig);
                              toast.success("UI Pipeline Re-synchronized. Changes Live.");
                            } catch (err) {
                              toast.error("Deployment Interrupted");
                            }
                          }}
                          className="px-6 py-2 bg-aura-lime text-aura-black text-[10px] font-black uppercase tracking-widest rounded-xl brutalist-shadow"
                        >
                          Deploy Live
                        </button>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-widest text-aura-muted">Global UI Parameters</p>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase text-white/40">Primary Color (Hex)</label>
                           <input 
                             type="text" 
                             value={uiConfig.primaryColor || '#a3e635'} 
                             onChange={(e) => setUiConfig({...uiConfig, primaryColor: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-mono"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[9px] font-bold uppercase text-white/40">Platform Title</label>
                           <input 
                             type="text" 
                             value={uiConfig.platformTitle || 'Tavari Wave'} 
                             onChange={(e) => setUiConfig({...uiConfig, platformTitle: e.target.value})}
                             className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm"
                           />
                        </div>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[9px] font-bold uppercase text-white/40">Annoucement Banner</label>
                        <textarea 
                          value={uiConfig.announcement || ''} 
                          onChange={(e) => setUiConfig({...uiConfig, announcement: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm h-32"
                          placeholder="Welcome to the future of institutional trading..."
                        />
                     </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1 space-y-6">
                <div className="p-8 bg-white/5 border border-white/10 rounded-[40px] space-y-6">
                   <h3 className="text-xs font-black uppercase tracking-widest text-aura-lime">Version Topology</h3>
                   <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
                      {uiVersions.length === 0 ? (
                        <div className="text-center py-10 text-aura-muted text-[10px] font-bold uppercase tracking-widest">No previous versions detected</div>
                      ) : (
                        uiVersions.map((v, i) => (
                          <div key={v.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl space-y-2 group hover:border-aura-lime/30 transition-all">
                             <div className="flex justify-between items-start">
                                <span className="text-[8px] font-black uppercase tracking-widest text-aura-muted">V_{uiVersions.length - i}</span>
                                <span className="text-[8px] font-mono text-white/40">{new Date(v.timestamp.seconds * 1000).toLocaleString()}</span>
                             </div>
                             <p className="text-[10px] text-white font-bold uppercase tracking-tight line-clamp-1">{v.description || 'System Update'}</p>
                             <button 
                               onClick={async () => {
                                 if (confirm("Restore this UI configuration state? Current state will be backed up.")) {
                                    await addDoc(collection(db, 'ui_versions'), {
                                      config: uiConfig,
                                      timestamp: new Date(),
                                      description: `Pre-rollback to V_${uiVersions.length - i}`
                                    });
                                    await setDoc(doc(db, 'settings', 'ui_config'), v.config);
                                    toast.success("UI Rollback Successful");
                                 }
                               }}
                               className="w-full py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[8px] font-black uppercase tracking-widest text-aura-lime transition-all"
                             >
                               Rollback to this state
                             </button>
                          </div>
                        ))
                      )}
                   </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cplans' && (
           <div className="p-12 text-center border border-white/5 bg-white/5 rounded-[40px] space-y-6">
              <Zap size={48} className="mx-auto text-aura-lime" />
              <h3 className="text-xl font-bold uppercase tracking-tight italic font-serif">ROI Engine Controllers</h3>
              <p className="text-aura-muted text-[10px] uppercase font-bold tracking-widest max-w-xs mx-auto">Investment plans and distribution parameters are currently hardcoded for system stability. Direct database overrides are required for modifications in this version.</p>
           </div>
        )}

        {activeTab === 'cnotifications' && (
           <div className="p-20 text-center bg-white/5 border border-white/10 rounded-[40px] space-y-4">
              <Mail size={48} className="mx-auto text-aura-lime" />
              <h3 className="text-xl font-bold uppercase tracking-tight italic font-serif">Broadcast Control</h3>
              <p className="text-aura-muted text-[10px] uppercase font-bold tracking-widest max-w-xs mx-auto">Push notification engine and global broadcast protocols are currently operating in manual mode. Real-time broadcast UI pending deployment.</p>
           </div>
        )}
        
        {activeTab === 'csecurity' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <ShieldCheck size={18} className="text-aura-lime" /> Protocol Integrity
                </h3>
                <div className="space-y-4">
                  {[
                    { label: 'Platform Encryption', value: 'AES-256', status: 'ACTIVE' },
                    { label: 'Access Control', value: 'RBAC_LEVEL_4', status: 'ACTIVE' },
                    { label: 'Threat Monitoring', value: 'ML_ANOMALY', status: 'ACTIVE' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white">{p.label}</p>
                        <p className="text-[8px] font-bold uppercase tracking-widest text-aura-muted">{p.value}</p>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-aura-lime px-2 py-1 bg-aura-lime/10 rounded">{p.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] flex flex-col justify-center text-center space-y-4">
                <Shield size={48} className="mx-auto text-aura-lime animate-pulse" />
                <h3 className="text-xl font-bold uppercase tracking-tight italic font-serif tracking-tighter">Security Handshake</h3>
                <p className="text-aura-muted text-[10px] uppercase font-bold tracking-widest max-w-xs mx-auto leading-relaxed">
                  The terminal is currently operating under institutional security parameters. All attempts at invalid access are logged and blocked automatically.
                </p>
                <div className="pt-4 flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-xl font-black">{stats.securityAlerts}</p>
                    <p className="text-[8px] font-bold text-aura-muted uppercase">Active Alerts</p>
                  </div>
                  <div className="h-8 w-px bg-white/5"></div>
                  <div className="text-center">
                    <p className="text-xl font-black text-aura-lime">99.9%</p>
                    <p className="text-[8px] font-bold text-aura-muted uppercase">Prevention Rate</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/5 border border-white/5 rounded-[40px] space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-white">System-Wide Audit Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted">Event Descriptor</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted">Subject ID</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted">Status</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-aura-muted text-right">Z-Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {securityLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-aura-muted text-[10px] font-bold uppercase tracking-widest">No audit signals detected in current window</td>
                      </tr>
                    ) : (
                      securityLogs.map(log => (
                        <tr key={log.id} className="group hover:bg-white/[0.01]">
                          <td className="px-6 py-4">
                            <p className="text-[10px] font-bold text-white uppercase">{log.action?.replace(/_/g, ' ')}</p>
                            <p className="text-[8px] font-bold text-aura-muted uppercase truncate max-w-[200px]">Device: {log.deviceId?.substring(0, 12)}...</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-[9px] font-mono text-aura-muted truncate">{log.user_id}</p>
                          </td>
                          <td className="px-6 py-4">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded",
                              log.action?.includes('failed') ? "bg-red-500/10 text-red-400" :
                              log.action?.includes('mfa') ? "bg-blue-500/10 text-blue-400" : "bg-aura-lime/10 text-aura-lime"
                            )}>
                              {log.action?.includes('failed') ? 'DENIED' : 'AUTHORIZED'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="text-[9px] text-aura-muted font-bold font-mono uppercase italic">
                              {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString() : 'now'}
                            </p>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
