import React, { useState } from 'react';
import { 
  Gift, 
  Trophy, 
  ChevronRight, 
  Lock, 
  Unlock, 
  Star, 
  Zap, 
  Crown, 
  Coins, 
  Timer, 
  CheckCircle2, 
  Info,
  TrendingUp,
  Users,
  ShieldCheck,
  Smartphone,
  Laptop,
  Tablet,
  X,
  Bell,
  ChevronDown,
  History
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

// --- Types ---
interface RewardBox {
  id: string;
  name: string;
  type: 'bronze' | 'silver' | 'gold' | 'diamond' | 'elite';
  requirement: string;
  isUnlocked: boolean;
  isPopular?: boolean;
  progress: number;
  maxProgress: number;
  image: string;
}

interface Mission {
  id: string;
  title: string;
  description: string;
  reward: string;
  progress: number;
  maxProgress: number;
  icon: React.ReactNode;
  status: 'available' | 'completed';
}

const REWARD_BOXES: RewardBox[] = [
  { id: '1', name: 'Bronze Box', type: 'bronze', requirement: 'Invest $100', isUnlocked: true, progress: 100, maxProgress: 100, image: 'https://i.imgur.com/w9Z3C9b.png' },
  { id: '2', name: 'Silver Box', type: 'silver', requirement: 'Invest $500', isUnlocked: false, progress: 320, maxProgress: 500, image: 'https://i.imgur.com/w9Z3C9b.png' },
  { id: '3', name: 'Gold Box', type: 'gold', requirement: 'Invest $1,000', isUnlocked: true, isPopular: true, progress: 1000, maxProgress: 1000, image: 'https://i.imgur.com/w9Z3C9b.png' },
  { id: '4', name: 'Diamond Box', type: 'diamond', requirement: 'Invest $5,000', isUnlocked: false, progress: 2140, maxProgress: 5000, image: 'https://i.imgur.com/w9Z3C9b.png' },
  { id: '5', name: 'Elite Vault', type: 'elite', requirement: 'Invite Friend', isUnlocked: false, progress: 12, maxProgress: 25, image: 'https://i.imgur.com/w9Z3C9b.png' },
];

const MISSIONS: Mission[] = [
  { id: '1', title: 'Daily Check-in', description: 'Check in daily and earn reward points', reward: '+10 PTS', progress: 0, maxProgress: 1, icon: <Timer size={18} className="text-purple-400" />, status: 'available' },
  { id: '2', title: 'Invest Milestone', description: 'Invest $2,000 to get bonus reward', reward: '$50 Bonus', progress: 1250, maxProgress: 2000, icon: <TrendingUp size={18} className="text-blue-400" />, status: 'available' },
  { id: '3', title: 'Referral Mission', description: 'Invite 5 friends to unlock rewards', reward: '$100 Bonus', progress: 2, maxProgress: 5, icon: <Users size={18} className="text-pink-400" />, status: 'available' },
  { id: '4', title: 'KYC Completed', description: 'Complete verification to get reward', reward: '+50 PTS', progress: 1, maxProgress: 1, icon: <ShieldCheck size={18} className="text-emerald-400" />, status: 'completed' },
  { id: '5', title: 'Hold Investment', description: 'Maintain investment for 7 days', reward: '+25 PTS', progress: 5, maxProgress: 7, icon: <Lock size={18} className="text-amber-400" />, status: 'available' },
];

const WHEEL_ITEMS = [
  { label: '$10,000', icon: <Crown size={16} />, color: 'from-amber-400 to-amber-600' },
  { label: 'iPhone 15', icon: <Smartphone size={16} />, color: 'from-blue-400 to-blue-600' },
  { label: '$100', icon: <Coins size={16} />, color: 'from-purple-400 to-purple-600' },
  { label: '$0', sub: 'Try Again', icon: <X size={16} />, color: 'from-slate-400 to-slate-600' },
  { label: '$500', icon: <Coins size={16} />, color: 'from-indigo-400 to-indigo-600' },
  { label: 'MacBook Air', icon: <Laptop size={16} />, color: 'from-purple-400 to-purple-600' },
  { label: '$5,000', icon: <Coins size={16} />, color: 'from-emerald-400 to-emerald-600' },
  { label: 'iPad Air', icon: <Tablet size={16} />, color: 'from-indigo-400 to-indigo-600' },
  { label: '$3,000', icon: <Coins size={16} />, color: 'from-purple-400 to-purple-600' },
];

export default function Rewards() {
  const [showWheel, setShowWheel] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinResult, setSpinResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSpinResult(null);
    const newResult = Math.floor(Math.random() * WHEEL_ITEMS.length);
    const extraSpins = 8 + Math.floor(Math.random() * 5);
    const segmentAngle = 360 / WHEEL_ITEMS.length;
    const targetRotation = rotation + (extraSpins * 360) + (newResult * segmentAngle);
    setRotation(targetRotation);
    setTimeout(() => {
      setIsSpinning(false);
      setSpinResult(newResult);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#05060f] text-[#9CA3AF] pb-24 overflow-hidden selection:bg-purple-500/30 font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-600/5 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-6">
        {/* Header - Matching Reference Precisely */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <Gift className="text-purple-500" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none mb-1">Rewards</h1>
              <p className="text-xs text-gray-500 font-medium">Complete tasks, unlock boxes and win amazing rewards!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Points Pill */}
            <div className="bg-[#11131f] border border-white/5 pl-4 pr-1.5 py-1.5 rounded-full flex items-center gap-4">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                 <span className="text-sm font-bold text-white tracking-tight">12,450 <span className="text-[10px] text-purple-400 uppercase ml-0.5">PTS</span></span>
              </div>
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center relative">
                <Bell size={16} className="text-gray-400" />
                <div className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-purple-600 rounded-full border-2 border-[#11131f] flex items-center justify-center text-[8px] font-bold text-white">3</div>
              </div>
            </div>
            
            {/* Balance Card */}
            <div className="bg-[#11131f] border border-white/5 px-4 py-1.5 rounded-full flex items-center gap-3">
              <div>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider leading-none mb-0.5">Total Balance</p>
                <div className="flex items-center gap-1.5">
                  <p className="text-base font-bold text-white tracking-tight">$24,560.75</p>
                  <ChevronDown size={14} className="text-gray-500" />
                </div>
              </div>
              <div className="w-8 h-8 rounded-full overflow-hidden border border-white/10 ml-2">
                <img src="https://i.pravatar.cc/100?u=rigmoes" alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section Container - VIP & Summary Chest */}
        <div className="grid lg:grid-cols-2 gap-4 mb-10">
          {/* VIP Progress Card */}
          <div className="bg-[#11131f] border border-white/5 rounded-[32px] p-8 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative">
              {/* VIP SEAL - EXACT REPLICATION */}
              <div className="w-40 h-40 relative flex items-center justify-center">
                {/* Wreath */}
                <div className="absolute inset-0 flex items-center justify-center opacity-60">
                   <svg viewBox="0 0 100 100" className="w-full h-full fill-purple-500/20">
                     <path d="M50 0 C22.4 0 0 22.4 0 50 C0 77.6 22.4 100 50 100 C77.6 100 100 77.6 100 50 C100 22.4 77.6 0 50 0 Z" />
                   </svg>
                </div>
                <div className="w-28 h-28 rounded-full border-4 border-purple-500/20 flex items-center justify-center relative bg-gradient-to-br from-purple-600/10 to-transparent">
                  <div className="text-center mt-2">
                    <p className="text-[10px] font-black text-purple-400 tracking-[0.2em] mb-1">VIP</p>
                    <p className="text-5xl font-black text-white italic drop-shadow-[0_0_15px_rgba(168,85,247,0.4)]">2</p>
                  </div>
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <Crown className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" size={32} />
                  </div>
                </div>
                {/* Outer Glow Ring */}
                <div className="absolute inset-2 border border-purple-500/10 rounded-full p-2">
                  <div className="w-full h-full border border-dashed border-purple-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-6 w-full text-center md:text-left">
              <div>
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl font-black text-white italic">Gold Investor</h2>
                  <div className="px-2 py-0.5 rounded-md bg-amber-400/10 border border-amber-400/20 text-[9px] font-black text-amber-500 uppercase tracking-widest">VIP 2</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Level Progress</p>
                    <p className="text-xs font-black text-white italic">68%</p>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '68%' }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]" 
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <p className="text-gray-500 tracking-wider">6,840 / 10,000 XP</p>
                    <p className="text-gray-400">Invest <span className="text-purple-400">$3,160</span> more to reach VIP 3</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats & Next Reward Combined Card */}
          <div className="bg-[#11131f] border border-white/5 rounded-[32px] p-8 grid grid-cols-2 lg:grid-cols-12 gap-8 relative overflow-hidden">
             {/* Stats Column */}
             <div className="col-span-1 lg:col-span-5 grid grid-cols-1 gap-5">
                {[
                  { label: 'Reward Points', val: '12,450 PTS', color: 'text-white', icon: <Gift size={16} className="text-purple-400" /> },
                  { label: 'Total Rewards Won', val: '$3,450.00', color: 'text-purple-400', icon: <Coins size={16} className="text-purple-400" /> },
                  { label: 'Total Invested', val: '$6,840.00', color: 'text-white', icon: <TrendingUp size={16} className="text-purple-400" /> },
                  { label: 'Boxes Opened', val: '8', color: 'text-white', icon: <Unlock size={16} className="text-purple-400" /> },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center gap-4 group cursor-default">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/5 flex items-center justify-center border border-white/5 group-hover:bg-purple-500/10 transition-colors">
                      {stat.icon}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                      <p className={cn("text-base font-black italic", stat.color)}>{stat.val}</p>
                    </div>
                  </div>
                ))}
             </div>

             {/* Next Reward Highlights Column */}
             <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center text-center lg:items-end lg:text-right border-l lg:border-white/5 lg:pl-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-purple-500/20 blur-[40px] rounded-full scale-150 animate-pulse" />
                  <motion.img 
                    animate={{ y: [0, -8, 0], rotate: [0, 2, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    src="https://i.imgur.com/w9Z3C9b.png" 
                    alt="Next Reward" 
                    className="w-36 h-36 object-contain relative z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" 
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.3em]">Next Reward</p>
                  <h3 className="text-xl font-black text-white italic">Diamond Chest</h3>
                  <button className="text-[10px] font-bold text-purple-400 underline underline-offset-4 hover:text-purple-300 transition-colors uppercase tracking-widest">
                    Invest $3,160 more
                  </button>
                </div>
             </div>
          </div>
        </div>

        {/* Reward Boxes Section */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4 flex-1">
              <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Reward Boxes</h2>
              <div className="hidden md:block h-px flex-1 bg-white/[0.03]" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider md:bg-white/5 py-1.5 px-4 rounded-full border border-white/5">Invest more, unlock better boxes and win premium rewards</p>
            </div>
            <button className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors">
              <Info size={14} className="text-gray-400" /> How It Works
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {REWARD_BOXES.map((box) => (
              <motion.div 
                key={box.id}
                whileHover={{ y: -5 }}
                className={cn(
                  "relative p-6 rounded-[32px] border transition-all duration-300 flex flex-col group h-full",
                  box.isUnlocked 
                    ? "bg-[#11131f] border-white/10 hover:border-purple-500/30" 
                    : "bg-[#0b0c16] border-white/5 opacity-80"
                )}
              >
                {box.isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#2563EB] rounded-full text-[9px] font-black uppercase tracking-widest text-white z-20 shadow-[0_0_15px_rgba(37,99,235,0.4)] whitespace-nowrap">
                    Popular
                  </div>
                )}

                <div className="flex justify-between items-start mb-6">
                  <span className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                    box.type === 'bronze' ? "bg-amber-900/10 text-amber-600 border-amber-900/20" :
                    box.type === 'silver' ? "bg-slate-500/10 text-slate-400 border-white/10" :
                    box.type === 'gold' ? "bg-amber-400/10 text-amber-500 border-amber-400/20" :
                    box.type === 'diamond' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                    "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                  )}>{box.type}</span>
                  {!box.isUnlocked && <Lock size={14} className="text-gray-600" />}
                </div>

                <div className="relative mb-8 flex justify-center flex-1">
                  <div className={cn(
                    "absolute inset-0 blur-[30px] rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity",
                    box.type === 'bronze' ? "bg-amber-900/10" :
                    box.type === 'silver' ? "bg-slate-400/10" :
                    box.type === 'gold' ? "bg-amber-400/20" :
                    box.type === 'diamond' ? "bg-purple-500/20" :
                    "bg-indigo-500/20"
                  )} />
                  <img 
                    src={box.image} 
                    alt={box.name} 
                    className={cn(
                      "w-28 h-28 object-contain relative z-10 transition-all duration-500 group-hover:scale-110",
                      !box.isUnlocked && "grayscale brightness-50"
                    )} 
                  />
                </div>

                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{box.requirement}</p>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px] mb-2">
                      <div 
                        className={cn("h-full rounded-full transition-all duration-1000", box.isUnlocked ? "bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.4)]" : "bg-white/10")} 
                        style={{ width: `${(box.progress / box.maxProgress) * 100}%` }} 
                      />
                    </div>
                    <div className="flex justify-between items-center px-0.5">
                       <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">${box.progress} / ${box.maxProgress}</p>
                       {box.isUnlocked && <CheckCircle2 size={12} className="text-emerald-500" />}
                    </div>
                  </div>
                  
                  <button 
                    disabled={!box.isUnlocked}
                    onClick={() => box.isUnlocked && setShowWheel(true)}
                    className={cn(
                      "w-full py-3.5 rounded-2xl font-black uppercase text-[10px] tracking-widest italic transition-all",
                      box.isUnlocked 
                        ? "bg-purple-600 hover:bg-purple-500 text-white shadow-lg active:scale-95" 
                        : "bg-[#1a1c2e] text-gray-600 border border-white/5"
                    )}
                  >
                    {box.isUnlocked ? 'Open Now' : 'Unlock Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* More Ways to Earn - Missions Grid */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight">More Ways to Earn</h2>
            <div className="flex items-center gap-1">
              <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-colors"><ChevronRight className="rotate-180" size={20} /></button>
              <button className="p-2 rounded-xl bg-white/5 text-gray-500 hover:text-white transition-colors"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MISSIONS.map((mission) => (
              <div key={mission.id} className="bg-[#11131f] border border-white/5 rounded-[32px] p-6 flex flex-col hover:border-purple-500/20 transition-all group">
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
                    {mission.icon}
                  </div>
                  {mission.status === 'completed' && <CheckCircle2 size={16} className="text-emerald-500" />}
                </div>
                
                <div className="flex-1 space-y-2 mb-6">
                  <h4 className="text-sm font-bold text-white tracking-tight">{mission.title}</h4>
                  <p className="text-[10px] text-gray-500 font-medium leading-relaxed">{mission.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between px-0.5">
                    <p className="text-xs font-bold text-amber-500 italic uppercase">{mission.reward}</p>
                  </div>
                  <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden p-[1px]">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(mission.progress / mission.maxProgress) * 100}%` }} />
                  </div>
                  <button 
                    disabled={mission.status === 'completed'}
                    className={cn(
                      "w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      mission.status === 'available' 
                        ? "bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-600/20" 
                        : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    )}
                  >
                    Check In
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Rewards Feed */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black italic text-white uppercase tracking-tight">Recent Rewards</h2>
            <button className="text-[10px] font-bold text-purple-400 hover:text-purple-300 uppercase tracking-widest flex items-center gap-1 group">
              View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="bg-[#11131f] border border-white/5 rounded-[32px] divide-y divide-white/[0.03] overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-black/40 flex items-center justify-center relative overflow-hidden border border-white/5">
                    <Gift className="text-purple-400" size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white tracking-tight leading-none mb-1.5 flex items-center gap-2">
                       You won <span className="text-purple-400">$50 from Gold Box</span>
                    </h5>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-none">2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-emerald-400 italic">+$50.00</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* REWARD WHEEL OVERLAY - EXACT REFERENCE REPLICATION */}
      <AnimatePresence>
        {showWheel && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#060818]/95 backdrop-blur-3xl" 
              onClick={() => !isSpinning && setShowWheel(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-[500px] bg-[#11131f] border border-white/10 rounded-[48px] p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-30" />
              
              <div className="flex justify-between items-center mb-10 relative z-10 font-sans">
                <div>
                  <h3 className="text-2xl font-black text-white italic tracking-tight leading-none mb-1.5">Gold Box Reward</h3>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">Unlock your daily premium rewards</p>
                </div>
                <button 
                  onClick={() => !isSpinning && setShowWheel(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-all hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>

              {/* WHEEL VISUAL */}
              <div className="relative aspect-square max-w-[340px] mx-auto mb-12">
                {/* Pointer / Flapper */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
                  <div className="w-6 h-8 bg-gradient-to-b from-amber-400 to-amber-600" style={{ clipPath: 'polygon(50% 100%, 0% 0%, 100% 0%)' }} />
                </div>

                <motion.div 
                  className="w-full h-full rounded-full border-[10px] border-[#1a1c2e] relative overflow-hidden shadow-[0_0_60px_rgba(168,85,247,0.2)] bg-[#0b0c16] z-10"
                  style={{ rotate: rotation }}
                  transition={isSpinning ? { duration: 4, ease: [0.1, 0, 0.1, 1] } : { duration: 0 }}
                >
                  <div className="absolute inset-0 rounded-full border-[20px] border-purple-500/5 pointer-events-none" />
                  {WHEEL_ITEMS.map((item, i) => {
                    const angle = 360 / WHEEL_ITEMS.length;
                    return (
                      <div 
                        key={i}
                        className={cn(
                          "absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 origin-bottom flex flex-col items-center pt-8",
                          i % 2 === 0 ? "bg-white/[0.01]" : "bg-transparent"
                        )}
                        style={{ transform: `translateX(-50%) rotate(${i * angle}deg)` }}
                      >
                         <p className="text-[11px] font-black italic text-white leading-none mb-4">{item.label}</p>
                         <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg transform scale-90", item.color)}>
                            {React.cloneElement(item.icon as React.ReactElement, { size: 18, className: "text-white" })}
                         </div>
                         {/* Border Line */}
                         <div className="absolute right-0 top-0 w-px h-full bg-white/5 origin-bottom" style={{ transform: `rotate(${angle/2}deg)` }} />
                      </div>
                    );
                  })}
                </motion.div>
                
                {/* Center Core */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-[#11131f] rounded-full flex items-center justify-center p-1.5 z-20 shadow-2xl border-4 border-[#1a1c2e]">
                   <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-inner group">
                      <p className="text-[12px] font-black text-black italic tracking-widest">SPIN</p>
                   </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-white italic mb-10">Good luck! ✨</p>
                <div className="space-y-3">
                  <button 
                    onClick={handleSpin}
                    disabled={isSpinning}
                    className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-sm uppercase tracking-[0.25em] italic transition-all flex items-center justify-center gap-3 shadow-[0_15px_35px_rgba(168,85,247,0.3)] active:scale-98"
                  >
                    {isSpinning ? "Spinning..." : "Spin the Wheel"}
                  </button>
                  <div className="flex items-center justify-center gap-2">
                    <History size={14} className="text-purple-400" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">1 spin available</span>
                  </div>
                </div>
              </div>

              {/* Success Result Reveal */}
              <AnimatePresence>
                {spinResult !== null && !isSpinning && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-[#060818]/98 flex flex-col items-center justify-center p-12 text-center z-[100]"
                  >
                    <div className="w-24 h-24 rounded-full bg-purple-500/20 flex items-center justify-center mb-6">
                       <Trophy className="text-purple-400" size={48} />
                    </div>
                    <h4 className="text-3xl font-black text-white italic mb-2 tracking-tight">Congratulations!</h4>
                    <p className="text-gray-400 text-sm font-medium mb-8">You won a premium reward:</p>
                    <div className="bg-purple-500/10 px-10 py-5 rounded-3xl border border-purple-500/20 mb-10">
                       <p className="text-4xl font-black text-purple-400 italic tracking-tighter">{WHEEL_ITEMS[spinResult].label}</p>
                    </div>
                    <button 
                      onClick={() => {
                        setShowWheel(false);
                        setSpinResult(null);
                      }}
                      className="px-10 py-4 bg-purple-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-purple-500 transition-all shadow-[0_10px_25px_rgba(168,85,247,0.4)]"
                    >
                      Awesome!
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

