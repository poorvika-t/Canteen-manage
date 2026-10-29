import React, { useState, useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { MenuItem, Order } from '../types';
import {
  ShieldCheck,
  Lock,
  LogOut,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  ChefHat,
  Volume2,
  RefreshCw,
  Search,
  Check,
  AlertTriangle,
} from 'lucide-react';

export const StaffPOSScreen: React.FC = () => {
  const {
    isStaffAuthenticated,
    staffRole,
    loginStaff,
    logoutStaff,
    orders,
    queueStats,
    startPreparingOrder,
    markOrderReady,
    markOrderServed,
    cancelOrder,
    enterCounterOrder,
    menuItems,
    playChime,
  } = useCanteen();

  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [lastServedNotice, setLastServedNotice] = useState<{ token: string; waitTime: string } | null>(null);

  // Walk-in order entry state
  const [showCounterEntry, setShowCounterEntry] = useState(false);
  const [walkinName, setWalkinName] = useState('');
  const [walkinType, setWalkinType] = useState<'DINE_IN' | 'TAKEAWAY'>('TAKEAWAY');
  const [walkinCart, setWalkinCart] = useState<{ [itemId: string]: number }>({});

  // Filter for orders list: 'ALL' | 'ACTIVE' | 'SERVED'
  const [orderFilter, setOrderFilter] = useState<'ACTIVE' | 'ALL' | 'SERVED'>('ACTIVE');

  const handlePinSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const success = loginStaff(enteredPin);
    if (!success) {
      setPinError(true);
      setTimeout(() => setPinError(false), 2000);
    } else {
      setEnteredPin('');
    }
  };

  const handleQuickLogin = (pin: string) => {
    setEnteredPin(pin);
    loginStaff(pin);
  };

  const handleMarkServed = (order: Order) => {
    const result = markOrderServed(order.id);
    if (result) {
      setLastServedNotice({
        token: order.tokenNo,
        waitTime: result.waitTimeFormatted,
      });
      setTimeout(() => {
        setLastServedNotice(null);
      }, 4500);
    }
  };

  const handleCounterOrderSubmit = () => {
    const selectedItems = Object.entries(walkinCart)
      .filter(([_, qty]) => qty > 0)
      .map(([itemId, qty]) => {
        const item = menuItems.find((m) => m.id === itemId)!;
        return { menuItem: item, quantity: qty };
      });

    if (selectedItems.length === 0) return;

    enterCounterOrder(walkinName || 'Counter Walk-in', selectedItems, walkinType);
    setWalkinCart({});
    setWalkinName('');
    setShowCounterEntry(false);
  };

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'ACTIVE') return o.status !== 'SERVED' && o.status !== 'CANCELLED';
    if (orderFilter === 'SERVED') return o.status === 'SERVED';
    return true;
  });

  // If not logged in, show clean PIN entry
  if (!isStaffAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 px-4 space-y-6">
        <div className="bg-white rounded-2xl border border-[#E9E5DA] p-8 shadow-sm text-center space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 text-sky-800 mx-auto flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-xl font-bold text-gray-900">Staff POS Terminal</h1>
            <p className="text-xs text-gray-500 mt-1">
              Enter terminal PIN to access kitchen orders, queue controls, and counter punch-in.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <input
                type="password"
                maxLength={4}
                value={enteredPin}
                onChange={(e) => setEnteredPin(e.target.value)}
                placeholder="Enter 4-Digit PIN"
                className={`w-full text-center text-2xl font-mono tracking-widest py-3 px-4 border rounded-xl focus:outline-none focus:ring-2 ${
                  pinError
                    ? 'border-red-300 ring-2 ring-red-200 bg-red-50'
                    : 'border-gray-200 focus:ring-sky-500 bg-[#FAF9F5]'
                }`}
                autoFocus
              />
              {pinError && (
                <span className="text-xs text-red-600 block mt-1.5 font-medium">
                  Invalid PIN. Try 1234 (Cashier) or 5678 (Kitchen Chef).
                </span>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-sky-700 hover:bg-sky-800 active:bg-sky-900 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
            >
              Unlock POS Terminal
            </button>
          </form>

          {/* Quick 1-Click PINs for effortless testing */}
          <div className="pt-4 border-t border-gray-100 text-left space-y-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
              Quick Test Fill (Click to Log In):
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('1234')}
                className="py-2 px-3 text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-200/80 rounded-lg transition-colors text-center"
              >
                Cashier (PIN: 1234)
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('5678')}
                className="py-2 px-3 text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-lg transition-colors text-center"
              >
                Kitchen Chef (PIN: 5678)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Top POS Status Bar */}
      <div className="bg-white rounded-xl border border-[#E9E5DA] p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 text-sky-900 flex items-center justify-center font-bold">
            <ChefHat className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-gray-900">
                POS Terminal · {staffRole === 'chef' ? 'Kitchen Display Station' : 'Counter Cashier #1'}
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                ONLINE
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Live automated wait-time calculator & JDBC transaction logger active
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playChime('chime')}
            className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Test Audio Chime"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowCounterEntry(!showCounterEntry)}
            className="px-3.5 py-2 text-xs font-semibold bg-sky-700 hover:bg-sky-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Enter Walk-in Order</span>
          </button>

          <button
            onClick={logoutStaff}
            className="p-2 text-gray-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Lock POS Terminal"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Notice banner when order is served with auto wait time */}
      {lastServedNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <span className="text-xs font-semibold">
              Token <strong className="font-bold">#{lastServedNotice.token}</strong> marked as SERVED!
              Automatically calculated wait time:{' '}
              <strong className="text-emerald-900 font-mono underline decoration-emerald-400">
                {lastServedNotice.waitTime}
              </strong>
              . Rolling average updated in database.
            </span>
          </div>
          <span className="text-[11px] text-emerald-800 font-mono">JDBC COMMIT ✓</span>
        </div>
      )}

      {/* 4 POS Queue Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-[#E9E5DA] shadow-xs">
          <span className="text-[11px] text-gray-500 block mb-1">Waiting in Queue</span>
          <span className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {queueStats.totalWaiting}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E9E5DA] shadow-xs">
          <span className="text-[11px] text-amber-700 block mb-1">Currently Cooking</span>
          <span className="text-2xl font-bold text-amber-800 font-mono tabular-nums">
            {queueStats.totalPreparing}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E9E5DA] shadow-xs">
          <span className="text-[11px] text-emerald-700 block mb-1">Ready for Pickup</span>
          <span className="text-2xl font-bold text-emerald-800 font-mono tabular-nums">
            {queueStats.totalReady}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E9E5DA] shadow-xs">
          <span className="text-[11px] text-sky-700 block mb-1">Served Today</span>
          <span className="text-2xl font-bold text-sky-800 font-mono tabular-nums">
            {queueStats.totalServedToday}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-[#E9E5DA] shadow-xs col-span-2 lg:col-span-1">
          <span className="text-[11px] text-gray-500 block mb-1">Avg Actual Wait</span>
          <span className="text-2xl font-bold text-gray-900 font-mono tabular-nums">
            {queueStats.avgWaitTimeMins}m
          </span>
        </div>
      </div>

      {/* Walk-in Order Punch Form (Collapsible) */}
      {showCounterEntry && (
        <div className="bg-white rounded-xl border-2 border-sky-300 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Punch Walk-In / Counter Order</h2>
              <p className="text-xs text-gray-500">Fast counter order creation with instant token generation</p>
            </div>
            <button
              onClick={() => setShowCounterEntry(false)}
              className="text-xs font-semibold text-gray-500 hover:text-gray-800"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Student Name or Counter Guest
              </label>
              <input
                type="text"
                value={walkinName}
                onChange={(e) => setWalkinName(e.target.value)}
                placeholder="e.g. Counter Student #3"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Order Packaging</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setWalkinType('DINE_IN')}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    walkinType === 'DINE_IN'
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  Dine In
                </button>
                <button
                  type="button"
                  onClick={() => setWalkinType('TAKEAWAY')}
                  className={`py-1.5 px-3 text-xs font-semibold rounded-lg border transition-all ${
                    walkinType === 'TAKEAWAY'
                      ? 'bg-sky-700 text-white border-sky-700'
                      : 'bg-white text-gray-700 border-gray-200'
                  }`}
                >
                  Takeaway
                </button>
              </div>
            </div>
          </div>

          {/* Quick select items */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block">Select Items</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {menuItems.map((item) => {
                const qty = walkinCart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-gray-200 bg-[#FAF9F5] flex flex-col justify-between"
                  >
                    <div>
                      <span className="text-xs font-bold text-gray-900 block leading-tight">{item.name}</span>
                      <span className="text-[11px] text-emerald-800 font-mono font-semibold block mt-0.5">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200/60">
                      <button
                        type="button"
                        onClick={() =>
                          setWalkinCart((prev) => ({
                            ...prev,
                            [item.id]: Math.max(0, (prev[item.id] || 0) - 1),
                          }))
                        }
                        className="w-6 h-6 rounded bg-white hover:bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-200"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold font-mono">{qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setWalkinCart((prev) => ({
                            ...prev,
                            [item.id]: (prev[item.id] || 0) + 1,
                          }))
                        }
                        className="w-6 h-6 rounded bg-sky-700 hover:bg-sky-800 flex items-center justify-center text-xs font-bold text-white shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleCounterOrderSubmit}
              disabled={Object.values(walkinCart).every((q) => q === 0)}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
            >
              Punch Order & Print Token
            </button>
          </div>
        </div>
      )}

      {/* Orders Management Board */}
      <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Live Orders Queue & Kitchen Controls</h2>
            <p className="text-xs text-gray-500">
              Advance cooking status and click &lsquo;Mark as Served&rsquo; to record actual wait times
            </p>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-lg text-xs">
            <button
              onClick={() => setOrderFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                orderFilter === 'ACTIVE' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Active Kitchen ({queueStats.totalWaiting + queueStats.totalPreparing + queueStats.totalReady})
            </button>
            <button
              onClick={() => setOrderFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                orderFilter === 'ALL' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              All Orders
            </button>
            <button
              onClick={() => setOrderFilter('SERVED')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                orderFilter === 'SERVED' ? 'bg-white text-gray-900 shadow-2xs font-bold' : 'text-gray-500'
              }`}
            >
              Served History ({queueStats.totalServedToday})
            </button>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-400 text-xs">
              No orders found in this view.
            </div>
          ) : (
            filteredOrders.map((ord) => {
              const isWaiting = ord.status === 'WAITING';
              const isPreparing = ord.status === 'PREPARING';
              const isReady = ord.status === 'READY_FOR_PICKUP';
              const isServed = ord.status === 'SERVED';

              // Elapsed time counter
              const elapsedMins = Math.floor((Date.now() - ord.createdAt) / 60000);

              return (
                <div
                  key={ord.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isReady
                      ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                      : isPreparing
                      ? 'bg-amber-50/70 border-amber-300'
                      : isServed
                      ? 'bg-[#FAF9F5] border-gray-200 opacity-80'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold font-mono text-gray-900 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                          #{ord.tokenNo}
                        </span>
                        <span className="text-xs font-semibold text-gray-700">{ord.studentName}</span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isReady
                            ? 'bg-emerald-700 text-white'
                            : isPreparing
                            ? 'bg-amber-700 text-white'
                            : isServed
                            ? 'bg-gray-200 text-gray-700'
                            : 'bg-sky-100 text-sky-900'
                        }`}
                      >
                        {ord.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      {ord.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="font-medium text-gray-800">
                            {i.quantity}x {i.menuItem.name}
                          </span>
                          {i.spicyLevel && <span className="text-gray-400 text-[11px]">{i.spicyLevel}</span>}
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-gray-200/60 text-[11px] text-gray-500 flex justify-between items-center font-mono">
                      <span>Ordered {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>
                        {isServed && ord.actualWaitTimeSeconds
                          ? `Wait: ${Math.floor(ord.actualWaitTimeSeconds / 60)}m ${ord.actualWaitTimeSeconds % 60}s`
                          : `Age: ${elapsedMins}m`}
                      </span>
                    </div>
                  </div>

                  {/* Actions for this order */}
                  <div className="pt-4 mt-3 border-t border-gray-200/60 flex items-center gap-2">
                    {isWaiting && (
                      <button
                        onClick={() => startPreparingOrder(ord.id)}
                        className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        Start Cooking
                      </button>
                    )}

                    {isPreparing && (
                      <button
                        onClick={() => markOrderReady(ord.id)}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs"
                      >
                        Mark as Ready
                      </button>
                    )}

                    {isReady && (
                      <button
                        onClick={() => handleMarkServed(ord)}
                        className="flex-1 py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-extrabold transition-all shadow-xs flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Mark as Served</span>
                      </button>
                    )}

                    {!isServed && (
                      <button
                        onClick={() => handleMarkServed(ord)}
                        title="Direct Quick Serve"
                        className="py-1.5 px-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition-colors"
                      >
                        Instant Serve
                      </button>
                    )}

                    {isServed && (
                      <div className="w-full text-center py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                        Served &amp; Completed
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
