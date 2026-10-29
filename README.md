# CanteenFlow - Smart Canteen Queue Management System

A full-stack campus dining and queue management web application designed with a clean, lively light pastel aesthetic (soft mint greens, warm cream surfaces, gentle pastel blue accents, and dark gray typography).

CanteenFlow syncs college timetable break schedules with kitchen orders, providing students with real-time wait times and tokens while giving canteen staff a streamlined POS terminal with automated wait-time tracking and simulated MySQL JDBC backend architecture.

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: `v18.0.0` or higher (Node 20+ recommended)
- **npm**: `v9.0.0` or higher (or `pnpm` / `yarn`)

### 1. Install Dependencies
In the root directory of the application, run:
```bash
npm install
```

### 2. Run the Development Server
Start the local Vite development server on port 3000:
```bash
npm run dev
```

The application will be live at:
```
http://localhost:3000
```
*(In Google AI Studio or cloud environments, it automatically binds to host `0.0.0.0` and port `3000`)*.

### 3. Build for Production
To create an optimized production build:
```bash
npm run build
```
The compiled static assets will be output to the `/dist` directory.

### 4. Preview the Production Build
To test the built production bundle locally:
```bash
npm run preview
```

### 5. Type Check & Lint
To verify TypeScript compilation and lint checks:
```bash
npm run lint
```

---

## 🔑 Demo Credentials & Quick Test Access

### Staff POS Terminal PINs
Navigate to the **Staff POS** tab in the navigation bar to test staff controls:
| Station | PIN | Purpose |
| :--- | :--- | :--- |
| **Counter Cashier #1** | `1234` | Walk-in counter order punching, payment intake, order tracking |
| **Kitchen Display Chef** | `5678` | Prep station controls, mark ready, and "Mark as Served" |

*(Note: The login screen also features 1-click test fill buttons for instant access).*

### Sample Student Profiles
Under the **Student Portal** or **Home Screen**, you can switch between preloaded student profiles:
- **Maya Chen** (CS2024-042, Computer Science, Year 3) — Balance: `$42.50`
- **Alex Kumar** (ME2023-118, Mechanical Eng., Year 2) — Balance: `$28.00`
- **Samantha Lee** (BT2025-089, Biotechnology, Year 1) — Balance: `$65.20`
- **Jordan Patel** (EC2024-210, Electronics, Year 4) — Balance: `$19.80`

---

## 📱 Core Application Modules

### 1. Home Screen
- **"I'm at Canteen" Button**: Starts an active live session, checks the student in at the food hall, and begins tracking their wait time.
- **"Check Queue Status" Button**: View-only mode for glancing at current queue depth, estimated wait times, and serving tokens without starting an order.
- **Live Traffic Meter**: Dynamic occupancy gauge (Low, Balanced, Rush Hour), serving token display, and break interval countdown.

### 2. Student Portal
- **Timetable Break Schedule Viewer**: Official campus break windows (*Morning Snack Break 10:30–10:50 AM*, *Lunch Break 12:45–01:30 PM*, *Evening Tea 04:15–04:45 PM*) with historical crowd levels and recommended arrival times.
- **Live Canteen Queue List**: Live token board with real-time cooking and pickup progression.
- **Kitchen Menu & Ordering**: Fresh campus menu with spice customization, dietary filters, campus wallet checkout, and token generation.

### 3. Staff POS Screen
- **Kitchen Controls**: Advance orders from `WAITING` $\rightarrow$ `PREPARING` $\rightarrow$ `READY_FOR_PICKUP` $\rightarrow$ `SERVED`.
- **Automatic Wait-Time Calculation**: Clicking **"Mark as Served"** calculates the exact elapsed wait time (e.g., `Wait Time: 7m 14s`), updates campus rolling averages, and commits a simulated SQL update.
- **Direct Walk-In Punching**: Cashiers can punch walk-in orders with immediate token issuance.
- **Synthesized Audio Chimes**: Web Audio API sound alerts for ready pickups.

### 4. Database & JDBC Connection Architecture
- **HikariCP Connection Pool**: Real-time tracking of active vs. idle connections (10-connection pool), checkouts, and driver telemetry.
- **PreparedStatement Simulator**: Parameterized SQL queries using `?` placeholders with parameter binding and execution timings.
- **Streaming Audit Log**: Live transaction log showing `TX ID`, `Connection ID`, SQL statements, parameters, and millisecond latencies.
- **Schema DDL Inspector**: Relational MySQL tables (`students`, `timetable_breaks`, `menu_items`, `orders`, `queue_sessions`, `jdbc_audit_log`).
- **Interactive Workbench**: Test custom PreparedStatements and view equivalent Java JDBC backend code.

---

## 🛠️ Technology Stack

- **Framework**: React 19 (SPA with functional components & hooks)
- **Language**: TypeScript 5+ (Strict typing)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) with custom pastel design system
- **Build Tool**: Vite 8
- **Icons**: Lucide React
- **Audio**: Web Audio API (zero external sound file dependencies)
- **Fonts**: Plus Jakarta Sans (UI) & JetBrains Mono (Tabular numerals and code)

---

## 📁 Project Structure

```
/
├── index.html                   # HTML entry point with fonts & metadata
├── metadata.json                # AI Studio application metadata
├── package.json                 # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── vite.config.ts               # Vite configuration with Tailwind CSS v4
├── README.md                    # This documentation file
└── src/
    ├── main.tsx                 # React entry point
    ├── App.tsx                  # Main layout and tab orchestrator
    ├── index.css                # Global Tailwind CSS and pastel tokens
    ├── types.ts                 # TypeScript interfaces for students, orders, JDBC
    ├── assets/
    │   └── images/              # Generated high-resolution food & canteen assets
    ├── data/
    │   └── mockData.ts          # Initial students, timetable, menu items, orders
    ├── services/
    │   └── jdbcSimulator.ts     # JDBC engine, HikariCP pool & PreparedStatement logger
    ├── context/
    │   └── CanteenContext.tsx   # Global state, queue math & audio synthesis
    └── components/
        ├── Navbar.tsx           # 3-zone top navigation bar
        ├── LiveSessionBar.tsx   # Real-time token and active session tracker
        ├── HomeScreen.tsx       # Landing view with 'I'm at Canteen' & queue status
        ├── StudentPortal.tsx    # Timetable, live queue list & food ordering
        ├── StaffPOSScreen.tsx   # PIN login, walk-in orders & 'Mark as Served'
        └── JdbcInspectorModal.tsx # JDBC connection pool & SQL query workbench
```
