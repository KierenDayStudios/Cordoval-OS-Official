import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, TrendingDown, Landmark, Building2, Coins, Briefcase, 
  ArrowUpRight, ArrowDownRight, Award, RefreshCw, Plus, Minus,
  Server, Coffee, Zap, Home, Clock, DollarSign, Wallet, ShieldAlert,
  Store, Factory, Warehouse, Cpu, Rocket, Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { savePlayStateToIDB, loadPlayStateFromIDB } from '../../src/lib/playStorageDB';

// --- Interfaces ---
interface Stock {
  symbol: string;
  name: string;
  price: number;
  history: number[];
  changePercent: number;
  volatility: number;
  trend: number; // Momentum drift
}

interface UserStock {
  symbol: string;
  shares: number;
  avgBuyPrice: number;
}

interface Bond {
  id: string;
  name: string;
  yieldPercent: number;
  durationSeconds: number;
  cost: number;
  description: string;
  issuer: string;
}

interface ActiveBond {
  id: string;
  bondId: string;
  purchasePrice: number;
  interestPayout: number;
  expiresAt: number;
  secondsRemaining: number;
}

interface Property {
  id: string;
  name: string;
  baseCost: number;
  cost: number; // Current price for 1 unit
  baseYield: number; // Per unit revenue / sec
  quantity: number;
  description: string;
  icon: 'Coffee' | 'Home' | 'Building2' | 'Server' | 'Zap' | 'Landmark' | 'Store' | 'Factory' | 'Warehouse' | 'Cpu' | 'Rocket' | 'Truck';
}

// --- Initial Constants ---
const INITIAL_STOCKS: Stock[] = [
  {
    symbol: 'CRDV',
    name: 'Cordoval Tech Group',
    price: 154.20,
    history: [142, 143, 141, 145, 144, 146, 145, 148, 147, 149, 148, 150, 151, 149, 152, 153, 151, 154, 155, 153, 155, 154, 152, 153, 154, 155, 153, 154, 152, 154.2],
    changePercent: 1.25,
    volatility: 0.04,
    trend: 0.15
  },
  {
    symbol: 'AETH',
    name: 'Aether AI Networks',
    price: 320.50,
    history: [305, 308, 304, 311, 310, 315, 312, 318, 316, 322, 319, 324, 321, 328, 325, 332, 328, 335, 330, 332, 329, 331, 327, 324, 325, 328, 323, 322, 320, 320.5],
    changePercent: -0.85,
    volatility: 0.08,
    trend: 0.25
  },
  {
    symbol: 'GRID',
    name: 'Sovereign Grid Power',
    price: 45.10,
    history: [42.1, 42.5, 42.2, 42.8, 43.1, 43.0, 43.5, 43.4, 43.8, 44.1, 43.9, 44.2, 44.5, 44.3, 44.6, 44.9, 44.7, 45.0, 45.2, 45.0, 45.1, 44.9, 45.0, 45.2, 45.1, 45.3, 45.0, 45.1, 45.0, 45.1],
    changePercent: 0.45,
    volatility: 0.02,
    trend: 0.05
  },
  {
    symbol: 'LUNR',
    name: 'Lunar Helium Infrastructure',
    price: 88.75,
    history: [95, 93, 91, 88, 85, 82, 84, 86, 83, 80, 82, 85, 84, 88, 90, 89, 87, 85, 83, 86, 88, 89, 87, 86, 88, 90, 89, 88, 87, 88.75],
    changePercent: 2.10,
    volatility: 0.12,
    trend: -0.1
  },
  {
    symbol: 'BSYL',
    name: 'BioSynth Longevity Labs',
    price: 18.90,
    history: [25, 24, 23, 21, 19, 18, 17, 16, 18, 19, 17, 18, 19, 20, 19, 18, 19, 21, 20, 19, 18, 17, 18, 19, 18, 17, 18, 19, 18, 18.9],
    changePercent: -1.5,
    volatility: 0.15,
    trend: -0.2
  }
];

const BONDS: Bond[] = [
  { id: 'sov_treasury_60', name: '60s Short-Term Treasury Note', yieldPercent: 5, durationSeconds: 60, cost: 1000, description: 'Sovereign network treasury note backed by digital energy reserves.', issuer: 'Sovereign Treasury' },
  { id: 'corp_growth_120', name: '120s Corporate Growth Bond', yieldPercent: 12, durationSeconds: 120, cost: 5000, description: 'Apex corporate security note financing AI compute and sovereign network expansion.', issuer: 'Cordoval Corp' },
  { id: 'venture_300', name: '300s High-Yield Venture Note', yieldPercent: 35, durationSeconds: 300, cost: 20000, description: 'Speculative deep-tech venture debt funding planetary communication clusters.', issuer: 'Vanguard Alpha' }
];

const INITIAL_PROPERTIES: Property[] = [
  { id: 'coffee', name: 'Coffee Kiosk', baseCost: 100, cost: 100, baseYield: 1.5, quantity: 0, description: 'Serves artisanal, local roast to early-stage builders.', icon: 'Coffee' },
  { id: 'foodtruck', name: 'Gourmet Food Truck', baseCost: 350, cost: 350, baseYield: 5.0, quantity: 0, description: 'Serves high-grade local fuel & clean organic smoothies.', icon: 'Truck' },
  { id: 'bakery', name: 'Micro Bakery', baseCost: 1200, cost: 1200, baseYield: 18.0, quantity: 0, description: 'Sells premium sovereign grain sourdough loaves.', icon: 'Home' },
  { id: 'coworking', name: 'Co-Working Hub', baseCost: 4500, cost: 4500, baseYield: 75.0, quantity: 0, description: 'A structured, high-productivity space for startup teams.', icon: 'Building2' },
  { id: 'apartment', name: 'Apartment Complex', baseCost: 16000, cost: 16000, baseYield: 280.0, quantity: 0, description: 'Safe, sustainable living clusters for developer families.', icon: 'Building2' },
  { id: 'hotel', name: 'Boutique Hotel', baseCost: 60000, cost: 60000, baseYield: 1100.0, quantity: 0, description: 'A highly curated wellness retreat with custom local design.', icon: 'Store' },
  { id: 'datacenter', name: 'Edge Compute Node', baseCost: 220000, cost: 220000, baseYield: 4200.0, quantity: 0, description: 'Sells low-latency AI training slots and decentralized hosting.', icon: 'Server' },
  { id: 'warehouse', name: 'Automated Warehouse', baseCost: 850000, cost: 850000, baseYield: 17000.0, quantity: 0, description: 'Robotic fulfillment facility driving same-day local deliveries.', icon: 'Warehouse' },
  { id: 'biotech', name: 'BioSynth Research Lab', baseCost: 3200000, cost: 3200000, baseYield: 68000.0, quantity: 0, description: 'Researches modular synthetic biology and longevity enzymes.', icon: 'Zap' },
  { id: 'fusion', name: 'Sovereign Fusion Core', baseCost: 12500000, cost: 12500000, baseYield: 280000.0, quantity: 0, description: 'Limitless clean-energy grid that drives local industrial growth.', icon: 'Landmark' },
  { id: 'quantum', name: 'Quantum Computer Array', baseCost: 50000000, cost: 50000000, baseYield: 1200000.0, quantity: 0, description: 'Processes sub-second simulation pipelines for advanced tech labs.', icon: 'Cpu' },
  { id: 'spaceport', name: 'Logistics Spaceport', baseCost: 250000000, cost: 250000000, baseYield: 6500000.0, quantity: 0, description: 'Autonomous orbital shipping freight terminal for deep-space trade.', icon: 'Rocket' }
];

// --- Currency and Large Number Formatter ---
const formatCompact = (val: number, isCurrency = true, forceDecimals = false): string => {
  if (val === undefined || val === null || isNaN(val)) return isCurrency ? '$0' : '0';
  const isNegative = val < 0;
  const absVal = Math.abs(val);

  let formatted = '';
  if (absVal < 1000) {
    formatted = absVal.toLocaleString(undefined, {
      minimumFractionDigits: forceDecimals ? 2 : 0,
      maximumFractionDigits: 2,
    });
  } else if (absVal < 1000000) {
    const kVal = absVal / 1000;
    formatted = kVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: kVal < 100 ? 1 : 0,
    }) + 'k';
  } else if (absVal < 1000000000) {
    const mVal = absVal / 1000000;
    formatted = mVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: mVal < 100 ? 1 : 0,
    }) + 'm';
  } else if (absVal < 1000000000000) {
    const bVal = absVal / 1000000000;
    formatted = bVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: bVal < 100 ? 1 : 0,
    }) + 'b';
  } else {
    const tVal = absVal / 1000000000000;
    formatted = tVal.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: tVal < 100 ? 1 : 0,
    }) + 't';
  }

  const sign = isNegative ? '-' : '';
  return isCurrency ? `${sign}$${formatted}` : `${sign}${formatted}`;
};

interface PlayTabProps {
  onNavigate?: (view: any, data?: any) => void;
}

export const PlayTab: React.FC<PlayTabProps> = ({ onNavigate }) => {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<'stocks' | 'properties' | 'bonds'>('properties');

  // --- Liquid Balance state (Unified Bank Account) ---
  const [corBux, setCorBux] = useState<number>(() => {
    const saved = localStorage.getItem('crdv_play_corbux_v2');
    return saved ? parseFloat(saved) : 10000;
  });

  // --- State Variables ---
  const [stocks, setStocks] = useState<Stock[]>(() => {
    const saved = localStorage.getItem('crdv_play_stocks_v2');
    return saved ? JSON.parse(saved) : INITIAL_STOCKS;
  });

  const [myStocks, setMyStocks] = useState<UserStock[]>(() => {
    const saved = localStorage.getItem('crdv_play_mystocks_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [myBonds, setMyBonds] = useState<ActiveBond[]>(() => {
    const saved = localStorage.getItem('crdv_play_mybonds_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [properties, setProperties] = useState<Property[]>(() => {
    const saved = localStorage.getItem('crdv_play_properties_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Ensure legacy fields are merged with standard fields
        return INITIAL_PROPERTIES.map(initial => {
          const match = parsed.find((p: any) => p.id === initial.id);
          if (match) {
            return {
              ...initial,
              quantity: match.quantity ?? match.level ?? 0,
              cost: Math.round(initial.baseCost * Math.pow(1.15, match.quantity ?? match.level ?? 0))
            };
          }
          return initial;
        });
      } catch (e) {
        return INITIAL_PROPERTIES;
      }
    }
    return INITIAL_PROPERTIES;
  });

  const [activeStockSymbol, setActiveStockSymbol] = useState<string>('CRDV');
  const [tradeAmount, setTradeAmount] = useState<number>(1);
  const [buyQuantityMode, setBuyQuantityMode] = useState<1 | 10 | 'max'>(1);
  const [showRentIndicator, setShowRentIndicator] = useState<boolean>(false);
  const [lastRentPaid, setLastRentPaid] = useState<number>(0);
  
  // Offline Earnings Toast State
  const [offlineEarnings, setOfflineEarnings] = useState<{
    seconds: number;
    earned: number;
    rate: number;
  } | null>(null);

  // Web Worker Ref
  const workerRef = useRef<Worker | null>(null);

  // --- IndexedDB Hydration on Mount ---
  useEffect(() => {
    async function hydrateFromIDB() {
      const idbState = await loadPlayStateFromIDB();
      if (idbState) {
        if (idbState.corBux !== undefined) setCorBux(idbState.corBux);
        if (idbState.stocks && idbState.stocks.length > 0) setStocks(idbState.stocks);
        if (idbState.myStocks) setMyStocks(idbState.myStocks);
        if (idbState.myBonds) setMyBonds(idbState.myBonds);
        if (idbState.properties && idbState.properties.length > 0) {
          setProperties(INITIAL_PROPERTIES.map(initial => {
            const match = idbState.properties.find((p: any) => p.id === initial.id);
            if (match) {
              return {
                ...initial,
                quantity: match.quantity ?? match.level ?? 0,
                cost: Math.round(initial.baseCost * Math.pow(1.15, match.quantity ?? match.level ?? 0))
              };
            }
            return initial;
          }));
        }

        // Compute offline earnings from IDB timestamp
        const passiveRate = (idbState.properties || []).reduce((sum: number, prop: any) => sum + ((prop.quantity || 0) * (prop.baseYield || 0)), 0);
        if (idbState.lastSaved && passiveRate > 0) {
          const elapsedSecs = (Date.now() - idbState.lastSaved) / 1000;
          if (elapsedSecs >= 10) {
            const earned = Math.floor(elapsedSecs * passiveRate);
            if (earned > 0) {
              setCorBux(b => b + earned);
              setOfflineEarnings({
                seconds: Math.floor(elapsedSecs),
                earned,
                rate: passiveRate
              });
            }
          }
        }
      }
    }
    hydrateFromIDB();
  }, []);

  // --- Persistence Hooks (LocalStorage + IndexedDB) ---
  useEffect(() => {
    localStorage.setItem('crdv_play_corbux_v2', corBux.toString());
    savePlayStateToIDB({ corBux, stocks, myStocks, myBonds, properties });
  }, [corBux, stocks, myStocks, myBonds, properties]);

  // --- Web Worker Ticker Loop for Offline & Background Earnings ---
  useEffect(() => {
    const passiveRate = properties.reduce((sum, prop) => sum + (prop.quantity * prop.baseYield), 0);

    if (typeof Worker !== 'undefined') {
      if (!workerRef.current) {
        try {
          workerRef.current = new Worker('/playWorker.js');
          workerRef.current.onmessage = (e) => {
            const { type, earnedYield } = e.data || {};
            if (type === 'TICK' && earnedYield > 0) {
              setCorBux(b => b + earnedYield);
              savePlayStateToIDB({ corBux: corBux + earnedYield, properties, stocks, myStocks, myBonds });
            }
          };
        } catch (err) {
          console.warn('Web Worker initialization error:', err);
        }
      }

      if (workerRef.current) {
        workerRef.current.postMessage({
          type: 'START',
          payload: { passiveYieldPerSec: passiveRate }
        });
      }
    }

    const lastSaved = localStorage.getItem('crdv_play_last_saved_v2');
    if (lastSaved && passiveRate > 0 && !offlineEarnings) {
      const elapsedSecs = (Date.now() - parseInt(lastSaved, 10)) / 1000;
      if (elapsedSecs >= 10) {
        const earned = Math.floor(elapsedSecs * passiveRate);
        if (earned > 0) {
          setCorBux(b => b + earned);
          setOfflineEarnings({
            seconds: Math.floor(elapsedSecs),
            earned: earned,
            rate: passiveRate
          });
        }
      }
    }

    const saveInterval = setInterval(() => {
      const now = Date.now();
      localStorage.setItem('crdv_play_last_saved_v2', now.toString());
      savePlayStateToIDB({ corBux, stocks, myStocks, myBonds, properties });
    }, 1000);

    return () => {
      clearInterval(saveInterval);
      if (workerRef.current) {
        workerRef.current.postMessage({ type: 'STOP' });
      }
    };
  }, [properties]);

  // --- Real-Time Stock Engine ---
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(prevStocks => 
        prevStocks.map(stock => {
          // Bounded random walk / Brownian motion simulation
          const randomFactor = Math.random() - 0.5; // -0.5 to 0.5
          const marketDrift = stock.trend + (Math.random() - 0.5) * 0.05;
          const deltaPercent = (randomFactor + marketDrift) * stock.volatility;
          
          const priceChange = stock.price * deltaPercent;
          const rawPrice = stock.price + priceChange;
          // Set floors/ceilings to prevent complete collapse or crazy hyperinflation
          const boundedPrice = Math.max(0.5, Math.min(10000, rawPrice));
          const newPrice = Math.round(boundedPrice * 100) / 100;

          // Maintain the history to exactly 30 elements
          const history = [...stock.history.slice(-29), newPrice];
          const initialInHistory = history[0] || newPrice;
          const changePercent = ((newPrice - initialInHistory) / initialInHistory) * 100;

          // Slowly revert trend towards zero to prevent runaway trends
          const newTrend = (marketDrift * 0.85);

          return {
            ...stock,
            price: newPrice,
            history,
            changePercent,
            trend: Math.max(-0.3, Math.min(0.3, newTrend))
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // --- Passive Revenue Accumulation & Bond Expirations (1-second clock) ---
  useEffect(() => {
    const secondInterval = setInterval(() => {
      // 1. Accumulate Passive Rent from Scalable Business assets
      const rentPerSecond = properties.reduce((sum, prop) => {
        return sum + (prop.quantity * prop.baseYield);
      }, 0);

      if (rentPerSecond > 0) {
        setCorBux(b => b + rentPerSecond);
        setLastRentPaid(rentPerSecond);
        setShowRentIndicator(true);
        // Fade out indicator
        setTimeout(() => setShowRentIndicator(false), 800);
      }

      // 2. Drive countdown on Active Bonds & handle maturities
      setMyBonds(prevBonds => {
        const updated: ActiveBond[] = [];
        const now = Date.now();

        prevBonds.forEach(active => {
          const secondsRemaining = Math.max(0, Math.round((active.expiresAt - now) / 1000));
          
          if (secondsRemaining <= 0) {
            // Bond matures! Return principal + interest back to liquid account
            const payoutAmount = active.purchasePrice + active.interestPayout;
            setCorBux(b => b + payoutAmount);
          } else {
            updated.push({
              ...active,
              secondsRemaining
            });
          }
        });

        return updated;
      });

    }, 1000);

    return () => clearInterval(secondInterval);
  }, [properties]);

  // --- Upgrade Cost Calculations for Property Assets ---
  const getUpgradeCost = (baseCost: number, quantity: number, amount: number) => {
    let total = 0;
    for (let i = 0; i < amount; i++) {
      total += Math.round(baseCost * Math.pow(1.15, quantity + i));
    }
    return total;
  };

  const getMaxAffordable = (baseCost: number, quantity: number, balance: number) => {
    let count = 0;
    let totalCost = 0;
    while (true) {
      const nextCost = Math.round(baseCost * Math.pow(1.15, quantity + count));
      if (totalCost + nextCost <= balance) {
        totalCost += nextCost;
        count++;
      } else {
        break;
      }
    }
    return { count, totalCost };
  };

  // --- Dynamic Financial Calculations ---
  const activeStock = stocks.find(s => s.symbol === activeStockSymbol) || stocks[0];
  const userHeldStock = myStocks.find(s => s.symbol === activeStockSymbol);

  const totalPortfolioValue = myStocks.reduce((sum, s) => {
    const currentPrice = stocks.find(st => st.symbol === s.symbol)?.price || 0;
    return sum + (s.shares * currentPrice);
  }, 0);

  const totalActiveBondInvestment = myBonds.reduce((sum, b) => sum + b.purchasePrice, 0);

  const totalPropertyInvested = properties.reduce((sum, p) => {
    let cost = 0;
    for (let i = 0; i < p.quantity; i++) {
      cost += Math.round(p.baseCost * Math.pow(1.15, i));
    }
    return sum + cost;
  }, 0);

  const netWorth = corBux + totalPortfolioValue + totalActiveBondInvestment + totalPropertyInvested;

  const totalPassiveIncomeRate = properties.reduce((sum, prop) => {
    return sum + (prop.quantity * prop.baseYield);
  }, 0);

  // --- Transactions & Trading Handlers ---
  const handleBuyStock = (amount: number) => {
    const cost = activeStock.price * amount;
    if (cost > corBux) return;

    setCorBux(b => b - cost);
    setMyStocks(prev => {
      const existing = prev.find(s => s.symbol === activeStockSymbol);
      if (existing) {
        const totalShares = existing.shares + amount;
        const avgBuyPrice = ((existing.shares * existing.avgBuyPrice) + cost) / totalShares;
        return prev.map(s => s.symbol === activeStockSymbol ? { ...s, shares: totalShares, avgBuyPrice } : s);
      } else {
        return [...prev, { symbol: activeStockSymbol, shares: amount, avgBuyPrice: activeStock.price }];
      }
    });
  };

  const handleSellStock = (amount: number) => {
    if (!userHeldStock || userHeldStock.shares < amount) return;

    const payout = activeStock.price * amount;
    setCorBux(b => b + payout);

    setMyStocks(prev => {
      const existing = prev.find(s => s.symbol === activeStockSymbol)!;
      if (existing.shares === amount) {
        return prev.filter(s => s.symbol !== activeStockSymbol);
      } else {
        return prev.map(s => s.symbol === activeStockSymbol ? { ...s, shares: existing.shares - amount } : s);
      }
    });
  };

  const handleBuyBond = (bond: Bond) => {
    if (corBux < bond.cost) return;

    setCorBux(b => b - bond.cost);
    const interest = bond.cost * (bond.yieldPercent / 100);
    const newActiveBond: ActiveBond = {
      id: Math.random().toString(36).substring(7),
      bondId: bond.id,
      purchasePrice: bond.cost,
      interestPayout: interest,
      expiresAt: Date.now() + (bond.durationSeconds * 1000),
      secondsRemaining: bond.durationSeconds
    };

    setMyBonds(prev => [...prev, newActiveBond]);
  };

  const handlePurchaseProperty = (property: Property) => {
    let purchaseQuantity = 0;
    let purchaseCost = 0;

    if (buyQuantityMode === 1) {
      purchaseQuantity = 1;
      purchaseCost = property.cost;
    } else if (buyQuantityMode === 10) {
      purchaseQuantity = 10;
      purchaseCost = getUpgradeCost(property.baseCost, property.quantity, 10);
    } else {
      const { count, totalCost } = getMaxAffordable(property.baseCost, property.quantity, corBux);
      purchaseQuantity = count;
      purchaseCost = totalCost;
    }

    if (purchaseQuantity <= 0 || corBux < purchaseCost) return;

    setCorBux(b => b - purchaseCost);
    setProperties(prev => prev.map(p => {
      if (p.id === property.id) {
        const nextQty = p.quantity + purchaseQuantity;
        return {
          ...p,
          quantity: nextQty,
          cost: Math.round(p.baseCost * Math.pow(1.15, nextQty))
        };
      }
      return p;
    }));
  };

  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to restart your simulated business empire? Your balance will return to $10,000.')) {
      setCorBux(10000);
      setStocks(INITIAL_STOCKS);
      setMyStocks([]);
      setMyBonds([]);
      setProperties(INITIAL_PROPERTIES);
      localStorage.removeItem('crdv_play_last_saved_v2');
    }
  };

  // Helper to render matching icons for business assets
  const renderPropertyIcon = (iconName: string) => {
    const classStyle = "text-emerald-500 w-5 h-5";
    switch(iconName) {
      case 'Coffee': return <Coffee className={classStyle} />;
      case 'Home': return <Home className={classStyle} />;
      case 'Building2': return <Building2 className={classStyle} />;
      case 'Server': return <Server className={classStyle} />;
      case 'Zap': return <Zap className={classStyle} />;
      case 'Store': return <Store className={classStyle} />;
      case 'Factory': return <Factory className={classStyle} />;
      case 'Warehouse': return <Warehouse className={classStyle} />;
      case 'Cpu': return <Cpu className={classStyle} />;
      case 'Rocket': return <Rocket className={classStyle} />;
      case 'Truck': return <Truck className={classStyle} />;
      default: return <Landmark className={classStyle} />;
    }
  };

  return (
    <div className="flex-1 bg-slate-50 text-slate-800 p-4 sm:p-6 overflow-y-auto font-sans">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* --- PERSISTENT ECONOMIC HEADER BAR --- */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 shadow-sm relative overflow-hidden">
          {/* Subtle background glow effect */}
          <div className="absolute top-0 left-1/4 w-96 h-20 bg-emerald-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/10">
              <Landmark size={26} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Digital Economic Core</span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-baseline gap-2">
                {formatCompact(netWorth, true, true)}
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Net Worth</span>
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-2 md:flex items-center gap-3 sm:gap-4 w-full md:w-auto">
            {/* Liquid Cash */}
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-left min-w-[125px] relative">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Liquid Cash</span>
              <span className="text-base sm:text-lg font-black text-emerald-600">
                {formatCompact(corBux, true, true)}
              </span>
              {/* Floating income indicator */}
              <AnimatePresence>
                {showRentIndicator && (
                  <motion.span 
                     initial={{ y: 8, opacity: 0 }}
                     animate={{ y: -12, opacity: 1 }}
                     exit={{ y: -24, opacity: 0 }}
                     className="absolute right-3 top-2 text-xs font-black text-emerald-600 pointer-events-none"
                  >
                    +{formatCompact(lastRentPaid)}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            {/* Passive Rate */}
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-left min-w-[125px]">
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Passive Revenue</span>
              <span className="text-base sm:text-lg font-black text-indigo-600 flex items-baseline gap-0.5">
                {formatCompact(totalPassiveIncomeRate)}
                <span className="text-[10px] font-bold text-slate-400">/s</span>
              </span>
            </div>

            {/* Reset */}
            <button 
              onClick={handleResetGame}
              className="col-span-2 md:col-span-1 h-[46px] px-3 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold"
              title="Reset Simulated Progress"
            >
              <RefreshCw size={13} />
              <span className="md:hidden">Reset Game</span>
            </button>
          </div>
        </div>

        {/* --- TOAST / MODAL FOR OFFLINE INCOME GENERATION --- */}
        <AnimatePresence>
          {offlineEarnings && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-gradient-to-r from-slate-50 to-white border-l-4 border-emerald-500 border-t border-r border-b border-slate-200 p-4 rounded-xl flex items-center justify-between gap-4 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Coins size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Sovereign Offline Yield Collected</h4>
                  <p className="text-xs text-slate-600">
                    Your passive networks generated <span className="text-emerald-600 font-extrabold">{formatCompact(offlineEarnings.earned)}</span> during your <span className="font-semibold text-slate-700">{Math.floor(offlineEarnings.seconds / 60)}m {offlineEarnings.seconds % 60}s</span> offline sleep cycle.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setOfflineEarnings(null)}
                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-lg text-xs transition-colors"
              >
                Accept
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- SUB-NAVIGATION TAB BAR --- */}
        <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 gap-1 select-none">
          <button
            onClick={() => setActiveTab('properties')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'properties' 
                ? 'bg-white text-slate-900 border-b-2 border-emerald-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
            }`}
          >
            <Building2 size={14} className={activeTab === 'properties' ? 'text-emerald-500' : ''} />
            <span>🏢 Real Estate & Business</span>
          </button>
          <button
            onClick={() => setActiveTab('stocks')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stocks' 
                ? 'bg-white text-slate-900 border-b-2 border-emerald-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
            }`}
          >
            <TrendingUp size={14} className={activeTab === 'stocks' ? 'text-emerald-500' : ''} />
            <span>📈 Stocks Exchange</span>
          </button>
          <button
            onClick={() => setActiveTab('bonds')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              activeTab === 'bonds' 
                ? 'bg-white text-slate-900 border-b-2 border-emerald-500 shadow-sm' 
                : 'text-slate-600 hover:text-slate-950 hover:bg-white/40'
            }`}
          >
            <Coins size={14} className={activeTab === 'bonds' ? 'text-emerald-500' : ''} />
            <span>📜 Sovereign Bonds</span>
          </button>
        </div>

        {/* --- MAIN MODULE LAYOUT VIEWPORTS --- */}
        <div className="min-h-[480px]">
          <AnimatePresence mode="wait">
            {/* 1. REAL ESTATE & BUSINESS MODULE */}
            {activeTab === 'properties' && (
              <motion.div
                key="properties-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Module Header Controls */}
                <div className="bg-white border border-slate-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Building2 size={16} className="text-emerald-500" />
                      Passive Revenue Portfolios
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Acquire and scale physical or digital infrastructure assets to multiply automatic dollar flows.</p>
                  </div>

                  {/* Buy Quantity Mode Toggle */}
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-black">
                    {( [1, 10, 'max'] as const ).map(mode => {
                      const isActive = buyQuantityMode === mode;
                      return (
                        <button
                          key={mode}
                          onClick={() => setBuyQuantityMode(mode)}
                          className={`px-3 py-1.5 rounded-md transition-all uppercase tracking-wider ${
                            isActive 
                              ? 'bg-emerald-500 text-slate-950 shadow-sm' 
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          {mode === 'max' ? 'Buy Max' : `Buy ${mode}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Properties Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {properties.map(property => {
                    const countOwned = property.quantity;
                    const isOwned = countOwned > 0;

                    // Calculate upgrade price based on selected mode
                    let currentPrice = 0;
                    let amountToBuy = 1;
                    let displayYieldGained = property.baseYield;

                    if (buyQuantityMode === 1) {
                      currentPrice = property.cost;
                      amountToBuy = 1;
                      displayYieldGained = property.baseYield;
                    } else if (buyQuantityMode === 10) {
                      currentPrice = getUpgradeCost(property.baseCost, property.quantity, 10);
                      amountToBuy = 10;
                      displayYieldGained = property.baseYield * 10;
                    } else {
                      const { count, totalCost } = getMaxAffordable(property.baseCost, property.quantity, corBux);
                      // If affordable count is 0, show the cost for buying 1 unit
                      currentPrice = count > 0 ? totalCost : property.cost;
                      amountToBuy = count > 0 ? count : 1;
                      displayYieldGained = property.baseYield * (count > 0 ? count : 1);
                    }

                    const canAfford = corBux >= currentPrice && (buyQuantityMode !== 'max' || amountToBuy > 0);
                    const totalAssetYield = countOwned * property.baseYield;

                    return (
                      <div 
                        key={property.id}
                        className={`bg-white border rounded-xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm ${
                          isOwned ? 'border-emerald-500/20 bg-gradient-to-b from-white to-emerald-50/10' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isOwned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                {renderPropertyIcon(property.icon)}
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 text-sm leading-none">{property.name}</h4>
                                <span className="text-[10px] text-slate-500 block mt-1">
                                  {formatCompact(property.baseYield, true)}/s cashflow per unit
                                </span>
                              </div>
                            </div>
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              isOwned ? 'bg-emerald-500/10 text-emerald-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                              Owned: {countOwned}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 leading-relaxed">{property.description}</p>
                        </div>

                        {/* Property financial summary row */}
                        <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 text-xs">
                          <div>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Total Cashflow</span>
                            <span className="text-sm font-black text-emerald-600">{formatCompact(totalAssetYield, true)}/s</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Unit Price</span>
                            <span className="text-slate-700 font-semibold">{formatCompact(property.cost, true)}</span>
                          </div>
                        </div>

                        {/* Buy Trigger */}
                        <button
                          onClick={() => handlePurchaseProperty(property)}
                          disabled={!canAfford}
                          className={`w-full py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                            canAfford 
                              ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer' 
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          }`}
                        >
                          <Plus size={13} className="stroke-[3]" />
                          <span>
                            {buyQuantityMode === 'max' 
                              ? `Buy Max (${amountToBuy}) (+${formatCompact(displayYieldGained, false)}/s) — ${formatCompact(currentPrice, true)}`
                              : `Buy ${amountToBuy} (+${formatCompact(displayYieldGained, false)}/s) — ${formatCompact(currentPrice, true)}`
                            }
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 2. STOCKS MARKET EXCHANGE MODULE */}
            {activeTab === 'stocks' && (
              <motion.div
                key="stocks-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left side: Tickers Selector and Core Sparkline Pane */}
                <div className="lg:col-span-8 space-y-4">
                  {/* Selector Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {stocks.map(stock => {
                      const isUp = stock.changePercent >= 0;
                      const active = stock.symbol === activeStockSymbol;
                      return (
                        <button
                          key={stock.symbol}
                          onClick={() => {
                            setActiveStockSymbol(stock.symbol);
                            setTradeAmount(1);
                          }}
                          className={`p-3 rounded-xl text-left transition-all border shadow-sm ${
                            active 
                              ? 'border-emerald-500 bg-emerald-50/60' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">{stock.symbol}</span>
                            {isUp ? (
                              <ArrowUpRight size={12} className="text-emerald-600" />
                            ) : (
                              <ArrowDownRight size={12} className="text-rose-600" />
                            )}
                          </div>
                          <div className="text-sm font-black text-slate-900">${stock.price.toFixed(2)}</div>
                          <div className={`text-[9px] font-bold ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isUp ? '+' : ''}{stock.changePercent.toFixed(2)}%
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* SVG Chart Panel */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{activeStock.name}</span>
                        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2 mt-0.5">
                          {activeStock.symbol} 
                          <span className="text-sm font-semibold text-slate-600">${activeStock.price.toFixed(2)}</span>
                        </h3>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Market Volatility</span>
                        <span className="text-xs font-bold text-slate-600">{(activeStock.volatility * 100).toFixed(0)}% High Variance</span>
                      </div>
                    </div>

                    {/* Highly Polished SVG Chart */}
                    <div className="h-44 w-full relative flex items-end pt-4 bg-slate-50 rounded-lg p-3 border border-slate-200">
                      {/* Gridline guidelines */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none p-3 opacity-30">
                        <div className="border-b border-slate-300 w-full" />
                        <div className="border-b border-slate-300 w-full" />
                        <div className="border-b border-slate-300 w-full" />
                      </div>

                      <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={activeStock.changePercent >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={activeStock.changePercent >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Area Fill */}
                        <path
                          fill="url(#chartGlow)"
                          stroke="none"
                          d={`M 0,120 ` + activeStock.history.map((price, idx) => {
                            const min = Math.min(...activeStock.history);
                            const max = Math.max(...activeStock.history);
                            const range = max - min || 1;
                            const x = (idx / (activeStock.history.length - 1)) * 400;
                            const y = 110 - ((price - min) / range) * 95;
                            return `L ${x},${y}`;
                          }).join(' ') + ` L 400,120 Z`}
                        />

                        {/* Sparkline */}
                        <polyline
                          fill="none"
                          stroke={activeStock.changePercent >= 0 ? '#10b981' : '#f43f5e'}
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={activeStock.history.map((price, idx) => {
                            const min = Math.min(...activeStock.history);
                            const max = Math.max(...activeStock.history);
                            const range = max - min || 1;
                            const x = (idx / (activeStock.history.length - 1)) * 400;
                            const y = 110 - ((price - min) / range) * 95;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                      </svg>
                      
                      <div className="absolute inset-x-3 bottom-2 flex justify-between text-[8px] font-black text-slate-500 uppercase tracking-widest">
                        <span>30 ticks ago</span>
                        <span>Sovereign Realtime Ticker Feed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right side: Trading Controls and Active Holdings */}
                <div className="lg:col-span-4 space-y-4">
                  {/* Trading Executions */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-500 uppercase tracking-widest">Exchange Desk</span>
                      <span className="font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
                        Owned: {userHeldStock?.shares || 0} shares
                      </span>
                    </div>

                    {/* Multi Trade-Amount Adjuster Buttons */}
                    <div className="flex items-center justify-between gap-1 bg-slate-50 p-1 rounded-lg border border-slate-200">
                      <button 
                        onClick={() => setTradeAmount(prev => Math.max(1, prev - 1))}
                        className="w-8 h-8 hover:bg-slate-200 hover:text-slate-900 text-slate-500 rounded-md flex items-center justify-center font-bold transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                      
                      <input 
                        type="number" 
                        value={tradeAmount} 
                        min="1"
                        onChange={(e) => setTradeAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                        className="flex-1 text-center font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 text-sm w-12"
                      />

                      <button 
                        onClick={() => setTradeAmount(prev => prev + 1)}
                        className="w-8 h-8 hover:bg-slate-200 hover:text-slate-900 text-slate-500 rounded-md flex items-center justify-center font-bold transition-colors"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Shortcut trading options */}
                    <div className="grid grid-cols-4 gap-1.5 text-[10px] font-black">
                      {[1, 10, 100].map(qty => (
                        <button
                          key={qty}
                          onClick={() => setTradeAmount(qty)}
                          className="py-1 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 hover:text-slate-900 transition-all"
                        >
                          {qty}
                        </button>
                      ))}
                      <button
                        onClick={() => {
                          const maxBuy = Math.floor(corBux / activeStock.price);
                          setTradeAmount(maxBuy > 0 ? maxBuy : 1);
                        }}
                        className="py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded hover:bg-emerald-500/20 transition-all"
                      >
                        Max Buy
                      </button>
                    </div>

                    {/* Pricing summary details */}
                    <div className="space-y-2 border-t border-slate-200 pt-3 text-xs font-semibold">
                      <div className="flex justify-between text-slate-500">
                        <span>Transaction Value:</span>
                        <span className="text-slate-900 font-extrabold">{formatCompact(activeStock.price * tradeAmount, true, true)}</span>
                      </div>
                      {userHeldStock && (
                        <div className="flex justify-between text-slate-500">
                          <span>Average Buy Price:</span>
                          <span className="text-slate-800 font-extrabold">${userHeldStock.avgBuyPrice.toFixed(2)}</span>
                        </div>
                      )}
                    </div>

                    {/* Instant Buy/Sell Button Submissions */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => handleBuyStock(tradeAmount)}
                        disabled={corBux < activeStock.price * tradeAmount}
                        className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black rounded-lg text-xs hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase tracking-wider shadow-md shadow-emerald-500/5"
                      >
                        Buy Shares
                      </button>
                      <button
                        onClick={() => handleSellStock(tradeAmount)}
                        disabled={!userHeldStock || userHeldStock.shares < tradeAmount}
                        className="w-full py-2.5 bg-rose-500 text-white font-black rounded-lg text-xs hover:bg-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all uppercase tracking-wider shadow-md shadow-rose-500/5"
                      >
                        Sell Shares
                      </button>
                    </div>
                  </div>

                  {/* Equity portfolio summary holdings list */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2">
                      Active Equity Portfolio
                    </h4>
                    {myStocks.length === 0 ? (
                      <p className="text-xs text-slate-500 italic py-2">No stocks currently owned in portfolio ledger.</p>
                    ) : (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                        {myStocks.map(held => {
                          const currentStockPrice = stocks.find(s => s.symbol === held.symbol)?.price || 0;
                          const currentValue = held.shares * currentStockPrice;
                          const totalCost = held.shares * held.avgBuyPrice;
                          const profitLoss = currentValue - totalCost;
                          const profitLossPercent = (profitLoss / (totalCost || 1)) * 100;

                          return (
                            <div key={held.symbol} className="flex justify-between items-center p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                              <div>
                                <span className="font-extrabold text-slate-900">{held.symbol}</span>
                                <span className="text-[9px] text-slate-500 block">{held.shares} shares @ ${held.avgBuyPrice.toFixed(2)}</span>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-slate-800 block">{formatCompact(currentValue, true, true)}</span>
                                <span className={`text-[9px] font-black flex items-center justify-end gap-0.5 ${profitLoss >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. SOVEREIGN & CORPORATE BONDS MODULE */}
            {activeTab === 'bonds' && (
              <motion.div
                key="bonds-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Left Columns: Available Bonds Marketplace */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Coins size={16} className="text-emerald-500" />
                      Sovereign Fixed-Yield Bonds
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">Secure, low-risk, locked duration notes paying guaranteed interest on maturity.</p>
                  </div>

                  <div className="space-y-3">
                    {BONDS.map(bond => {
                      const canAfford = corBux >= bond.cost;
                      return (
                        <div 
                          key={bond.id}
                          className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all hover:border-slate-300 shadow-sm"
                        >
                          <div className="space-y-1 max-w-md">
                            <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-md uppercase tracking-wider inline-block">
                              +{bond.yieldPercent}% Guaranteed Return
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm mt-2">{bond.name}</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">{bond.description}</p>
                            <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                              <span className="flex items-center gap-1">
                                <Clock size={11} /> Duration: {bond.durationSeconds}s
                              </span>
                              <span>•</span>
                              <span>Issuer: {bond.issuer}</span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 border-slate-200 pt-3 sm:pt-0">
                            <div className="text-left sm:text-right mb-2">
                              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block">Principal Cost</span>
                              <span className="text-sm font-black text-slate-900">{formatCompact(bond.cost, true)}</span>
                            </div>

                            <button
                              onClick={() => handleBuyBond(bond)}
                              disabled={!canAfford}
                              className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                canAfford 
                                  ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 cursor-pointer shadow-sm' 
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              }`}
                            >
                              Acquire Note
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right Columns: Active Timers and Payout Monitors */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 flex items-center justify-between">
                      <span>Active Locked Notes</span>
                      <span className="text-[10px] font-semibold text-slate-500">Matures automatically</span>
                    </h3>

                    {myBonds.length === 0 ? (
                      <div className="p-6 text-center space-y-2 border border-dashed border-slate-200 rounded-xl">
                        <Clock className="mx-auto text-slate-400 animate-pulse" size={24} />
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No active locked assets</p>
                        <p className="text-[10px] text-slate-500">Acquire short-term treasury or growth bonds to generate zero-risk capital growth multipliers.</p>
                      </div>
                    ) : (
                      <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                        {myBonds.map(active => {
                          const bondRef = BONDS.find(b => b.id === active.bondId);
                          const totalDuration = bondRef?.durationSeconds || 60;
                          const progress = ((totalDuration - active.secondsRemaining) / totalDuration) * 100;

                          return (
                            <div key={active.id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-2.5 shadow-sm">
                              <div className="flex justify-between items-start text-xs">
                                <div>
                                  <span className="font-extrabold text-slate-900 block text-xs leading-none">
                                    {formatCompact(active.purchasePrice, true)} Note
                                  </span>
                                  <span className="text-[10px] text-emerald-600 font-black tracking-wide block mt-1.5">
                                    Yield Payout: +{formatCompact(active.purchasePrice + active.interestPayout, true)}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-emerald-600 text-sm block leading-none">{active.secondsRemaining}s</span>
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block mt-1.5">Maturity</span>
                                </div>
                              </div>

                              {/* Progress bar timer */}
                              <div className="space-y-1">
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <motion.div 
                                    className="h-full bg-emerald-500 rounded-full"
                                    style={{ width: `${progress}%` }}
                                    transition={{ ease: "linear" }}
                                  />
                                </div>
                                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-wider">
                                  <span>Locked</span>
                                  <span>{Math.round(progress)}% Complete</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PlayTab Footer with Privacy & Terms */}
        {onNavigate && (
          <div className="mt-12 pt-8 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <p className="text-center sm:text-left">Play Mode Sandbox Privacy Protocol</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => onNavigate('settings', null)}
                className="hover:text-slate-900 transition-colors cursor-pointer text-slate-500 font-extrabold"
              >
                Legal & Terms
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
