import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { MenuItem } from '../types';
import {
  Clock,
  ShoppingBag,
  Calendar,
  ListOrdered,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Utensils,
  Coffee,
  X,
  CreditCard,
  UserCheck,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const {
    students,
    currentStudent,
    switchStudent,
    breaks,
    currentBreakInfo,
    menuItems,
    cart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    placeOrder,
    orders,
    studentActiveOrder,
    queueStats,
    startCanteenSession,
    activeSession,
  } = useCanteen();

  // Internal tab state: 'menu' | 'queue' | 'timetable'
  const [activeSubTab, setActiveSubTab] = useState<'menu' | 'queue' | 'timetable'>('menu');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'BREAKFAST' | 'MEALS' | 'BEVERAGES' | 'SNACKS'>('ALL');
  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKEAWAY'>('DINE_IN');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [justOrderedToken, setJustOrderedToken] = useState<string | null>(null);

  // Selected item modal for customization
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [selectedSpicy, setSelectedSpicy] = useState<'Mild' | 'Medium' | 'Extra'>('Medium');
  const [customNotes, setCustomNotes] = useState('');

  const filteredMenuItems = menuItems.filter((item) => {
    if (selectedCategory === 'ALL') return true;
    return item.category === selectedCategory;
  });

  const handleCustomAdd = () => {
    if (!customizingItem) return;
    addToCart(customizingItem, selectedSpicy, customNotes);
    setCustomizingItem(null);
    setSelectedSpicy('Medium');
    setCustomNotes('');
  };

  const handleCheckout = () => {
    const placed = placeOrder(orderType);
    if (placed) {
      setJustOrderedToken(placed.tokenNo);
      setIsCartOpen(false);
      setActiveSubTab('queue');
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Student Profile & Quick Switch Header */}
      <section className="bg-white rounded-xl border border-[#E9E5DA] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-900 font-bold text-base shadow-2xs">
              {currentStudent.avatarSeed}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-gray-900">{currentStudent.name}</h1>
                <span className="text-xs text-emerald-900 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {currentStudent.studentId}
                </span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>{currentStudent.department}</span>
                <span>·</span>
                <span>{currentStudent.year}</span>
                <span>·</span>
                <span>
                  Campus Card Balance:{' '}
                  <strong className="text-emerald-800 font-semibold tabular-nums font-mono">
                    ${currentStudent.balance.toFixed(2)}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Switch Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 hidden sm:inline">Switch Student:</span>
            <select
              value={currentStudent.id}
              onChange={(e) => switchStudent(e.target.value)}
              className="text-xs font-semibold bg-[#FAF9F5] border border-[#DDD8CB] text-gray-800 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.department.split(' ')[0]}) - ${s.balance.toFixed(2)}
                </option>
              ))}
            </select>

            {!activeSession && (
              <button
                onClick={startCanteenSession}
                className="text-xs font-semibold px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg transition-colors whitespace-nowrap shadow-xs"
              >
                Check in at Canteen
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Sub navigation segmented buttons */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-[#EAE6DC] pb-3">
        <div className="flex items-center gap-1.5 p-1 bg-[#F4F0E6] rounded-xl border border-[#E5E0D3]">
          <button
            onClick={() => setActiveSubTab('menu')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'menu'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Utensils className="w-3.5 h-3.5 text-emerald-700" />
            <span>Kitchen Menu & Order</span>
          </button>

          <button
            onClick={() => setActiveSubTab('queue')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'queue'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-emerald-700" />
            <span>Live Queue List ({queueStats.totalWaiting + queueStats.totalPreparing})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('timetable')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeSubTab === 'timetable'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Break Schedule</span>
          </button>
        </div>

        {/* Cart Quick Button */}
        {cart.length > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({cart.reduce((a, b) => a + b.quantity, 0)} items)</span>
            <span>·</span>
            <span className="font-mono tabular-nums">${cartTotal.toFixed(2)}</span>
          </button>
        )}
      </div>

      {/* SUB-VIEW 1: MENU ORDERING */}
      {activeSubTab === 'menu' && (
        <div className="space-y-6">
          {/* Category Filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {(
              [
                { id: 'ALL', label: 'All Items' },
                { id: 'BREAKFAST', label: 'Breakfast & Dosa' },
                { id: 'MEALS', label: 'Healthy Bowls & Meals' },
                { id: 'BEVERAGES', label: 'Cold Drinks & Coffee' },
                { id: 'SNACKS', label: 'Quick Bites' },
              ] as const
            ).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all font-medium ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-800 text-white shadow-2xs font-semibold'
                    : 'bg-white text-gray-700 hover:bg-[#F8F6F0] border border-[#EAE6DC]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredMenuItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-[#E9E5DA] overflow-hidden flex flex-col justify-between hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                <div>
                  <div className="relative h-40 bg-[#FAF9F5] overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-white shadow-xs">
                        Veg
                      </span>
                      {item.isPopular && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-600 text-white shadow-xs">
                          Student Favorite
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-2.5 text-[11px] font-semibold px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-gray-800 shadow-2xs border border-white/60 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-emerald-700" />
                      <span>{item.prepTimeMinutes} min prep</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 leading-snug">{item.name}</h3>
                      <span className="text-sm font-bold text-emerald-900 font-mono tabular-nums shrink-0">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {item.description}
                    </p>
                    <div className="text-[11px] text-gray-400">
                      <span>{item.calories} kcal</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => setCustomizingItem(item)}
                    className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: LIVE CANTEEN QUEUE LIST */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* Active order banner if user placed order */}
          {studentActiveOrder && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-[#F0FDF4] to-[#ECFDF5] border border-emerald-300 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                      Your Active Live Token
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-700 text-white">
                      #{studentActiveOrder.tokenNo}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-950 font-medium">
                    Status:{' '}
                    <strong className="text-emerald-900">
                      {studentActiveOrder.status === 'READY_FOR_PICKUP'
                        ? 'Ready at Counter 2!'
                        : studentActiveOrder.status === 'PREPARING'
                        ? 'Kitchen is preparing your meal'
                        : 'Waiting in line'}
                    </strong>
                  </p>
                  <p className="text-xs text-emerald-800">
                    Estimated Wait:{' '}
                    <span className="font-semibold tabular-nums">~{studentActiveOrder.estimatedWaitMinutes} minutes</span>{' '}
                    · Ordered: {new Date(studentActiveOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="text-right sm:border-l sm:border-emerald-200 sm:pl-6">
                  <span className="text-xs text-emerald-800 block">Items Total</span>
                  <span className="text-xl font-bold text-emerald-950 font-mono tabular-nums">
                    ${studentActiveOrder.totalAmount.toFixed(2)}
                  </span>
                  <div className="text-[11px] text-emerald-700 mt-1">
                    {studentActiveOrder.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Real-time Queue Board */}
          <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 sm:p-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Live Kitchen Queue & Wait Times</h2>
                <p className="text-xs text-gray-500">Auto-refreshed with real-time cooking & counter throughput</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-500">Serving Now:</span>
                <span className="font-bold text-emerald-900 text-sm font-mono tabular-nums bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  #{queueStats.servingNowToken}
                </span>
              </div>
            </div>

            <div className="divide-y divide-gray-100 pt-2">
              {orders.map((ord) => {
                const isMine = ord.studentId === currentStudent.id;
                const isReady = ord.status === 'READY_FOR_PICKUP';
                const isPrep = ord.status === 'PREPARING';
                const isWaiting = ord.status === 'WAITING';
                const isServed = ord.status === 'SERVED';

                return (
                  <div
                    key={ord.id}
                    className={`py-3.5 px-3 flex flex-wrap items-center justify-between gap-3 rounded-lg transition-colors ${
                      isMine ? 'bg-emerald-50/70 border border-emerald-200/60' : 'hover:bg-gray-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-11 h-11 rounded-lg flex items-center justify-center font-mono font-bold text-sm ${
                          isReady
                            ? 'bg-emerald-600 text-white'
                            : isPrep
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : isServed
                            ? 'bg-gray-100 text-gray-500'
                            : 'bg-sky-50 text-sky-900 border border-sky-200'
                        }`}
                      >
                        #{ord.tokenNo}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            {ord.studentName}
                          </span>
                          {isMine && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-700 text-white rounded">
                              YOU
                            </span>
                          )}
                          <span className="text-xs text-gray-400">·</span>
                          <span className="text-xs text-gray-500">
                            {ord.orderType === 'DINE_IN' ? 'Dine In' : 'Takeaway'}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                          <span>{ord.items.map((i) => `${i.quantity}x ${i.menuItem.name}`).join(', ')}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div>
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-md block ${
                            isReady
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              : isPrep
                              ? 'bg-amber-50 text-amber-900 border border-amber-200'
                              : isServed
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-sky-50 text-sky-900 border border-sky-200'
                          }`}
                        >
                          {isReady
                            ? 'Ready for Pickup'
                            : isPrep
                            ? 'Cooking Now'
                            : isServed
                            ? 'Served & Done'
                            : 'In Queue'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-mono tabular-nums block mt-0.5">
                          {isServed && ord.actualWaitTimeSeconds
                            ? `Served in ${Math.floor(ord.actualWaitTimeSeconds / 60)}m ${ord.actualWaitTimeSeconds % 60}s`
                            : isReady
                            ? 'Counter 2'
                            : `Est: ~${ord.estimatedWaitMinutes}m`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: TIMETABLE BREAK SCHEDULE VIEWER */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-bold text-gray-900">Campus Class & Canteen Timetable</h2>
                <p className="text-xs text-gray-500">
                  Official break windows with historical crowd levels & queue avoidance recommendations
                </p>
              </div>
              {currentBreakInfo.next && (
                <div className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-1.5 rounded-lg">
                  Next Break in: <strong className="font-bold tabular-nums">{currentBreakInfo.minutesUntilNext} minutes</strong>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-4">
              {breaks.map((brk) => {
                const isCurrent = currentBreakInfo.current?.id === brk.id;
                const isNext = currentBreakInfo.next?.id === brk.id;

                return (
                  <div
                    key={brk.id}
                    className={`p-5 rounded-xl border transition-all ${
                      isCurrent
                        ? 'bg-emerald-50/80 border-emerald-300 ring-2 ring-emerald-500/20'
                        : isNext
                        ? 'bg-sky-50/70 border-sky-300'
                        : 'bg-[#FAF9F5] border-[#E9E5DA]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-white text-gray-700 border border-gray-200 font-mono tabular-nums">
                        {brk.startTime} - {brk.endTime}
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${
                          brk.crowdLevel === 'PEAK'
                            ? 'bg-amber-100 text-amber-900'
                            : brk.crowdLevel === 'MODERATE'
                            ? 'bg-sky-100 text-sky-900'
                            : 'bg-emerald-100 text-emerald-900'
                        }`}
                      >
                        {brk.crowdLevel} Crowd
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 mb-1">{brk.name}</h3>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">{brk.description}</p>

                    <div className="pt-3 border-t border-gray-200/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Avg Queue Wait:</span>
                        <strong className="text-gray-900 font-mono tabular-nums">{brk.avgWaitMins} mins</strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600">
                        <span>Smart Arrival Tip:</span>
                        <span className="font-semibold text-emerald-800">{brk.recommendedArrival}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Item Customization Modal */}
      {customizingItem && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-gray-200 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">{customizingItem.name}</h3>
                <span className="text-xs font-bold text-emerald-800 font-mono tabular-nums">
                  ${customizingItem.price.toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setCustomizingItem(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Spicy preference */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">Spice Level Preference</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Mild', 'Medium', 'Extra'] as const).map((spice) => (
                  <button
                    key={spice}
                    type="button"
                    onClick={() => setSelectedSpicy(spice)}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition-all ${
                      selectedSpicy === spice
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {spice}
                  </button>
                ))}
              </div>
            </div>

            {/* Special Instructions */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 block">
                Special Instructions (Optional)
              </label>
              <input
                type="text"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Extra coconut chutney, no onions, less ice"
                className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCustomAdd}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-xs"
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col justify-between p-6 shadow-2xl animate-in slide-in-from-right duration-250">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-700" />
                  <h3 className="text-base font-bold text-gray-900">Your Campus Order</h3>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Order type toggle */}
              <div className="grid grid-cols-2 gap-2 my-4 p-1 bg-gray-100 rounded-xl">
                <button
                  onClick={() => setOrderType('DINE_IN')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    orderType === 'DINE_IN' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Dine In Canteen
                </button>
                <button
                  onClick={() => setOrderType('TAKEAWAY')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                    orderType === 'TAKEAWAY' ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500'
                  }`}
                >
                  Takeaway / To Go
                </button>
              </div>

              {/* Cart Items list */}
              <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto pr-1">
                {cart.length === 0 ? (
                  <div className="text-center py-12 text-gray-400 text-xs">Your cart is empty.</div>
                ) : (
                  cart.map((item) => (
                    <div key={item.menuItem.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-bold text-gray-900">{item.menuItem.name}</h4>
                        <div className="text-[11px] text-gray-500">
                          <span>${item.menuItem.price.toFixed(2)} each</span>
                          {item.spicyLevel && <span> · {item.spicyLevel}</span>}
                          {item.specialInstructions && <span> · &ldquo;{item.specialInstructions}&rdquo;</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 text-xs"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-semibold font-mono tabular-nums w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                          className="w-6 h-6 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Cart footer & checkout */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Payment Method:</span>
                  <span className="font-semibold text-emerald-800">Campus Student Wallet</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-1 border-t border-gray-100">
                  <span>Total Amount:</span>
                  <span className="text-emerald-900 font-mono tabular-nums">${cartTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                disabled={cart.length === 0}
                onClick={handleCheckout}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Confirm Order & Generate Token</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
