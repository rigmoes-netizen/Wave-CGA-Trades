import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PlusCircle, 
  MinusCircle, 
  ArrowLeft, 
  Building2, 
  Bitcoin, 
  CheckCircle2, 
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Cpu,
  Wallet,
  Coins,
  CreditCard,
  BarChart3,
  Check
} from 'lucide-react';
import { cn, formatCurrency } from '../lib/utils';
import { QRCodeCanvas } from 'qrcode.react';
import { useAuth } from '../contexts/AuthContext';
import { useUI } from '../contexts/UIContext';
import { useNavigate } from 'react-router-dom';
import { DynamicBalance } from './DynamicBalance';
import SuccessModal from './SuccessModal';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  doc, 
  onSnapshot,
  updateDoc, 
  increment, 
  runTransaction
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { toast } from 'sonner';

// --- CONSTANTS ---
const CRYPTO_ADDRESSES = {
  usdt: "TJTym5Qs77hBEr2kEiJPVEQwR4kM2AosSG",
  erc20: "0x264E87AA85CBC641cBC4261a193bdc9948934E6D",
  btc: "bc1p2mw24svf4yg5d6v4lxk5309jlcgcqjdagaefuc0adac9z4ys2p5qfq9t8t"
};

const BANK_DETAILS = {
  name: "OPay",
  number: "6550002094",
  accountName: "TAVARI WAVE NETWORK"
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  regular: <BarChart3 className="w-5 h-5 text-white" />,
  premium: <Zap className="w-5 h-5 text-white" />,
  elite: <Coins className="w-5 h-5 text-white" />,
};

const getPlanIcon = (id: string) => PLAN_ICONS[id] || <Coins className="w-5 h-5 text-white" />;

export default function Invest() {
  const { user, profile, plans } = useAuth();
  const { setDistractionFree } = useUI();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<'funding_balance' | 'available_balance' | 'referral_earnings'>('funding_balance');
  const [view, setView] = useState<'plans' | 'summary' | 'payment'>('plans');
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [confirmedAmount, setConfirmedAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'crypto' | 'bank' | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number>(1400);

  useEffect(() => {
    if (!user || !profile) return;
    
    const isCipher = profile.role === 'cipher';
    const isVerified = user.emailVerified || isCipher;

    if (!isVerified) return;

    const unsubscribeRate = onSnapshot(doc(db, 'settings', 'system'), (doc) => {
      if (doc.exists()) {
        setExchangeRate(doc.data().usd_to_ngn_rate || 1400);
      }
    }, (error) => {
      console.warn("Settings listener blocked:", error.message);
    });
    return () => unsubscribeRate();
  }, [user, profile]);
  const [cryptoType, setCryptoType] = useState<'usdt' | 'erc20' | 'btc'>('usdt');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    // Enable distraction-free mode when entering the steps
    if (view !== 'plans') {
      setDistractionFree(true);
    } else {
      setDistractionFree(false);
    }

    return () => {
      // Ensure it's disabled when leaving the page entirely
      setDistractionFree(false);
    };
  }, [view, setDistractionFree]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const activateInvestment = async (inv: any) => {
    if (!user || !profile) return;
    
    if (profile.suspended || profile.banned) {
      toast.error("Account access restricted by System Protocol.");
      return;
    }

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      
      await runTransaction(db, async (transaction) => {
        const invRef = doc(db, 'investments', inv.id);
        const invSnap = await transaction.get(invRef);
        
        if (!invSnap.exists()) throw new Error("Investment not found.");
        const invData = invSnap.data();
        
        if (invData.status !== 'inactive') throw new Error("Investment cannot be activated.");

        // Update Investment
        transaction.update(invRef, {
          status: 'active',
          activated_at: now,
          last_sync: now,
          total_earned: 0,
          referral_bonus_processed: true
        });

        // Referral Bonus Logic
        if (profile.referred_by && !invData.referral_bonus_processed) {
          const bonusAmount = invData.amount * 0.05;
          const referrerRef = doc(db, 'users', profile.referred_by);
          const userRef = doc(db, 'users', user.uid);
          
          // Reward user
          transaction.update(userRef, {
            available_balance: increment(bonusAmount)
          });

          // Reward referrer
          transaction.update(referrerRef, {
            available_balance: increment(bonusAmount),
            referral_earnings: increment(bonusAmount),
            active_referrals: increment(1)
          });

          // Notifications
          const notificationRef1 = doc(collection(db, 'notifications'));
          transaction.set(notificationRef1, {
            user_id: user.uid,
            title: 'Referral Bonus Received',
            message: `You earned a ${formatCurrency(bonusAmount)} bonus for activating your investment under a referral code!`,
            type: 'success',
            read: false,
            created_at: now
          });

          const notificationRef2 = doc(collection(db, 'notifications'));
          transaction.set(notificationRef2, {
            user_id: profile.referred_by,
            title: 'Referral Reward',
            message: `Your network partner ${profile.username} activated an investment. You earned ${formatCurrency(bonusAmount)}!`,
            type: 'success',
            read: false,
            created_at: now
          });
          
          // Transaction history for bonuses
          const txRef1 = doc(collection(db, 'transactions'));
          transaction.set(txRef1, {
            user_id: user.uid,
            type: 'referral_bonus',
            amount: bonusAmount,
            status: 'approved',
            created_at: now,
            description: 'Self-activation bonus'
          });

          const txRef2 = doc(collection(db, 'transactions'));
          transaction.set(txRef2, {
            user_id: profile.referred_by,
            type: 'referral_reward',
            amount: bonusAmount,
            status: 'approved',
            created_at: now,
            description: `From partner ${profile.username}`
          });
        }
      });

      toast.success("Node Pulse Detected. Core Cycle Initiated + Referral Bonuses Dispersed.");
    } catch (error: any) {
      toast.error(error.message || "Activation failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartInvestment = (plan: any) => {
    const amountStr = amounts[plan.id] || '';
    const invAmount = parseFloat(amountStr);
    
    if (!amountStr || isNaN(invAmount)) {
      toast.error("Please enter a valid amount.");
      return;
    }

    if (invAmount < plan.min || invAmount > plan.max) {
      toast.error(`Amount must be between ${formatCurrency(plan.min)} and ${formatCurrency(plan.max)}`);
      return;
    }

    setSelectedPlan(plan);
    setConfirmedAmount(invAmount);
    setView('summary');
  };

  const submitInvestment = async () => {
    if (!user || !profile || !selectedPlan || !paymentMethod) return;
    
    if (profile.suspended || profile.banned) {
      toast.error("Account access restricted by System Protocol.");
      return;
    }

    // 1. OFFLINE PROTECTION
    if (!navigator.onLine) {
      toast.error("Connection unstable. Please retry when online.");
      return;
    }

    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) {
          throw new Error("User profile not found.");
        }

        const userData = userSnap.data();
        
        // 2. SERVER-SIDE BALANCE VALIDATION
        if (paymentMethod === 'wallet' && confirmedAmount > (userData[selectedWallet] || 0)) {
          throw new Error(`Insufficient ${selectedWallet.replace('_', ' ')}. Please fund your wallet.`);
        }

        // 3. LOG INVESTMENT
        const invRef = doc(collection(db, 'investments'));
        transaction.set(invRef, {
          user_id: user.uid,
          user_name: userData.name,
          plan_name: selectedPlan.name,
          amount: confirmedAmount,
          dailyRoi: selectedPlan.roi,
          duration: selectedPlan.duration,
          payment_method: paymentMethod,
          wallet_source: paymentMethod === 'wallet' ? selectedWallet : null,
          reference: transactionId || 'internal_wallet',
          status: paymentMethod === 'wallet' ? 'inactive' : 'pending',
          referral_bonus_processed: false,
          created_at: new Date().toISOString(),
        });

        // 4. ATOMIC BALANCE UPDATE
        if (paymentMethod === 'wallet') {
          transaction.update(userRef, {
            [selectedWallet]: increment(-confirmedAmount),
            total_invested: increment(confirmedAmount)
          });
        }

        // 5. TRANSACTION RECORD
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          user_id: user.uid,
          type: 'investment',
          amount: confirmedAmount,
          plan_name: selectedPlan.name,
          method: paymentMethod,
          wallet_source: paymentMethod === 'wallet' ? selectedWallet : null,
          status: paymentMethod === 'wallet' ? 'completed' : 'pending',
          created_at: new Date().toISOString()
        });
      });

      setShowSuccessModal(true);
      setAmounts({});
      setTransactionId('');
      toast.success(paymentMethod === 'wallet' ? "Investment initialized successfully." : "Investment request submitted. Awaiting network confirmation.");
    } catch (error: any) {
      console.error("Investment Error:", error);
      toast.error(error.message || "Process failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 lg:pb-8 bg-[#050608] -mx-6 -mt-8 px-6 pt-8 min-h-screen relative overflow-hidden transition-all duration-500">
      <SuccessModal 
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          setSelectedPlan(null);
          setView('plans');
          navigate('/dashboard#transactions');
        }}
        title={paymentMethod === 'wallet' ? "Deployment Successful" : "Deployment Pending"}
        message={paymentMethod === 'wallet' ? "Investment initialized and synchronized with the Tavari Wave Mainnet." : "Institutional deposit submitted. Awaiting network confirmation sequence."}
      />

      {/* Premium Background Accents */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full pointer-events-none translate-y-1/4 -translate-x-1/4" />
      
      <AnimatePresence mode="popLayout" initial={false}>
        {view === 'plans' && (
          <motion.div 
            key="plans"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="space-y-10 w-full"
          >
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="max-w-fit">
                <h1 className="text-3xl font-bold font-serif italic text-white tracking-tight">Investment Plans</h1>
                <p className="text-aura-muted text-[10px] md:text-[11px] font-medium lowercase tracking-tight opacity-50 leading-snug mt-1.5 max-w-[240px]">
                  choose the best plan that suits your goals <br /> 
                  and start earning daily rewards.
                </p>
              </div>
            </header>

            <div className="flex overflow-x-auto lg:grid lg:grid-cols-3 gap-5 lg:gap-8 max-w-5xl mx-auto py-2 md:py-4 px-4 lg:px-0 scrollbar-hide snap-x snap-mandatory">
              {plans.filter((p: any) => p.active_status !== false).map((plan: any) => {
                const customCardStyle: React.CSSProperties = {};
                if (plan.card_background) {
                  customCardStyle.backgroundColor = plan.card_background;
                }
                if (plan.card_border) {
                  customCardStyle.borderColor = plan.card_border;
                }
                if (plan.accent_color) {
                  customCardStyle.boxShadow = `0 10px 40px -10px ${plan.accent_color}66`;
                }

                return (
                  <div 
                    key={plan.id}
                    className={cn(
                      "border rounded-[2rem] flex flex-col p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-500 relative overflow-hidden group min-h-[200px] lg:min-h-[440px] w-[85%] md:w-[280px] lg:w-full max-w-[300px] mx-auto flex-shrink-0 snap-center",
                      !plan.card_border && plan.borderColor,
                      !plan.card_background && plan.bgColor
                    )}
                    style={customCardStyle}
                  >
                    <div className={cn("absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 blur-xl -z-0", plan.gradient)} />
                    
                    <div className="relative z-10 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-0">
                        <h3 
                          className={cn("text-lg lg:text-2xl font-black italic font-serif", !plan.accent_color && plan.color)}
                          style={plan.accent_color ? { color: plan.accent_color } : {}}
                        >
                          {plan.name}
                        </h3>
                        <div 
                          className={cn("inline-flex items-center justify-center p-2 rounded-xl shadow-inner", !plan.accent_color && plan.buttonColor)}
                          style={plan.accent_color ? { backgroundColor: `${plan.accent_color}22`, border: `1px solid ${plan.accent_color}33` } : {}}
                        >
                          {getPlanIcon(plan.id)}
                        </div>
                      </div>
                      
                      <p className="text-aura-muted text-[8px] lg:text-[9px] font-medium lowercase tracking-wide leading-tight max-w-[180px] mb-3 lg:mb-4 opacity-70 mt-0.5">
                        {plan.description}
                      </p>
    
                      <div className="my-1 lg:my-3 border-t border-white/5 pt-3 lg:pt-4">
                        <div className="flex items-center justify-between">
                           <span className="text-[7px] lg:text-[9px] font-black text-aura-muted uppercase tracking-[0.2em] leading-none">Daily Yield</span>
                           <span 
                             className={cn("text-xl lg:text-3xl font-black italic font-serif", !plan.accent_color && plan.color)}
                             style={plan.accent_color ? { color: plan.accent_color } : {}}
                           >
                             {(plan.roi * 100).toFixed(1)}%
                           </span>
                        </div>
                      </div>
    
                      <div className="space-y-3 lg:space-y-4 mb-6">
                        <div className="space-y-1.5">
                          <span className="text-[7px] lg:text-[8px] font-bold text-aura-muted uppercase tracking-widest block ml-1 leading-none">Threshold</span>
                          <div 
                            className={cn("flex items-center gap-2.5 p-2.5 lg:p-3 rounded-xl border bg-white/5", !plan.card_border && plan.borderColor)}
                            style={plan.card_border ? { borderColor: `${plan.card_border}33` } : {}}
                          >
                             <CreditCard size={12} className={!plan.accent_color ? plan.color : undefined} style={plan.accent_color ? { color: plan.accent_color } : {}} />
                             <span className="text-[9px] lg:text-[10px] font-bold text-white tracking-widest">
                               {formatCurrency(plan.min)} - {formatCurrency(plan.max)}
                             </span>
                          </div>
                        </div>
    
                        <div className="space-y-1.5">
                          <span className="text-[7px] lg:text-[8px] font-bold text-aura-muted uppercase tracking-widest block ml-1 leading-none">Amount ($)</span>
                          <div className="relative">
                            <span className={cn(
                              "absolute left-3 top-1/2 -translate-y-1/2 font-bold text-[10px] uppercase",
                              amounts[plan.id] && (parseFloat(amounts[plan.id]) < plan.min || parseFloat(amounts[plan.id]) > plan.max) ? "text-red-500" : "text-white/40"
                            )}>$</span>
                            <input 
                              type="number"
                              inputMode="decimal"
                              step="0.01"
                              placeholder="0.00"
                              value={amounts[plan.id] || ''}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9.]/g, '');
                                setAmounts({ [plan.id]: val }); 
                              }}
                              className={cn(
                                "w-full bg-white/5 border rounded-xl py-2.5 lg:py-3.5 pl-7 pr-3 text-[10px] font-black transition-all outline-none",
                                amounts[plan.id] && (parseFloat(amounts[plan.id]) < plan.min || parseFloat(amounts[plan.id]) > plan.max) 
                                  ? "border-red-500 text-red-500 focus:bg-red-500/10" 
                                  : "border-white/5 text-white focus:bg-white/10"
                              )}
                              style={(!amounts[plan.id] || parseFloat(amounts[plan.id]) >= plan.min && parseFloat(amounts[plan.id]) <= plan.max) && plan.card_border ? { borderColor: `${plan.card_border}40` } : {}}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
    
                    <button 
                      disabled={!amounts[plan.id] || parseFloat(amounts[plan.id]) < plan.min || parseFloat(amounts[plan.id]) > plan.max}
                      onClick={() => handleStartInvestment(plan)}
                      className={cn(
                        "w-full py-3.5 lg:py-4 rounded-xl text-white font-black text-[8px] lg:text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg active:scale-[0.98]",
                        !plan.accent_color && plan.buttonColor,
                        (!amounts[plan.id] || parseFloat(amounts[plan.id]) < plan.min || parseFloat(amounts[plan.id]) > plan.max) && "opacity-20 cursor-not-allowed grayscale"
                      )}
                      style={(!amounts[plan.id] || parseFloat(amounts[plan.id]) >= plan.min && parseFloat(amounts[plan.id]) <= plan.max) && plan.accent_color ? { backgroundColor: plan.accent_color, shadowColor: plan.accent_color } : {}}
                    >
                      Initialize Node
                    </button>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {view === 'summary' && selectedPlan && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, x: 10, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex items-center justify-center py-4 lg:py-10"
          >
            <div className="max-w-xl w-full">
             <div className="p-8 bg-[#11141b] border border-white/5 rounded-3xl space-y-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={() => setView('plans')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-aura-muted hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Plans
                </button>
 
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white italic font-serif">Confirm Investment</h3>
                  <p className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">Reviewing details for {selectedPlan.name} plan</p>
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <SummaryItem label="Allocation" value={formatCurrency(confirmedAmount)} />
                  <SummaryItem label="Plan Type" value={selectedPlan.name} />
                  <SummaryItem label="Daily ROI" value={`${(selectedPlan.roi * 100).toFixed(1)}%`} highlight />
                  <SummaryItem label="Daily Profit" value={formatCurrency(confirmedAmount * selectedPlan.roi)} highlight />
                </div>
 
                <div className="p-5 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                  <div className="flex items-start gap-4">
                    <input 
                      type="checkbox" 
                      id="terms"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-1 accent-primary h-4 w-4 rounded border-white/10 bg-white/5"
                    />
                    <label htmlFor="terms" className="text-[10px] font-bold text-aura-muted leading-relaxed uppercase tracking-[0.1em]">
                      I accept the investment terms and acknowledge that past performance does not guarantee future results.
                    </label>
                  </div>
                </div>
 
                <button 
                  disabled={!agreedToTerms}
                  onClick={() => setView('payment')}
                  className="w-full py-5 bg-primary text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-xl disabled:opacity-20 disabled:grayscale transition-all shadow-lg shadow-primary/20"
                >
                  Proceed to Payment
                </button>
             </div>
            </div>
          </motion.div>
        )}

        {view === 'payment' && selectedPlan && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 10, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex items-center justify-center py-4 lg:py-10"
          >
            <div className="max-w-xl w-full">
             <div className="p-8 bg-[#11141b] border border-white/5 rounded-3xl space-y-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                <button 
                  onClick={() => setView('summary')}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-aura-muted hover:text-white transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Summary
                </button>
 
                <AnimatePresence>
                </AnimatePresence>
 
                <div className="space-y-1">
                  <h3 className="text-3xl font-black text-white italic font-serif">Payment Method</h3>
                  <p className="text-[10px] font-bold text-aura-muted uppercase tracking-widest">Total cost: <span className="text-white font-black">{formatCurrency(confirmedAmount)}</span></p>
                </div>
 
                <div className="flex flex-col gap-4">
                   {(() => {
                     const options = [
                       { id: 'wallet' as const, label: 'Wallet Balance', icon: <Wallet size={18} />, description: `${selectedWallet.split('_')[0].charAt(0).toUpperCase() + selectedWallet.split('_')[0].slice(1)} balance (${formatCurrency(profile?.[selectedWallet] || 0)})` },
                       { id: 'crypto' as const, label: 'Crypto Payments', icon: <Bitcoin size={18} />, description: "Pay via USDT, BTC, or ERC20" },
                       { id: 'bank' as const, label: 'Bank Transfer', icon: <Building2 size={18} />, description: "Direct institutional transfer" },
                     ];

                     const sortedOptions = [...options].sort((a, b) => {
                       if (a.id === paymentMethod) return 1;
                       if (b.id === paymentMethod) return -1;
                       return 0;
                     });

                     return sortedOptions.map((opt) => (
                       <motion.div layout key={opt.id} className="flex flex-col gap-4">
                         <PaymentOption 
                           icon={opt.icon} 
                           label={opt.label} 
                           description={opt.description}
                           selected={paymentMethod === opt.id}
                           onClick={() => setPaymentMethod(opt.id)}
                         />

                         {paymentMethod === 'wallet' && opt.id === 'wallet' && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4 pt-1 overflow-hidden">
                              <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10">
                                {(['funding_balance', 'available_balance', 'referral_earnings'] as const).map(w => (
                                  <button 
                                    key={w}
                                    onClick={() => setSelectedWallet(w)}
                                    className={cn(
                                      "flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                                      selectedWallet === w ? "bg-primary text-white shadow-sm" : "text-aura-muted hover:text-white"
                                    )}
                                  >
                                    {w.split('_')[0]}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl">
                                <div>
                                  <p className="text-[8px] font-black text-aura-muted uppercase tracking-widest mb-1">New Allocation</p>
                                  <p className="text-sm font-black text-white italic font-serif">{formatCurrency(confirmedAmount)}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    const balance = profile?.[selectedWallet] || 0;
                                    const cleanBalance = parseFloat(balance.toFixed(2));
                                    
                                    // Validation and Plan Switch Logic
                                    const appropriatePlan = (plans || []).filter((p: any) => p.active_status !== false).find((p: any) => cleanBalance >= p.min && cleanBalance <= p.max);
                                    
                                    if (appropriatePlan) {
                                      if (appropriatePlan.id !== selectedPlan?.id) {
                                        setSelectedPlan(appropriatePlan);
                                        toast.success(`Plan updated to ${appropriatePlan.name} for ${formatCurrency(cleanBalance)} allocation.`);
                                      }
                                      setConfirmedAmount(cleanBalance);
                                    } else {
                                      // Fallback: update amount anyway but check if it's too high for all or too low for all
                                      setConfirmedAmount(cleanBalance);
                                      const activePlans = (plans || []).filter((p: any) => p.active_status !== false);
                                      if (activePlans.length > 0) {
                                        if (cleanBalance < activePlans[0].min) {
                                          toast.error(`Minimum investment is ${formatCurrency(activePlans[0].min)}`);
                                        } else if (cleanBalance > activePlans[activePlans.length - 1].max) {
                                          toast.error(`Maximum investment is ${formatCurrency(activePlans[activePlans.length - 1].max)}`);
                                        }
                                      }
                                    }
                                  }}
                                  className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-primary/20"
                                >
                                  USE MAX BALANCE
                                </button>
                              </div>

                              {confirmedAmount > (profile?.[selectedWallet] || 0) && (
                                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center animate-pulse">Insufficient operational capital.</p>
                              )}
                              
                              {selectedPlan && (confirmedAmount < selectedPlan.min || confirmedAmount > selectedPlan.max) && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
                                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">
                                    Allocation outside {selectedPlan.name} limits ({formatCurrency(selectedPlan.min)} - {formatCurrency(selectedPlan.max)})
                                  </p>
                                  <div className="mt-3 grid grid-cols-1 gap-2">
                                    {(plans || []).filter((p: any) => p.active_status !== false).map((p: any) => (
                                      confirmedAmount >= p.min && confirmedAmount <= p.max && (
                                        <button 
                                          key={p.id}
                                          onClick={() => setSelectedPlan(p)}
                                          className="w-full py-2 bg-red-500 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                                        >
                                          Switch to {p.name} Plan
                                        </button>
                                      )
                                    ))}
                                  </div>
                                </div>
                              )}
                           </motion.div>
                         )}

                         {paymentMethod === 'crypto' && opt.id === 'crypto' && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-1 overflow-hidden">
                              <div className="flex gap-2">
                                {(['usdt', 'erc20', 'btc'] as const).map(t => (
                                  <button 
                                    key={t} 
                                    onClick={() => setCryptoType(t)}
                                    className={cn(
                                      "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                      cryptoType === t ? "bg-primary border-primary text-white" : "bg-white/5 border-white/5 text-aura-muted"
                                    )}
                                  >
                                    {t.toUpperCase()}
                                  </button>
                                ))}
                              </div>
                              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center gap-6">
                                <div className="p-4 bg-white rounded-2xl shadow-xl"><QRCodeCanvas value={CRYPTO_ADDRESSES[cryptoType]} size={140} /></div>
                                <div className="w-full space-y-2">
                                  <p className="text-[10px] font-black uppercase text-center text-aura-muted tracking-widest">Target Address</p>
                                  <div className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between gap-4 shadow-inner">
                                    <code className="text-[10px] font-mono text-white truncate">{CRYPTO_ADDRESSES[cryptoType]}</code>
                                    <button onClick={() => handleCopy(CRYPTO_ADDRESSES[cryptoType], 'wallet')} className="text-[9px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg uppercase tracking-widest">
                                      {copiedField === 'wallet' ? 'Copied' : 'Copy'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-aura-muted ml-1">Transaction ID</label>
                                <input 
                                  type="text"
                                  value={transactionId}
                                  onChange={(e) => setTransactionId(e.target.value)}
                                  placeholder="Transaction ID"
                                  className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-xs font-mono focus:bg-white/10 focus:border-primary/50 outline-none transition-all text-white"
                                />
                              </div>
                           </motion.div>
                         )}

                         {paymentMethod === 'bank' && opt.id === 'bank' && (
                           <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5 pt-1 overflow-hidden text-left">
                              <div className="p-6 bg-white/5 border border-white/5 rounded-3xl space-y-5 shadow-inner">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase text-aura-muted tracking-widest">
                                  <span>Bank</span>
                                  <span className="text-white font-black">{BANK_DETAILS.name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="flex flex-col">
                                    <p className="text-[10px] text-aura-muted uppercase tracking-widest font-black">Account</p>
                                    <code className="text-base font-black text-white tracking-widest">{BANK_DETAILS.number}</code>
                                  </div>
                                  <button onClick={() => handleCopy(BANK_DETAILS.number, 'accNum')} className="text-[9px] font-black text-primary bg-primary/10 px-3 py-2 rounded-lg shadow-sm uppercase tracking-widest">
                                    {copiedField === 'accNum' ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                                  <div className="max-w-[180px]">
                                    <p className="text-[10px] text-aura-muted uppercase tracking-widest font-black">Name</p>
                                    <p className="text-[11px] font-black text-white uppercase leading-tight italic font-serif">{BANK_DETAILS.accountName}</p>
                                  </div>
                                  <button onClick={() => handleCopy(BANK_DETAILS.accountName, 'accName')} className="text-[9px] font-black text-primary bg-primary/10 px-3 py-2 rounded-lg shadow-sm uppercase tracking-widest">
                                    {copiedField === 'accName' ? 'Copied' : 'Copy'}
                                  </button>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="text-[10px] font-black uppercase tracking-widest text-aura-muted ml-1">Transaction ID</label>
                                  <input 
                                    type="text"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    placeholder="Transaction ID"
                                    className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-4 text-xs font-mono focus:bg-white/10 focus:border-primary/50 outline-none transition-all text-white"
                                  />
                                </div>
                                
                                {confirmedAmount > 0 && (
                                  <motion.div 
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="px-2 space-y-2 text-center"
                                  >
                                    <div className="flex items-center justify-center gap-4">
                                       <span className="text-xl font-black text-white italic tracking-tight font-serif">${confirmedAmount.toFixed(2)}</span>
                                       <span className="text-xl font-black text-aura-muted opacity-40">=</span>
                                       <span className="text-xl font-black text-[#10B981] italic tracking-tight font-serif">₦{(confirmedAmount * exchangeRate).toLocaleString()}</span>
                                    </div>
                                    <p className="text-[9px] font-bold text-red-500/80 uppercase tracking-widest">• Send exactly this amount</p>
                                  </motion.div>
                                )}
                              </div>
                           </motion.div>
                         )}
                       </motion.div>
                     ));
                   })()}
                </div>
 
                <button 
                  disabled={!paymentMethod || isSubmitting || ((paymentMethod === 'bank' || paymentMethod === 'crypto') ? !transactionId : confirmedAmount > (profile?.[selectedWallet] || 0))}
                  onClick={submitInvestment}
                  className={cn(
                    "w-full py-5 text-white font-black uppercase tracking-[0.3em] text-[10px] rounded-2xl shadow-lg disabled:opacity-20 transition-all",
                    selectedPlan.buttonColor
                  )}
                >
                  {(paymentMethod === 'bank' || paymentMethod === 'crypto') ? 'Confirm Transmission' : 'Initialize Cycle'}
                </button>
 
                <p className="text-[9px] text-center text-aura-muted uppercase font-bold tracking-[0.2em]">
                  Secure Neural Link Encryption Active
                </p>
             </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string, value: string, highlight?: boolean }) {
  return (
    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
      <p className="text-[8px] font-bold text-aura-muted uppercase tracking-widest mb-1">{label}</p>
      <DynamicBalance 
        value={value} 
        containerClassName="justify-start" 
        className={cn("text-left h-7", highlight ? "text-emerald-500" : "text-white")}
        baseSizeMobile="text-base"
        baseSizeDesktop="lg:text-lg"
      />
    </div>
  );
}

function PaymentOption({ icon, label, description, selected, onClick }: { icon: React.ReactNode, label: string, description: string, selected: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full p-4 rounded-2xl border transition-all flex items-center gap-4 text-left group",
        selected ? "bg-primary border-primary shadow-lg shadow-primary/20" : "bg-white/5 border-white/5 hover:border-white/10"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors shadow-inner",
        selected ? "bg-white/20 text-white" : "bg-white/5 text-aura-muted group-hover:text-white"
      )}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={cn("text-[11px] font-bold uppercase tracking-widest", selected ? "text-white" : "text-white/80")}>{label}</p>
        <p className={cn("text-[8px] font-bold uppercase tracking-tight mt-0.5", selected ? "text-white/60" : "text-aura-muted")}>{description}</p>
      </div>
      <div className={cn(
        "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
        selected ? "bg-white border-white text-primary" : "border-white/10 bg-white/5"
      )}>
        {selected && <Check size={12} strokeWidth={4} />}
      </div>
    </button>
  );
}
