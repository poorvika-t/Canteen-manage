import { JDBCLogEntry, ConnectionPoolStatus } from '../types';

export interface PreparedStatementParam {
  index: number;
  value: string | number | boolean | null;
  type: string;
}

export interface TableSchema {
  name: string;
  columns: { name: string; type: string; key?: string; nullable: boolean }[];
  rowCount: number;
  ddl: string;
}

class JDBCSimulator {
  private logs: JDBCLogEntry[] = [];
  private listeners: ((logs: JDBCLogEntry[], pool: ConnectionPoolStatus) => void)[] = [];
  private pool: ConnectionPoolStatus = {
    maxConnections: 10,
    activeConnections: 0,
    idleConnections: 10,
    checkoutCount: 0,
    releaseCount: 0,
    url: 'jdbc:mysql://canteen-db.campus.internal:3306/canteenflow?useSSL=false&serverTimezone=UTC',
    driver: 'com.mysql.cj.jdbc.Driver',
  };

  private schemas: TableSchema[] = [
    {
      name: 'students',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', nullable: false },
        { name: 'student_id', type: 'VARCHAR(20)', key: 'UNIQUE', nullable: false },
        { name: 'name', type: 'VARCHAR(100)', nullable: false },
        { name: 'department', type: 'VARCHAR(80)', nullable: false },
        { name: 'year', type: 'VARCHAR(20)', nullable: false },
        { name: 'wallet_balance', type: 'DECIMAL(8,2)', nullable: false },
      ],
      rowCount: 4,
      ddl: `CREATE TABLE students (
  id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(20) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  department VARCHAR(80) NOT NULL,
  year VARCHAR(20) NOT NULL,
  wallet_balance DECIMAL(8,2) DEFAULT 0.00
);`,
    },
    {
      name: 'timetable_breaks',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', nullable: false },
        { name: 'name', type: 'VARCHAR(80)', nullable: false },
        { name: 'start_time', type: 'TIME', nullable: false },
        { name: 'end_time', type: 'TIME', nullable: false },
        { name: 'type', type: 'VARCHAR(30)', nullable: false },
        { name: 'crowd_level', type: 'VARCHAR(20)', nullable: false },
        { name: 'avg_wait_mins', type: 'INT', nullable: false },
      ],
      rowCount: 3,
      ddl: `CREATE TABLE timetable_breaks (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  type VARCHAR(30) NOT NULL,
  crowd_level VARCHAR(20) NOT NULL,
  avg_wait_mins INT NOT NULL
);`,
    },
    {
      name: 'menu_items',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', nullable: false },
        { name: 'name', type: 'VARCHAR(120)', nullable: false },
        { name: 'category', type: 'VARCHAR(40)', nullable: false },
        { name: 'price', type: 'DECIMAL(6,2)', nullable: false },
        { name: 'prep_time_mins', type: 'INT', nullable: false },
        { name: 'is_veg', type: 'BOOLEAN', nullable: false },
        { name: 'available', type: 'BOOLEAN', nullable: false },
      ],
      rowCount: 8,
      ddl: `CREATE TABLE menu_items (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL,
  price DECIMAL(6,2) NOT NULL,
  prep_time_mins INT NOT NULL,
  is_veg BOOLEAN DEFAULT TRUE,
  available BOOLEAN DEFAULT TRUE
);`,
    },
    {
      name: 'orders',
      columns: [
        { name: 'id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', nullable: false },
        { name: 'token_no', type: 'VARCHAR(16)', key: 'INDEX', nullable: false },
        { name: 'student_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY', nullable: false },
        { name: 'items_json', type: 'JSON', nullable: false },
        { name: 'total_amount', type: 'DECIMAL(8,2)', nullable: false },
        { name: 'status', type: 'VARCHAR(30)', nullable: false },
        { name: 'order_type', type: 'VARCHAR(20)', nullable: false },
        { name: 'created_at', type: 'BIGINT', nullable: false },
        { name: 'served_at', type: 'BIGINT', nullable: true },
        { name: 'actual_wait_seconds', type: 'INT', nullable: true },
      ],
      rowCount: 4,
      ddl: `CREATE TABLE orders (
  id VARCHAR(36) PRIMARY KEY,
  token_no VARCHAR(16) NOT NULL,
  student_id VARCHAR(36) NOT NULL,
  items_json JSON NOT NULL,
  total_amount DECIMAL(8,2) NOT NULL,
  status VARCHAR(30) NOT NULL,
  order_type VARCHAR(20) NOT NULL,
  created_at BIGINT NOT NULL,
  served_at BIGINT NULL,
  actual_wait_seconds INT NULL,
  FOREIGN KEY (student_id) REFERENCES students(id)
);`,
    },
    {
      name: 'queue_sessions',
      columns: [
        { name: 'session_id', type: 'VARCHAR(36)', key: 'PRIMARY KEY', nullable: false },
        { name: 'student_id', type: 'VARCHAR(36)', key: 'FOREIGN KEY', nullable: false },
        { name: 'joined_at', type: 'BIGINT', nullable: false },
        { name: 'location_status', type: 'VARCHAR(30)', nullable: false },
        { name: 'token_no', type: 'VARCHAR(16)', nullable: true },
        { name: 'session_status', type: 'VARCHAR(30)', nullable: false },
      ],
      rowCount: 2,
      ddl: `CREATE TABLE queue_sessions (
  session_id VARCHAR(36) PRIMARY KEY,
  student_id VARCHAR(36) NOT NULL,
  joined_at BIGINT NOT NULL,
  location_status VARCHAR(30) NOT NULL,
  token_no VARCHAR(16) NULL,
  session_status VARCHAR(30) NOT NULL
);`,
    },
    {
      name: 'jdbc_audit_log',
      columns: [
        { name: 'log_id', type: 'BIGINT AUTO_INCREMENT', key: 'PRIMARY KEY', nullable: false },
        { name: 'tx_id', type: 'VARCHAR(24)', nullable: false },
        { name: 'connection_id', type: 'VARCHAR(16)', nullable: false },
        { name: 'sql_text', type: 'TEXT', nullable: false },
        { name: 'params_json', type: 'JSON', nullable: false },
        { name: 'exec_time_ms', type: 'DECIMAL(5,2)', nullable: false },
        { name: 'timestamp', type: 'DATETIME', nullable: false },
      ],
      rowCount: 0,
      ddl: `CREATE TABLE jdbc_audit_log (
  log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  tx_id VARCHAR(24) NOT NULL,
  connection_id VARCHAR(16) NOT NULL,
  sql_text TEXT NOT NULL,
  params_json JSON NOT NULL,
  exec_time_ms DECIMAL(5,2) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);`,
    },
  ];

  constructor() {
    // Seed initial connection and warm up pool log
    this.recordStatement({
      operation: 'SELECT',
      tableName: 'timetable_breaks',
      preparedStatementSql: 'SELECT * FROM timetable_breaks ORDER BY start_time ASC',
      boundParameters: [],
      rowsAffected: 3,
      executionTimeMs: 1.8,
    });
    this.recordStatement({
      operation: 'SELECT',
      tableName: 'menu_items',
      preparedStatementSql: 'SELECT * FROM menu_items WHERE available = ? ORDER BY category, price',
      boundParameters: [true],
      rowsAffected: 8,
      executionTimeMs: 2.4,
    });
  }

  public subscribe(listener: (logs: JDBCLogEntry[], pool: ConnectionPoolStatus) => void) {
    this.listeners.push(listener);
    listener([...this.logs], { ...this.pool });
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l([...this.logs], { ...this.pool }));
  }

  public getPoolStatus(): ConnectionPoolStatus {
    return { ...this.pool };
  }

  public getSchemas(): TableSchema[] {
    return this.schemas;
  }

  public getLogs(): JDBCLogEntry[] {
    return [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
    this.notify();
  }

  /**
   * Simulates acquiring a connection from HikariCP pool, preparing statement,
   * binding parameters, executing with timing, logging, and returning connection to pool.
   */
  public executePreparedStatement(options: {
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    tableName: string;
    sql: string;
    params: (string | number | boolean | null)[];
    rowsAffected?: number;
  }): { success: boolean; executionTimeMs: number; txId: string; connectionId: string } {
    // 1. Checkout connection from pool
    const connNum = Math.floor(Math.random() * 8) + 1;
    const connectionId = `conn-${connNum}`;
    const txId = `TX-${Math.floor(10000 + Math.random() * 90000)}`;

    this.pool.checkoutCount++;
    this.pool.activeConnections = Math.min(this.pool.maxConnections, this.pool.activeConnections + 1);
    this.pool.idleConnections = Math.max(0, this.pool.maxConnections - this.pool.activeConnections);
    this.notify();

    // 2. Simulated JDBC execution latency (1.5ms - 6.8ms)
    const execTime = Number((1.5 + Math.random() * 5.2).toFixed(2));

    // 3. Record the executed statement log
    const entry: JDBCLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      transactionId: txId,
      connectionId,
      operation: options.operation,
      tableName: options.tableName,
      preparedStatementSql: options.sql,
      boundParameters: options.params,
      executionTimeMs: execTime,
      rowsAffected: options.rowsAffected ?? (options.operation === 'SELECT' ? 1 : 1),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 } as any),
      status: 'SUCCESS',
    };

    this.logs.unshift(entry);
    if (this.logs.length > 80) {
      this.logs = this.logs.slice(0, 80);
    }

    // 4. Release connection back to pool after small tick
    setTimeout(() => {
      this.pool.releaseCount++;
      this.pool.activeConnections = Math.max(0, this.pool.activeConnections - 1);
      this.pool.idleConnections = Math.min(this.pool.maxConnections, this.pool.maxConnections - this.pool.activeConnections);
      this.notify();
    }, 120);

    this.notify();

    return {
      success: true,
      executionTimeMs: execTime,
      txId,
      connectionId,
    };
  }

  private recordStatement(stmt: {
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    tableName: string;
    preparedStatementSql: string;
    boundParameters: (string | number | boolean | null)[];
    rowsAffected: number;
    executionTimeMs: number;
  }) {
    const entry: JDBCLogEntry = {
      id: `init_${Math.random().toString(36).substring(2, 8)}`,
      transactionId: `TX-${Math.floor(10000 + Math.random() * 90000)}`,
      connectionId: `conn-1`,
      operation: stmt.operation,
      tableName: stmt.tableName,
      preparedStatementSql: stmt.preparedStatementSql,
      boundParameters: stmt.boundParameters,
      executionTimeMs: stmt.executionTimeMs,
      rowsAffected: stmt.rowsAffected,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'SUCCESS',
    };
    this.logs.push(entry);
  }
}

export const jdbcSimulator = new JDBCSimulator();
