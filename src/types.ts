export type SessionStatus = 'BROWSING' | 'AT_CANTEEN' | 'WAITING_ORDER' | 'ORDER_READY' | 'COMPLETED';

export type OrderStatus = 'WAITING' | 'PREPARING' | 'READY_FOR_PICKUP' | 'SERVED' | 'CANCELLED';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  department: string;
  year: string;
  avatarSeed: string;
  balance: number;
}

export interface TimetableBreak {
  id: string;
  name: string;
  startTime: string; // "10:30"
  endTime: string;   // "10:50"
  type: 'MORNING_BREAK' | 'LUNCH_BREAK' | 'EVENING_TEA';
  crowdLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'PEAK';
  avgWaitMins: number;
  recommendedArrival: string;
  description: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'BREAKFAST' | 'MEALS' | 'BEVERAGES' | 'SNACKS';
  price: number;
  prepTimeMinutes: number;
  calories: number;
  isVeg: boolean;
  isPopular?: boolean;
  description: string;
  imageUrl: string;
  available: boolean;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
  spicyLevel?: 'Mild' | 'Medium' | 'Extra';
}

export interface Order {
  id: string;
  tokenNo: string; // e.g. "A-108"
  studentId: string;
  studentName: string;
  isWalkIn?: boolean;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: 'DINE_IN' | 'TAKEAWAY';
  createdAt: number; // timestamp ms
  prepStartedAt?: number;
  readyAt?: number;
  servedAt?: number;
  actualWaitTimeSeconds?: number;
  estimatedWaitMinutes: number;
}

export interface QueueSession {
  sessionId: string;
  studentId: string;
  studentName: string;
  joinedAt: number;
  tokenNo?: string;
  orderId?: string;
  status: SessionStatus;
  locationStatus: 'AT_CANTEEN' | 'REMOTE_CHECK';
  notificationSent?: boolean;
}

export interface JDBCLogEntry {
  id: string;
  transactionId: string;
  connectionId: string;
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'BEGIN' | 'COMMIT';
  tableName: string;
  preparedStatementSql: string;
  boundParameters: (string | number | boolean | null)[];
  executionTimeMs: number;
  rowsAffected: number;
  timestamp: string;
  status: 'SUCCESS' | 'ROLLEDBACK';
}

export interface ConnectionPoolStatus {
  maxConnections: number;
  activeConnections: number;
  idleConnections: number;
  checkoutCount: number;
  releaseCount: number;
  url: string;
  driver: string;
}
