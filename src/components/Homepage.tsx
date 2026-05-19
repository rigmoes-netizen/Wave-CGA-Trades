import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Building2, 
  Wallet, 
  Coins, 
  Bot, 
  Zap,
  Activity,
  Clock
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';
import { useAuth } from '../contexts/AuthContext';
import { DynamicBalance } from './DynamicBalance';
import { RotatingButtonText } from './RotatingButtonText';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

import TopInvestorsSection from './TopInvestorsSection';
import WhyChooseSection from './WhyChooseSection';
import { ROIEngineStats } from './ROIEngineDisplay';

const MemoizedTopInvestorsSection = React.memo(TopInvestorsSection);
const MemoizedWhyChooseSection = React.memo(WhyChooseSection);

export default function Homepage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [investments, setInvestments] = useState<any[]>([]);

  useEffect(() => {
    if (!user || !profile) return;
    
    const isCipher = profile.role === 'cipher';
    const isVerified = user.emailVerified || isCipher;

    if (!isVerified) return;

    // Listen to investments to determine state
    const qInv = query(collection(db, 'investments'), where('user_id', '==', user.uid));
    const unsubInvestments = onSnapshot(qInv, (snap) => {
      const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInvestments(list);
      
    }, (error) => {
        console.error("Error fetching investments:", error);
    });

    return () => unsubInvestments();
  }, [user]);

  const activeCount = investments.filter(i => i.status === 'active').length;

  return (
    <div className="w-full flex flex-col items-center pt-8 px-3 lg:px-0 space-y-4 lg:space-y-10">
      {/* --- DASHBOARD GRID --- */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-6 scale-[0.98] lg:scale-100 origin-top">
        
        {/* CARD 1: FUNDING */}
        <div 
          style={{ willChange: 'transform' }}
          className="bg-[#0b0e14] border-2 border-emerald-500/25 shadow-[0_0_30px_rgba(16,185,129,0.1)] rounded-[24px] lg:rounded-[32px] p-3 lg:p-7 aspect-square lg:aspect-auto flex flex-col items-center justify-center text-center group hover:border-emerald-500 transition-all duration-500"
        >
          <div className="w-8 h-8 lg:w-14 lg:h-14 bg-[#11141b] rounded-xl lg:rounded-2xl border border-white/10 flex items-center justify-center mb-1 lg:mb-6 shadow-inner group-hover:scale-105 transition-transform">
            <Building2 className="text-emerald-400 w-4 h-4 lg:w-7 lg:h-7 shadow-[0_0_20px_rgba(52,211,153,0.3)]" />
          </div>
          <h3 className="text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-3">Funding</h3>
          <div className="hidden lg:block w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          <div className="flex-1 flex items-center justify-center w-full min-h-[40px] lg:min-h-[80px]">
            <DynamicBalance value={formatCurrency(profile?.funding_balance || 0)} />
          </div>
          <button 
            onClick={() => navigate('/fund/deposit')}
            className="w-full py-1.5 lg:py-2.5 rounded-lg lg:rounded-2xl text-[9px] lg:text-[14px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_5px_15px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Fund
          </button>
        </div>

        {/* CARD 2: AVAILABLE BALANCE */}
        <div 
          style={{ willChange: 'transform' }}
          className="bg-[#0b0e14] border-2 border-red-500/25 shadow-[0_0_30px_rgba(239,68,68,0.1)] rounded-[24px] lg:rounded-[32px] p-3 lg:p-7 aspect-square lg:aspect-auto flex flex-col items-center justify-center text-center group hover:border-red-500 transition-all duration-500"
        >
          <div className="w-8 h-8 lg:w-14 lg:h-14 bg-[#11141b] rounded-xl lg:rounded-2xl border border-white/10 flex items-center justify-center mb-1 lg:mb-6 shadow-inner group-hover:scale-105 transition-transform">
            <Wallet className="text-red-400 w-4 h-4 lg:w-7 lg:h-7 shadow-[0_0_20px_rgba(239,68,68,0.3)]" />
          </div>
          <h3 className="text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-3">Available</h3>
          <div className="hidden lg:block w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          <div className="flex-1 flex items-center justify-center w-full min-h-[40px] lg:min-h-[80px]">
            <DynamicBalance value={formatCurrency(profile?.available_balance || 0)} />
          </div>
          <button 
            onClick={() => navigate('/fund/withdraw')}
            className="w-full py-1.5 lg:py-2.5 rounded-lg lg:rounded-2xl text-[9px] lg:text-[14px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-red-500 to-red-600 shadow-[0_5px_15px_rgba(239,68,68,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Withdraw
          </button>
        </div>

        {/* CARD 3: TOTAL ASSETS */}
        <div 
          style={{ willChange: 'transform' }}
          className="bg-[#0b0e14] border-2 border-blue-500/25 shadow-[0_0_30px_rgba(59,130,246,0.1)] rounded-[24px] lg:rounded-[32px] p-3 lg:p-7 aspect-square lg:aspect-auto flex flex-col items-center justify-center text-center group hover:border-blue-500 transition-all duration-500"
        >
          <div className="w-8 h-8 lg:w-14 lg:h-14 bg-[#11141b] rounded-xl lg:rounded-2xl border border-white/10 flex items-center justify-center mb-1 lg:mb-6 shadow-inner group-hover:scale-105 transition-transform">
            <Coins className="text-blue-400 w-4 h-4 lg:w-7 lg:h-7 shadow-[0_0_20px_rgba(59,130,246,0.3)]" />
          </div>
          <h3 className="text-white text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] mb-1 lg:mb-3">Assets</h3>
          <div className="hidden lg:block w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6" />
          <div className="flex-1 flex items-center justify-center w-full min-h-[40px] lg:min-h-[80px]">
            <DynamicBalance value={formatCurrency(profile?.total_invested || 0)} />
          </div>
          <button 
            onClick={() => navigate('/invest')}
            className="w-full py-1.5 lg:py-2.5 rounded-lg lg:rounded-2xl text-[9px] lg:text-[14px] font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_5px_15px_rgba(59,130,246,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center min-h-[32px] lg:min-h-[56px]"
          >
            <RotatingButtonText texts={['You Invest', 'We Trade', 'You Earn']} />
          </button>
        </div>

        {/* CARD 4: ROI ENGINE */}
        <ROIEngineStats 
          investments={investments}
          profile={profile}
          user={user}
          variant="home"
        />
      </div>
      
      {/* Footer Status */}
      <div className="hidden xl:flex pt-10 items-center justify-between gap-6 opacity-20 hover:opacity-50 transition-opacity">
        <div className="flex items-center gap-8">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white">Mainnet Secured</p>
           </div>
           <div className="h-4 w-px bg-white/10" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-muted">Encryption Protocol: AES-256V2</p>
        </div>
        <div className="flex items-center gap-6">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-muted tracking-tighter">Terminal v1.1.0-RC</p>
        </div>
      </div>
      <MemoizedTopInvestorsSection />
      <MemoizedWhyChooseSection />
    </div>
  );
}
