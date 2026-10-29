import React, { useState } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { jdbcSimulator, TableSchema } from '../services/jdbcSimulator';
import {
  Database,
  Activity,
  Table as TableIcon,
  Terminal,
  Code2,
  Trash2,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
} from 'lucide-react';

export const JdbcInspectorModal: React.FC = () => {
  const { jdbcLogs, poolStatus, clearJdbcLogs, executeCustomJdbcQuery } = useCanteen();

  const [activeTab, setActiveTab] = useState<'LOGS' | 'SCHEMA' | 'WORKBENCH' | 'ARCHITECTURE'>('LOGS');
  const [selectedTable, setSelectedTable] = useState<string>('orders');
  const schemas = jdbcSimulator.getSchemas();

  // Workbench state
  const presetQueries = [
    {
      label: 'Find Active Orders in Queue',
      sql: 'SELECT token_no, student_id, status, created_at FROM orders WHERE status = ?',
      defaultParam: 'WAITING',
    },
    {
      label: 'Get Student Profile & Wallet',
      sql: 'SELECT id, student_id, name, wallet_balance FROM students WHERE id = ?',
      defaultParam: 'std_01',
    },
    {
      label: 'Check High-Traffic Breaks',
      sql: 'SELECT name, start_time, end_time, avg_wait_mins FROM timetable_breaks WHERE crowd_level = ?',
      defaultParam: 'PEAK',
    },
    {
      label: 'Update Order to Served Status',
      sql: 'UPDATE orders SET status = ?, actual_wait_seconds = ? WHERE token_no = ?',
      defaultParam: 'SERVED, 380, A-108',
    },
  ];

  const [selectedPreset, setSelectedPreset] = useState(0);
  const [querySql, setQuerySql] = useState(presetQueries[0].sql);
  const [queryParams, setQueryParams] = useState(presetQueries[0].defaultParam);
  const [lastQueryResult, setLastQueryResult] = useState<{
    txId: string;
    timeMs: number;
    rowsAffected: number;
    executedAt: string;
  } | null>(null);

  const handleSelectPreset = (idx: number) => {
    setSelectedPreset(idx);
    setQuerySql(presetQueries[idx].sql);
    setQueryParams(presetQueries[idx].defaultParam);
  };

  const handleExecuteQuery = () => {
    const paramsList = queryParams
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const result = executeCustomJdbcQuery(querySql, paramsList);
    setLastQueryResult({
      txId: result.txId,
      timeMs: result.timeMs,
      rowsAffected: querySql.trim().toUpperCase().startsWith('SELECT') ? 3 : 1,
      executedAt: new Date().toLocaleTimeString(),
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Connection Pool Metrics */}
      <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-gray-900">
                  JDBC & MySQL Architecture Monitor
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">
                  HikariCP Pool Active
                </span>
              </div>
              <p className="text-xs text-gray-500 font-mono mt-0.5">
                {poolStatus.url}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={clearJdbcLogs}
              className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-red-700 bg-gray-50 hover:bg-red-50 border border-gray-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Session Logs</span>
            </button>
          </div>
        </div>

        {/* Pool Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE6DC]">
            <span className="text-[11px] text-gray-500 block mb-0.5">Active Connections</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-emerald-900 font-mono tabular-nums">
                {poolStatus.activeConnections}
              </span>
              <span className="text-xs text-gray-400 font-mono">/ {poolStatus.maxConnections} max</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE6DC]">
            <span className="text-[11px] text-gray-500 block mb-0.5">Idle in Pool</span>
            <span className="text-xl font-bold text-gray-800 font-mono tabular-nums">
              {poolStatus.idleConnections}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE6DC]">
            <span className="text-[11px] text-gray-500 block mb-0.5">Pool Checkouts</span>
            <span className="text-xl font-bold text-sky-800 font-mono tabular-nums">
              {poolStatus.checkoutCount}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EAE6DC]">
            <span className="text-[11px] text-gray-500 block mb-0.5">Driver & Protocol</span>
            <span className="text-xs font-bold text-gray-700 font-mono block truncate">
              MySQL Connector/J
            </span>
          </div>
        </div>
      </div>

      {/* Segmented Sub Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F4F0E6] rounded-xl border border-[#E5E0D3] w-fit">
        <button
          onClick={() => setActiveTab('LOGS')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'LOGS' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Live PreparedStatement Logs ({jdbcLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SCHEMA')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'SCHEMA' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TableIcon className="w-3.5 h-3.5" />
          <span>MySQL Schema DDL ({schemas.length} tables)</span>
        </button>

        <button
          onClick={() => setActiveTab('WORKBENCH')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'WORKBENCH' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Interactive JDBC Runner</span>
        </button>

        <button
          onClick={() => setActiveTab('ARCHITECTURE')}
          className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
            activeTab === 'ARCHITECTURE' ? 'bg-white text-emerald-900 shadow-xs' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Architecture Flow</span>
        </button>
      </div>

      {/* TAB 1: LIVE STATEMENT LOGS */}
      {activeTab === 'LOGS' && (
        <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">Real-Time JDBC Execution Log</h2>
              <p className="text-xs text-gray-500">
                Streaming PreparedStatement queries with parameter binding and sub-millisecond timings
              </p>
            </div>
            <span className="text-xs text-gray-400 font-mono tabular-nums">
              Showing {jdbcLogs.length} events
            </span>
          </div>

          <div className="divide-y divide-gray-100 max-h-[580px] overflow-y-auto">
            {jdbcLogs.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                No logs recorded yet. Place an order or click &lsquo;Mark as Served&rsquo; to watch live JDBC events!
              </div>
            ) : (
              jdbcLogs.map((log) => (
                <div key={log.id} className="py-3.5 space-y-2 hover:bg-[#FAF9F5] px-2 rounded-lg transition-colors">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                          log.operation === 'INSERT'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                            : log.operation === 'UPDATE'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : log.operation === 'DELETE'
                            ? 'bg-red-100 text-red-900 border border-red-300'
                            : 'bg-sky-100 text-sky-900 border border-sky-300'
                        }`}
                      >
                        {log.operation}
                      </span>
                      <span className="font-mono text-gray-800 font-semibold">{log.tableName}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono text-gray-400 text-[11px]">{log.transactionId}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-mono text-emerald-800 text-[11px]">{log.connectionId}</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs font-mono text-gray-500">
                      <span className="tabular-nums font-semibold text-emerald-900">{log.executionTimeMs} ms</span>
                      <span className="text-gray-300">·</span>
                      <span className="tabular-nums text-gray-400">{log.timestamp}</span>
                    </div>
                  </div>

                  {/* SQL Statement with syntax highlighting */}
                  <div className="p-2.5 rounded-lg bg-[#F8F6F0] border border-[#E9E5DA] font-mono text-xs text-gray-800 overflow-x-auto">
                    <span className="text-emerald-800 font-bold">SQL: </span>
                    <span>{log.preparedStatementSql}</span>
                  </div>

                  {/* Bound Parameters */}
                  {log.boundParameters.length > 0 && (
                    <div className="text-[11px] font-mono text-gray-600 pl-1">
                      <span className="text-gray-400">Parameters: </span>
                      {log.boundParameters.map((p, idx) => (
                        <span key={idx} className="mr-2 px-1.5 py-0.5 bg-gray-100 rounded text-gray-700">
                          ?{idx + 1}=&quot;{typeof p === 'object' ? JSON.stringify(p) : String(p)}&quot;
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEMA & TABLES */}
      {activeTab === 'SCHEMA' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-4 bg-white rounded-xl border border-[#E9E5DA] p-4 shadow-xs space-y-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block mb-2">
              Database Tables
            </span>
            {schemas.map((table) => (
              <button
                key={table.name}
                onClick={() => setSelectedTable(table.name)}
                className={`w-full text-left p-3 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                  selectedTable === table.name
                    ? 'bg-emerald-50 text-emerald-950 font-bold border border-emerald-300 shadow-2xs'
                    : 'hover:bg-gray-50 text-gray-700 border border-transparent'
                }`}
              >
                <span>{table.name}</span>
                <span className="text-[10px] text-gray-400 font-normal">
                  {table.columns.length} cols · {table.rowCount} rows
                </span>
              </button>
            ))}
          </div>

          <div className="md:col-span-8 bg-white rounded-xl border border-[#E9E5DA] p-5 shadow-xs space-y-4">
            {(() => {
              const currentTable = schemas.find((s) => s.name === selectedTable) || schemas[0];
              return (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-bold font-mono text-gray-900">{currentTable.name}</h3>
                      <p className="text-xs text-gray-500">
                        {currentTable.columns.length} columns defined with standard SQL constraints
                      </p>
                    </div>
                  </div>

                  {/* Columns Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-mono text-left">
                      <thead className="bg-[#FAF9F5] border-y border-[#EAE6DC] text-gray-600">
                        <tr>
                          <th className="py-2 px-3">Column</th>
                          <th className="py-2 px-3">Data Type</th>
                          <th className="py-2 px-3">Constraint</th>
                          <th className="py-2 px-3">Nullable</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentTable.columns.map((col) => (
                          <tr key={col.name} className="hover:bg-gray-50">
                            <td className="py-2 px-3 font-semibold text-gray-900">{col.name}</td>
                            <td className="py-2 px-3 text-sky-800">{col.type}</td>
                            <td className="py-2 px-3 text-amber-800 font-semibold">{col.key || '—'}</td>
                            <td className="py-2 px-3 text-gray-500">{col.nullable ? 'YES' : 'NO'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* DDL Code */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
                      SQL DDL Definition:
                    </span>
                    <pre className="p-3 bg-[#FAF9F5] border border-[#EAE6DC] rounded-lg text-xs font-mono text-gray-800 overflow-x-auto">
                      {currentTable.ddl}
                    </pre>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TAB 3: WORKBENCH */}
      {activeTab === 'WORKBENCH' && (
        <div className="bg-white rounded-xl border border-[#E9E5DA] p-5 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-gray-100">
            <div>
              <h2 className="text-base font-bold text-gray-900">PreparedStatement Test Workbench</h2>
              <p className="text-xs text-gray-500">
                Execute parameterized statements against simulated MySQL and monitor query latency
              </p>
            </div>
            <button
              onClick={handleExecuteQuery}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Execute Statement</span>
            </button>
          </div>

          {/* Presets */}
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-gray-700 block">Preset Test Queries:</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presetQueries.map((pq, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectPreset(idx)}
                  className={`p-2.5 rounded-lg text-left text-xs border transition-all ${
                    selectedPreset === idx
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-[#FAF9F5] border-gray-200 text-gray-700 hover:bg-white'
                  }`}
                >
                  <span className="block font-semibold">{pq.label}</span>
                  <span className="font-mono text-[11px] text-gray-500 block truncate">{pq.sql}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SQL Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block font-mono">
              PreparedStatement (with ? placeholders):
            </label>
            <input
              type="text"
              value={querySql}
              onChange={(e) => setQuerySql(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-[#FAF9F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Parameters Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700 block font-mono">
              Bound Parameters (comma-separated):
            </label>
            <input
              type="text"
              value={queryParams}
              onChange={(e) => setQueryParams(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-[#FAF9F5] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Results Display */}
          {lastQueryResult && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Execution Successful</span>
                </span>
                <span className="font-mono text-emerald-800">
                  Latency: <strong className="tabular-nums">{lastQueryResult.timeMs} ms</strong>
                </span>
              </div>
              <div className="text-xs font-mono text-emerald-900 flex items-center gap-4">
                <span>TX ID: {lastQueryResult.txId}</span>
                <span>Rows: {lastQueryResult.rowsAffected}</span>
                <span>Time: {lastQueryResult.executedAt}</span>
              </div>
            </div>
          )}

          {/* Java JDBC Code Sample */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Equivalent Java JDBC Backend Code:
            </span>
            <pre className="p-3 bg-[#FAF9F5] border border-[#EAE6DC] rounded-lg text-xs font-mono text-gray-800 overflow-x-auto">
{`// Standard Java JDBC PreparedStatement Pattern
try (Connection conn = hikariDataSource.getConnection();
     PreparedStatement stmt = conn.prepareStatement("${querySql}")) {
    
    // Bind parameters safely against SQL injection
    stmt.setString(1, "${queryParams.split(',')[0]?.trim() || ''}");
    
    try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
            // Process queue session data
        }
    }
}`}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE FLOW */}
      {activeTab === 'ARCHITECTURE' && (
        <div className="bg-white rounded-xl border border-[#E9E5DA] p-6 shadow-xs space-y-6">
          <div>
            <h2 className="text-base font-bold text-gray-900">JDBC Backend Architecture Diagram</h2>
            <p className="text-xs text-gray-500">
              End-to-end data pipeline from user action down to connection pool and audit tables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
            {/* Step 1 */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Step 1: Frontend Event
              </span>
              <h3 className="text-sm font-bold text-gray-900">User / Staff Action</h3>
              <p className="text-xs text-gray-600">
                &lsquo;I&apos;m at Canteen&rsquo;, Order Placement, or &lsquo;Mark as Served&rsquo;.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
                Step 2: Pool Checkout
              </span>
              <h3 className="text-sm font-bold text-gray-900">HikariCP Pool</h3>
              <p className="text-xs text-gray-600">
                Acquires active connection from 10-connection pool.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">
                Step 3: PreparedStatement
              </span>
              <h3 className="text-sm font-bold text-gray-900">SQL Parameterization</h3>
              <p className="text-xs text-gray-600">
                Safely binds parameters to ? placeholders, preventing SQL injection.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                Step 4: Commit &amp; Audit
              </span>
              <h3 className="text-sm font-bold text-gray-900">MySQL Transaction</h3>
              <p className="text-xs text-gray-600">
                Commits to database, writes to jdbc_audit_log, releases connection.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
