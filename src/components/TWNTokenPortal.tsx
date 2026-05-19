import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  Wallet, 
  LineChart, 
  Shield, 
  Zap, 
  Users, 
  Gift, 
  Lock,
  ChevronRight,
  Info,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../lib/utils';

export default function TWNTokenPortal() {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'general' | 'wallet'>('general');

  const handleComingSoon = (type: 'general' | 'wallet' = 'general') => {
    setModalType(type);
    setModalOpen(true);
    
    // Also show toast as a secondary touch
    if (type === 'wallet') {
      toast.info("WALLET PROTOCOL LOCKED", {
        description: "Secure node connection sequence is pending governance approval.",
        className: "brutalist-card",
      });
    } else {
      toast.info("SYSTEM NOTICE: SECURE PROTOCOL INITIALIZING", {
        description: "Interactive node deployment protocol will be granted following the next governance sequence.",
        className: "brutalist-card font-serif italic tracking-tight",
        duration: 5000,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#050816] text-white selection:bg-purple-500/30 overflow-hidden relative">
      {/* Cinematic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/15 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[20%] right-[-5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[30%] right-[10%] w-[1px] h-[400px] bg-gradient-to-b from-transparent via-purple-500/20 to-transparent rotate-45" />
        <div className="absolute top-[10%] left-[20%] w-[1px] h-[300px] bg-gradient-to-b from-transparent via-blue-500/20 to-transparent -rotate-12" />
        
        {/* Animated Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scale: [0, 1, 0],
              y: [0, -100],
              x: Math.random() * 100 - 50
            }}
            transition={{ 
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 10
             }}
            className="absolute bg-purple-500 rounded-full w-[2px] h-[2px]"
            style={{ 
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-20 relative z-10">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-12 mb-20">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6 md:flex-1"
          >
            <div className="flex items-center gap-5 mb-8">
              {/* Premium 3D Coin Visual */}
              <div className="relative group">
                <motion.div 
                  animate={{ 
                    rotateY: [0, 360],
                    rotateX: [10, -10, 10], 
                  }}
                  transition={{ 
                    duration: 6, 
                    repeat: Infinity, 
                    ease: "linear",
                    rotateX: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                  }}
                  className="w-24 h-24 relative preserve-3d"
                >
                  {/* Front Side */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#9333ea] via-[#c084fc] to-[#a855f7] rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.6)] backface-hidden overflow-hidden">
                    <img src="https://i.imgur.com/wU33xy3.png" alt="TWN" className="w-[80%] h-[80%] object-contain brightness-200 contrast-125" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                  {/* Back Side */}
                  <div className="absolute inset-0 bg-gradient-to-bl from-[#7c3aed] to-[#4c1d95] rounded-full flex items-center justify-center border-4 border-white/20 shadow-[0_0_30px_rgba(168,85,247,0.4)] rotate-y-180 backface-hidden">
                    <Zap size={40} className="text-white/80" />
                  </div>
                  {/* Coin Edge Effect */}
                  <div className="absolute inset-0 rounded-full border-[6px] border-white/10 blur-[1px] -z-10" />
                </motion.div>
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl group-hover:bg-purple-500/40 transition-all duration-700" />
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-black uppercase tracking-[0.5em] text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">Autonomous Network</span>
                <span className="text-[9px] font-bold text-aura-muted uppercase tracking-widest mt-1">Status: Obsidian Core Active</span>
              </div>
            </div>

            <h1 className="text-5xl lg:text-8xl font-black italic tracking-tighter uppercase leading-[0.8] font-serif">
              <span className="text-white">TWN</span> <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-aura-lime italic opacity-90">Token Portal.</span>
            </h1>
            <p className="max-w-xl text-aura-muted text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed pt-4 border-l-2 border-purple-500/30 pl-6">
              Powering the Future of Capital Growth. Connect your wallet to manage your TWN tokens, view live analytics, and access exclusive platform features.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-10 bg-white/[0.03] border border-white/10 rounded-[50px] backdrop-blur-2xl flex flex-col items-center text-center space-y-8 lg:min-w-[360px] relative overflow-hidden group shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-20 h-20 bg-gradient-to-tr from-purple-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Wallet size={40} className="text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black uppercase tracking-tight italic font-serif">Identity Sync</h3>
              <p className="text-[10px] text-aura-muted font-bold uppercase tracking-[0.2em] leading-tight px-6 opacity-60">
                Synchronize your secure wallet to access institutional level utility.
              </p>
            </div>
            <button 
              onClick={() => handleComingSoon('wallet')}
              className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.3em] text-[10px] rounded-[24px] hover:scale-[1.02] transition-all hover:bg-purple-400 active:scale-95 shadow-xl"
            >
              Connect Wallet
            </button>
          </motion.div>
        </header>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-24">
          {[
            { label: 'Observed Value', value: '$0.00000', change: '+0.00%', icon: LineChart, color: 'text-purple-400' },
            { label: 'Liquidity Depth', value: '$0.00', change: '+0.00%', icon: Shield, color: 'text-blue-400' },
            { label: 'Ecosystem Flow', value: '$0.00', change: '+0.00%', icon: Zap, color: 'text-aura-lime' },
            { label: 'Staking Volume', value: '0.00K', change: '+0.00%', icon: Users, color: 'text-pink-400' },
          ].map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 sm:p-10 bg-white/[0.02] border border-white/5 rounded-[32px] sm:rounded-[40px] group hover:border-purple-500/30 transition-all hover:shadow-[0_20px_60px_rgba(168,85,247,0.1)] relative overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/[0.02] rounded-full translate-x-16 -translate-y-16 transition-transform group-hover:scale-150" />
              <div className={cn("inline-flex p-4 rounded-2xl bg-white/5 mb-8 group-hover:scale-110 transition-transform shadow-inner", metric.color)}>
                <metric.icon size={24} />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-aura-muted mb-3">{metric.label}</p>
              <div className="flex flex-col sm:flex-row sm:items-end gap-1 sm:gap-3">
                <p className="text-2xl lg:text-4xl font-black font-serif italic tracking-tighter">{metric.value}</p>
                <span className={cn("text-[10px] font-black mb-1.5", metric.change.startsWith('+') ? "text-aura-lime" : "text-red-400")}>
                  {metric.change}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Core Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-24">
           <div className="p-1 lg:p-2 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-transparent rounded-[50px] group">
              <div className="bg-[#050816] rounded-[45px] p-8 lg:p-12 h-full flex flex-col justify-between space-y-12 border border-white/10 group-hover:border-purple-500/30 transition-all">
                 <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <span className="px-4 py-1.5 bg-purple-500/10 text-purple-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-purple-500/20">Protocol Asset</span>
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
                    </div>
                    <h2 className="text-4xl lg:text-6xl font-black uppercase tracking-tighter font-serif italic leading-none text-white">Buy TWN <br />Token.</h2>
                    <p className="text-[11px] text-aura-muted font-bold uppercase tracking-widest max-w-sm leading-relaxed opacity-60">High-conviction acquisition phase soon. Secure your position in the next-generation financial orchestration network.</p>
                 </div>
                 <div className="flex flex-col sm:flex-row gap-5">
                    <button 
                      onClick={() => handleComingSoon()}
                      className="px-10 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-[24px] hover:scale-105 transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-3"
                    >
                      Initiate Acquisition <ArrowUpRight size={18} />
                    </button>
                    <button 
                      onClick={() => handleComingSoon()}
                      className="px-10 py-5 bg-white/5 border border-white/10 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-[24px] hover:bg-white/10 transition-all flex items-center justify-center gap-3 backdrop-blur-md"
                    >
                      View Live Chart <LineChart size={18} />
                    </button>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-8">
              {[
                { title: 'Liquidity Pools', desc: 'Secure yield through automated market orchestration.', icon: Zap, label: '99.9% SL' },
                { title: 'Governance Center', desc: 'Direct institutional decision weighting access.', icon: Shield, label: 'DAO PHASE 1' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="p-10 bg-white/[0.03] border border-white/10 rounded-[40px] flex items-center justify-between group cursor-pointer hover:bg-white/[0.05] hover:border-purple-500/20 transition-all backdrop-blur-sm"
                  onClick={() => handleComingSoon()}
                >
                   <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-white/5 rounded-3xl flex items-center justify-center text-aura-muted group-hover:text-purple-400 group-hover:scale-110 transition-all border border-white/5 shadow-inner">
                         <item.icon size={28} />
                      </div>
                      <div>
                         <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-lg font-black uppercase tracking-tight italic font-serif">{item.title}</h4>
                            <span className="text-[8px] font-black text-aura-lime px-2 py-1 bg-aura-lime/10 rounded-lg border border-aura-lime/20 uppercase tracking-widest">{item.label}</span>
                         </div>
                         <p className="text-[10px] text-aura-muted font-bold uppercase tracking-[0.3em] opacity-50">{item.desc}</p>
                      </div>
                   </div>
                   <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:border-purple-400 group-hover:bg-purple-400 group-hover:text-black transition-all shadow-lg group-active:scale-90">
                      <ChevronRight size={22} />
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Future Utilities */}
        <div className="mb-20">
           <div className="flex items-center gap-8 mb-16">
              <h3 className="text-[11px] font-black uppercase tracking-[0.5em] text-white opacity-80 whitespace-nowrap">Core Roadmap</h3>
              <div className="flex-1 h-px bg-gradient-to-r from-white/20 to-transparent" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {[
                { 
                  title: 'Token Staking', 
                  tag: 'COMING SOON',
                  description: 'Stake your TWN tokens to earn passive rewards and exclusive platform benefits.',
                  icon: Lock,
                  glow: 'shadow-purple-500/20',
                  gradient: 'from-purple-500/10 to-transparent'
                },
                { 
                  title: 'Referral Rewards', 
                  tag: 'COMING SOON',
                  description: 'Earn TWN tokens by inviting friends to join the Tavari Wave Network ecosystem.',
                  icon: Gift,
                  glow: 'shadow-blue-500/20',
                  gradient: 'from-blue-500/10 to-transparent'
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative p-1 rounded-[45px] overflow-hidden"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                   <div className={cn("relative p-12 bg-[#0A0D1F] border border-white/5 rounded-[43px] space-y-8 h-full flex flex-col justify-between hover:border-purple-500/20 transition-all", feature.gradient)}>
                      <div className="space-y-6">
                         <div className={cn("inline-flex w-16 h-16 bg-white/5 rounded-3xl items-center justify-center shadow-2xl transition-all group-hover:scale-110", feature.glow)}>
                            <feature.icon size={32} className="text-white/40 group-hover:text-white transition-colors" />
                         </div>
                         <div className="flex items-center justify-between">
                            <h4 className="text-3xl font-black italic font-serif uppercase tracking-tighter text-white">{feature.title}</h4>
                            <span className="text-[9px] font-black bg-white/10 px-3 py-1.5 rounded-xl uppercase tracking-[0.3em] border border-white/10">{feature.tag}</span>
                         </div>
                         <p className="text-[11px] text-aura-muted font-bold uppercase tracking-[0.2em] leading-relaxed opacity-60">
                            {feature.description}
                         </p>
                      </div>
                      <button 
                        onClick={() => handleComingSoon()}
                        className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-aura-muted hover:text-white transition-colors active:translate-x-2 transition-transform"
                      >
                         Learn Protocol <Info size={16} className="text-purple-400" />
                      </button>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Footer Accent */}
        <footer className="mt-32 pt-16 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
           <div className="flex items-center gap-6">
              <img src="https://i.imgur.com/wU33xy3.png" alt="TWN" className="h-10 grayscale invert brightness-200" />
              <span className="text-sm font-black uppercase tracking-[0.6em] italic font-serif">Tavari Wave Network</span>
           </div>
           <div className="flex flex-col md:items-end gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">© 2026 TWN Protocol / Immutable Ledger Protected</p>
              <div className="flex gap-4 opacity-50 text-[8px] font-bold uppercase tracking-widest">
                 <span>Privacy Secured</span>
                 <span>Audited by CyberGuard</span>
                 <span>ISO 27001</span>
              </div>
           </div>
        </footer>
      </div>

      {/* Floating Particles Overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-ping" />
         <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '1s' }} />
         <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDelay: '2.5s' }} />
      </div>

      {/* Premium Global Coming Soon Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#0a0d1f] border-2 border-purple-500/30 rounded-[40px] p-10 shadow-[0_0_100px_rgba(168,85,247,0.3)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6">
                <button 
                  onClick={() => setModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[80px]" />

              <div className="relative space-y-8 text-center pt-8">
                <div className="w-24 h-24 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-purple-500/20 border border-white/20">
                  <Zap size={48} className="text-white animate-pulse" />
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic font-serif">
                    {modalType === 'wallet' ? 'Wallet Connection' : 'Protocol Access'} <br /> 
                    <span className="text-purple-400">COMING SOON</span>
                  </h3>
                  <div className="w-20 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent mx-auto" />
                  <p className="text-aura-muted text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed max-w-sm mx-auto opacity-70">
                    {modalType === 'wallet' 
                      ? "The secure wallet synchronization protocol for Tavari Wave Network is undergoing final cryptographic verification."
                      : "Mainnet interactive deployment interfaces are scheduled for global synchronization in the next development cycle."
                    }
                  </p>
                </div>

                <button 
                  onClick={() => setModalOpen(false)}
                  className="w-full py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-black uppercase tracking-[0.4em] text-[10px] rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-purple-500/20"
                >
                  Return to Dashboard
                </button>

                <p className="text-[8px] font-black uppercase tracking-widest text-aura-muted opacity-40">
                  Security Sequence: TWN_MAINFRAME_V4_RESTRICTED
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
}
