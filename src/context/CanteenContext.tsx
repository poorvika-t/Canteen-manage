import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Student,
  TimetableBreak,
  MenuItem,
  Order,
  OrderItem,
  OrderStatus,
  QueueSession,
  SessionStatus,
  JDBCLogEntry,
  ConnectionPoolStatus,
} from '../types';
import { INITIAL_STUDENTS, TIMETABLE_BREAKS, MENU_ITEMS, INITIAL_ORDERS } from '../data/mockData';
import { jdbcSimulator } from '../services/jdbcSimulator';

interface CartItem extends OrderItem {}

interface CanteenContextType {
  // Navigation & Views
  currentTab: 'home' | 'student' | 'staff' | 'jdbc';
  setCurrentTab: (tab: 'home' | 'student' | 'staff' | 'jdbc') => void;

  // Student State
  students: Student[];
  currentStudent: Student;
  setCurrentStudent: (student: Student) => void;
  switchStudent: (studentId: string) => void;

  // Session State
  activeSession: QueueSession | null;
  startCanteenSession: () => void;
  leaveCanteenSession: () => void;
  checkQueueStatusOnly: () => void;

  // Timetable
  breaks: TimetableBreak[];
  currentBreakInfo: { current: TimetableBreak | null; next: TimetableBreak | null; minutesUntilNext: number };

  // Menu & Cart
  menuItems: MenuItem[];
  cart: CartItem[];
  addToCart: (item: MenuItem, spicyLevel?: 'Mild' | 'Medium' | 'Extra', instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  placeOrder: (orderType: 'DINE_IN' | 'TAKEAWAY') => Order | null;

  // Orders & Queue
  orders: Order[];
  studentActiveOrder: Order | null;
  tokenCounter: number;
  queueStats: {
    totalWaiting: number;
    totalPreparing: number;
    totalReady: number;
    totalServedToday: number;
    avgWaitTimeMins: number;
    servingNowToken: string;
    occupancyPercent: number;
  };

  // Staff POS
  isStaffAuthenticated: boolean;
  staffRole: 'cashier' | 'chef' | null;
  loginStaff: (pin: string) => boolean;
  logoutStaff: () => void;
  startPreparingOrder: (orderId: string) => void;
  markOrderReady: (orderId: string) => void;
  markOrderServed: (orderId: string) => { waitTimeSeconds: number; waitTimeFormatted: string } | null;
  cancelOrder: (orderId: string) => void;
  enterCounterOrder: (
    studentName: string,
    items: { menuItem: MenuItem; quantity: number }[],
    orderType: 'DINE_IN' | 'TAKEAWAY'
  ) => Order;

  // Sound chime
  playChime: (type?: 'chime' | 'success' | 'alert') => void;

  // JDBC Inspection
  jdbcLogs: JDBCLogEntry[];
  poolStatus: ConnectionPoolStatus;
  clearJdbcLogs: () => void;
  executeCustomJdbcQuery: (sql: string, params: any[]) => { success: boolean; timeMs: number; txId: string };
}

const CanteenContext = createContext<CanteenContextType | undefined>(undefined);

// Web Audio API Synthesizer for sweet, pleasant campus counter chimes
function synthesizeChime(type: 'chime' | 'success' | 'alert' = 'chime') {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (type === 'chime' || type === 'success') {
      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5

      osc2.frequency.setValueAtTime(1046.5, now); // C6
      osc2.frequency.exponentialRampToValueAtTime(1318.5, now + 0.25); // E6

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);

      osc1.connect(gainNode);
      osc2.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.85);
      osc2.stop(now + 0.85);
    } else {
      // gentle alert tone
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    }
  } catch {
    // Audio context may be restricted before user gesture
  }
}

export const CanteenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<'home' | 'student' | 'staff' | 'jdbc'>('home');
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [currentStudent, setCurrentStudent] = useState<Student>(INITIAL_STUDENTS[0]);
  const [breaks] = useState<TimetableBreak[]>(TIMETABLE_BREAKS);
  const [menuItems] = useState<MenuItem[]>(MENU_ITEMS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tokenCounter, setTokenCounter] = useState<number>(111);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeSession, setActiveSession] = useState<QueueSession | null>(null);

  // Staff POS Auth
  const [isStaffAuthenticated, setIsStaffAuthenticated] = useState<boolean>(false);
  const [staffRole, setStaffRole] = useState<'cashier' | 'chef' | null>(null);

  // JDBC State
  const [jdbcLogs, setJdbcLogs] = useState<JDBCLogEntry[]>([]);
  const [poolStatus, setPoolStatus] = useState<ConnectionPoolStatus>(jdbcSimulator.getPoolStatus());

  // Subscribe to JDBC logs
  useEffect(() => {
    const unsubscribe = jdbcSimulator.subscribe((newLogs, newPool) => {
      setJdbcLogs(newLogs);
      setPoolStatus(newPool);
    });
    return unsubscribe;
  }, []);

  const playChime = useCallback((type: 'chime' | 'success' | 'alert' = 'chime') => {
    synthesizeChime(type);
  }, []);

  // Compute break status
  const currentBreakInfo = useMemo(() => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let current: TimetableBreak | null = null;
    let next: TimetableBreak | null = null;
    let minDiff = Infinity;

    for (const brk of breaks) {
      const [startH, startM] = brk.startTime.split(':').map(Number);
      const [endH, endM] = brk.endTime.split(':').map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;

      if (currentMinutes >= startMin && currentMinutes <= endMin) {
        current = brk;
      } else if (startMin > currentMinutes) {
        const diff = startMin - currentMinutes;
        if (diff < minDiff) {
          minDiff = diff;
          next = brk;
        }
      }
    }

    if (!next && breaks.length > 0) {
      // Loop to tomorrow's first break
      next = breaks[0];
      const [firstH, firstM] = breaks[0].startTime.split(':').map(Number);
      minDiff = (24 * 60 - currentMinutes) + (firstH * 60 + firstM);
    }

    return {
      current,
      next,
      minutesUntilNext: minDiff === Infinity ? 45 : minDiff,
    };
  }, [breaks]);

  // Queue Statistics
  const queueStats = useMemo(() => {
    const waiting = orders.filter((o) => o.status === 'WAITING').length;
    const preparing = orders.filter((o) => o.status === 'PREPARING').length;
    const ready = orders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
    const served = orders.filter((o) => o.status === 'SERVED');

    // Calculate rolling average wait time
    let avgMins = 7.0;
    const servedWithTimes = served.filter((o) => o.actualWaitTimeSeconds && o.actualWaitTimeSeconds > 0);
    if (servedWithTimes.length > 0) {
      const totalSeconds = servedWithTimes.reduce((acc, curr) => acc + (curr.actualWaitTimeSeconds || 0), 0);
      avgMins = Math.round((totalSeconds / servedWithTimes.length / 60) * 10) / 10;
    } else {
      avgMins = Math.max(3, (waiting + preparing) * 2.5);
    }

    const servingOrder = orders.find((o) => o.status === 'READY_FOR_PICKUP') || orders.find((o) => o.status === 'PREPARING');
    const servingNowToken = servingOrder ? servingOrder.tokenNo : 'A-108';

    // Occupancy estimation
    const totalActive = waiting + preparing + ready;
    const occupancyPercent = Math.min(95, Math.max(15, totalActive * 12 + 18));

    return {
      totalWaiting: waiting,
      totalPreparing: preparing,
      totalReady: ready,
      totalServedToday: served.length,
      avgWaitTimeMins: avgMins,
      servingNowToken,
      occupancyPercent,
    };
  }, [orders]);

  // Student switch
  const switchStudent = (studentId: string) => {
    const found = students.find((s) => s.id === studentId || s.studentId === studentId);
    if (found) {
      setCurrentStudent(found);
      // Log JDBC PreparedStatement
      jdbcSimulator.executePreparedStatement({
        operation: 'SELECT',
        tableName: 'students',
        sql: 'SELECT id, student_id, name, department, wallet_balance FROM students WHERE id = ? LIMIT 1',
        params: [found.id],
      });
    }
  };

  // Student active order in queue
  const studentActiveOrder = useMemo(() => {
    return (
      orders.find(
        (o) =>
          o.studentId === currentStudent.id &&
          (o.status === 'WAITING' || o.status === 'PREPARING' || o.status === 'READY_FOR_PICKUP')
      ) || null
    );
  }, [orders, currentStudent]);

  // Sync active session if an order is completed/ready
  useEffect(() => {
    if (studentActiveOrder) {
      if (studentActiveOrder.status === 'READY_FOR_PICKUP') {
        setActiveSession((prev) =>
          prev
            ? { ...prev, status: 'ORDER_READY', tokenNo: studentActiveOrder.tokenNo }
            : {
                sessionId: `sess_${Date.now()}`,
                studentId: currentStudent.id,
                studentName: currentStudent.name,
                joinedAt: studentActiveOrder.createdAt,
                tokenNo: studentActiveOrder.tokenNo,
                orderId: studentActiveOrder.id,
                status: 'ORDER_READY',
                locationStatus: 'AT_CANTEEN',
              }
        );
      } else {
        setActiveSession((prev) =>
          prev
            ? { ...prev, status: 'WAITING_ORDER', tokenNo: studentActiveOrder.tokenNo }
            : {
                sessionId: `sess_${Date.now()}`,
                studentId: currentStudent.id,
                studentName: currentStudent.name,
                joinedAt: studentActiveOrder.createdAt,
                tokenNo: studentActiveOrder.tokenNo,
                orderId: studentActiveOrder.id,
                status: 'WAITING_ORDER',
                locationStatus: 'AT_CANTEEN',
              }
        );
      }
    }
  }, [studentActiveOrder, currentStudent]);

  // Start 'I\'m at Canteen' Session
  const startCanteenSession = () => {
    const sessionId = `sess_${Date.now()}`;
    const newSession: QueueSession = {
      sessionId,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      joinedAt: Date.now(),
      status: studentActiveOrder ? 'WAITING_ORDER' : 'AT_CANTEEN',
      locationStatus: 'AT_CANTEEN',
      tokenNo: studentActiveOrder?.tokenNo,
      orderId: studentActiveOrder?.id,
    };
    setActiveSession(newSession);

    // JDBC PreparedStatement execution
    jdbcSimulator.executePreparedStatement({
      operation: 'INSERT',
      tableName: 'queue_sessions',
      sql: 'INSERT INTO queue_sessions (session_id, student_id, joined_at, location_status, session_status) VALUES (?, ?, ?, ?, ?)',
      params: [sessionId, currentStudent.id, Date.now(), 'AT_CANTEEN', newSession.status],
    });

    playChime('chime');
    setCurrentTab('student');
  };

  const leaveCanteenSession = () => {
    if (activeSession) {
      jdbcSimulator.executePreparedStatement({
        operation: 'UPDATE',
        tableName: 'queue_sessions',
        sql: 'UPDATE queue_sessions SET session_status = ? WHERE session_id = ?',
        params: ['COMPLETED', activeSession.sessionId],
      });
    }
    setActiveSession(null);
  };

  const checkQueueStatusOnly = () => {
    jdbcSimulator.executePreparedStatement({
      operation: 'SELECT',
      tableName: 'orders',
      sql: 'SELECT token_no, status, created_at, estimated_wait_minutes FROM orders WHERE status IN (?, ?, ?) ORDER BY created_at ASC',
      params: ['WAITING', 'PREPARING', 'READY_FOR_PICKUP'],
      rowsAffected: queueStats.totalWaiting + queueStats.totalPreparing + queueStats.totalReady,
    });
    setCurrentTab('student');
  };

  // Cart operations
  const addToCart = (item: MenuItem, spicyLevel: 'Mild' | 'Medium' | 'Extra' = 'Medium', instructions?: string) => {
    setCart((prev) => {
      const existing = prev.find((ci) => ci.menuItem.id === item.id && ci.spicyLevel === spicyLevel);
      if (existing) {
        return prev.map((ci) =>
          ci.menuItem.id === item.id && ci.spicyLevel === spicyLevel ? { ...ci, quantity: ci.quantity + 1 } : ci
        );
      }
      return [...prev, { menuItem: item, quantity: 1, spicyLevel, specialInstructions: instructions }];
    });
    playChime('chime');
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((ci) => ci.menuItem.id !== itemId));
  };

  const updateCartQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((ci) => {
          if (ci.menuItem.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const clearCart = () => setCart([]);

  const cartTotal = useMemo(() => {
    return Number(cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0).toFixed(2));
  }, [cart]);

  // Place Order (from Student Portal)
  const placeOrder = (orderType: 'DINE_IN' | 'TAKEAWAY'): Order | null => {
    if (cart.length === 0) return null;

    const tokenNumber = `A-${tokenCounter}`;
    setTokenCounter((prev) => prev + 1);

    const maxItemPrepTime = Math.max(...cart.map((c) => c.menuItem.prepTimeMinutes), 4);
    const estimatedWait = Math.round(maxItemPrepTime + (queueStats.totalWaiting + queueStats.totalPreparing) * 2.2);

    const orderId = `ord_${Date.now()}`;
    const newOrder: Order = {
      id: orderId,
      tokenNo: tokenNumber,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      items: [...cart],
      totalAmount: cartTotal,
      status: 'WAITING',
      orderType,
      createdAt: Date.now(),
      estimatedWaitMinutes: estimatedWait,
    };

    // Update wallet balance
    setStudents((prev) =>
      prev.map((s) => (s.id === currentStudent.id ? { ...s, balance: Math.max(0, s.balance - cartTotal) } : s))
    );
    setCurrentStudent((prev) => ({ ...prev, balance: Math.max(0, prev.balance - cartTotal) }));

    // Append to orders
    setOrders((prev) => [newOrder, ...prev]);

    // Update active session
    setActiveSession({
      sessionId: `sess_${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      joinedAt: Date.now(),
      tokenNo: tokenNumber,
      orderId: newOrder.id,
      status: 'WAITING_ORDER',
      locationStatus: 'AT_CANTEEN',
    });

    // Simulated JDBC PreparedStatement transaction
    const itemsJson = JSON.stringify(
      cart.map((c) => ({
        id: c.menuItem.id,
        name: c.menuItem.name,
        qty: c.quantity,
        price: c.menuItem.price,
      }))
    );

    jdbcSimulator.executePreparedStatement({
      operation: 'INSERT',
      tableName: 'orders',
      sql: 'INSERT INTO orders (id, token_no, student_id, items_json, total_amount, status, order_type, created_at, actual_wait_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [newOrder.id, tokenNumber, currentStudent.id, itemsJson, cartTotal, 'WAITING', orderType, Date.now(), null],
    });

    jdbcSimulator.executePreparedStatement({
      operation: 'UPDATE',
      tableName: 'students',
      sql: 'UPDATE students SET wallet_balance = wallet_balance - ? WHERE id = ?',
      params: [cartTotal, currentStudent.id],
    });

    clearCart();
    playChime('success');
    return newOrder;
  };

  // Staff POS Authentication
  const loginStaff = (pin: string): boolean => {
    if (pin === '1234') {
      setIsStaffAuthenticated(true);
      setStaffRole('cashier');
      jdbcSimulator.executePreparedStatement({
        operation: 'SELECT',
        tableName: 'staff_sessions',
        sql: 'SELECT role, station_id FROM staff_terminals WHERE terminal_pin_hash = SHA2(?, 256) AND active = ?',
        params: ['****', true],
      });
      playChime('success');
      return true;
    } else if (pin === '5678') {
      setIsStaffAuthenticated(true);
      setStaffRole('chef');
      jdbcSimulator.executePreparedStatement({
        operation: 'SELECT',
        tableName: 'staff_sessions',
        sql: 'SELECT role, station_id FROM staff_terminals WHERE terminal_pin_hash = SHA2(?, 256) AND active = ?',
        params: ['****', true],
      });
      playChime('success');
      return true;
    }
    return false;
  };

  const logoutStaff = () => {
    setIsStaffAuthenticated(false);
    setStaffRole(null);
  };

  // Staff Actions: Update Order Status
  const startPreparingOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'PREPARING', prepStartedAt: Date.now() } : ord))
    );

    jdbcSimulator.executePreparedStatement({
      operation: 'UPDATE',
      tableName: 'orders',
      sql: 'UPDATE orders SET status = ?, prep_started_at = ? WHERE id = ?',
      params: ['PREPARING', Date.now(), orderId],
    });
    playChime('chime');
  };

  const markOrderReady = (orderId: string) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'READY_FOR_PICKUP', readyAt: Date.now() } : ord))
    );

    jdbcSimulator.executePreparedStatement({
      operation: 'UPDATE',
      tableName: 'orders',
      sql: 'UPDATE orders SET status = ?, ready_at = ? WHERE id = ?',
      params: ['READY_FOR_PICKUP', Date.now(), orderId],
    });
    playChime('success');
  };

  // Automatic wait-time calculation on 'Mark as Served'
  const markOrderServed = (orderId: string) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return null;

    const now = Date.now();
    const waitTimeSeconds = Math.max(15, Math.round((now - target.createdAt) / 1000));
    const mins = Math.floor(waitTimeSeconds / 60);
    const secs = waitTimeSeconds % 60;
    const waitTimeFormatted = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'SERVED',
              servedAt: now,
              actualWaitTimeSeconds: waitTimeSeconds,
            }
          : ord
      )
    );

    // Update session if it belonged to current active session
    if (activeSession && activeSession.orderId === orderId) {
      setActiveSession((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
    }

    // Execute standard PreparedStatement update simulating JDBC
    jdbcSimulator.executePreparedStatement({
      operation: 'UPDATE',
      tableName: 'orders',
      sql: 'UPDATE orders SET status = ?, served_at = ?, actual_wait_seconds = ? WHERE id = ?',
      params: ['SERVED', now, waitTimeSeconds, orderId],
    });

    playChime('success');
    return { waitTimeSeconds, waitTimeFormatted };
  };

  const cancelOrder = (orderId: string) => {
    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, status: 'CANCELLED' } : ord)));

    jdbcSimulator.executePreparedStatement({
      operation: 'UPDATE',
      tableName: 'orders',
      sql: 'UPDATE orders SET status = ? WHERE id = ?',
      params: ['CANCELLED', orderId],
    });
    playChime('alert');
  };

  // Counter Order entry by Staff POS
  const enterCounterOrder = (
    studentName: string,
    items: { menuItem: MenuItem; quantity: number }[],
    orderType: 'DINE_IN' | 'TAKEAWAY'
  ): Order => {
    const tokenNumber = `A-${tokenCounter}`;
    setTokenCounter((prev) => prev + 1);

    const total = Number(items.reduce((acc, curr) => acc + curr.menuItem.price * curr.quantity, 0).toFixed(2));
    const orderId = `ord_pos_${Date.now()}`;

    const newOrder: Order = {
      id: orderId,
      tokenNo: tokenNumber,
      studentId: 'walkin_pos',
      studentName: studentName || 'Counter Student',
      isWalkIn: true,
      items: items.map((i) => ({ menuItem: i.menuItem, quantity: i.quantity, spicyLevel: 'Medium' })),
      totalAmount: total,
      status: 'WAITING',
      orderType,
      createdAt: Date.now(),
      estimatedWaitMinutes: 6,
    };

    setOrders((prev) => [newOrder, ...prev]);

    const itemsJson = JSON.stringify(items.map((i) => ({ id: i.menuItem.id, name: i.menuItem.name, qty: i.quantity })));

    jdbcSimulator.executePreparedStatement({
      operation: 'INSERT',
      tableName: 'orders',
      sql: 'INSERT INTO orders (id, token_no, student_id, items_json, total_amount, status, order_type, created_at, actual_wait_seconds) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      params: [orderId, tokenNumber, 'walkin_pos', itemsJson, total, 'WAITING', orderType, Date.now(), null],
    });

    playChime('chime');
    return newOrder;
  };

  // Execute custom JDBC query from workbench
  const executeCustomJdbcQuery = (sql: string, params: any[]) => {
    const isSelect = sql.trim().toUpperCase().startsWith('SELECT');
    const isUpdate = sql.trim().toUpperCase().startsWith('UPDATE');
    const isInsert = sql.trim().toUpperCase().startsWith('INSERT');
    const isDelete = sql.trim().toUpperCase().startsWith('DELETE');

    const op = isSelect ? 'SELECT' : isUpdate ? 'UPDATE' : isInsert ? 'INSERT' : isDelete ? 'DELETE' : 'SELECT';
    const result = jdbcSimulator.executePreparedStatement({
      operation: op,
      tableName: 'custom_query',
      sql,
      params,
      rowsAffected: isSelect ? Math.floor(Math.random() * 5) + 1 : 1,
    });

    return {
      success: result.success,
      timeMs: result.executionTimeMs,
      txId: result.txId,
    };
  };

  const clearJdbcLogs = () => {
    jdbcSimulator.clearLogs();
  };

  return (
    <CanteenContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        students,
        currentStudent,
        setCurrentStudent,
        switchStudent,
        activeSession,
        startCanteenSession,
        leaveCanteenSession,
        checkQueueStatusOnly,
        breaks,
        currentBreakInfo,
        menuItems,
        cart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        cartTotal,
        placeOrder,
        orders,
        studentActiveOrder,
        tokenCounter,
        queueStats,
        isStaffAuthenticated,
        staffRole,
        loginStaff,
        logoutStaff,
        startPreparingOrder,
        markOrderReady,
        markOrderServed,
        cancelOrder,
        enterCounterOrder,
        playChime,
        jdbcLogs,
        poolStatus,
        clearJdbcLogs,
        executeCustomJdbcQuery,
      }}
    >
      {children}
    </CanteenContext.Provider>
  );
};

export const useCanteen = () => {
  const context = useContext(CanteenContext);
  if (!context) {
    throw new Error('useCanteen must be used within a CanteenProvider');
  }
  return context;
};
