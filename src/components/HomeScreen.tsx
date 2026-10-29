import React from 'react';
import { useCanteen } from '../context/CanteenContext';
import {
  MapPin,
  Eye,
  Clock,
  Users,
  UtensilsCrossed,
  ArrowRight,
  ShieldCheck,
  Database,
  Calendar,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const HomeScreen: React.FC = () => {
  const {
    startCanteenSession,
    checkQueueStatusOnly,
    setCurrentTab,
    queueStats,
    currentBreakInfo,
    currentStudent,
    students,
    switchStudent,
    activeSession,
  } = useCanteen();

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#F2FBF6] via-[#FAF9F5] to-[#FCFBF7] border border-[#E3EFE7] p-6 sm:p-10 lg:p-12 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Headlines & 2 Primary Interactive Buttons */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/80 border border-emerald-300/70 rounded-full text-xs font-semibold text-emerald-900">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>Campus Food Court Live Network</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.15]">
                Skip the lines. Eat fresh. <br className="hidden sm:inline" />
                <span className="text-emerald-800">Know your wait time.</span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 max-w-xl leading-relaxed">
                CanteenFlow syncs campus class schedules with kitchen prep. Order in advance,
                track live token queues, and pick up your meal right when it&apos;s piping hot.
              </p>
            </div>

            {/* The Two Main Interactive Buttons Requested in Prompt */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Button 1: I'm at Canteen */}
              <button
                onClick={startCanteenSession}
                className="group relative flex-1 flex items-center justify-between p-4 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl shadow-sm hover:shadow-md transition-all text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-emerald-600/80 group-hover:bg-emerald-500/80 flex items-center justify-center shrink-0 border border-emerald-400/30 transition-colors">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-white leading-snug">
                      I&apos;m at Canteen
                    </span>
                    <span className="text-xs text-emerald-100/90 block">
                      Start live session & track wait time
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-200 group-hover:translate-x-1 transition-transform ml-2 shrink-0" />
              </button>

              {/* Button 2: Check Queue Status (View-Only Mode) */}
              <button
                onClick={checkQueueStatusOnly}
                className="group flex-1 flex items-center justify-between p-4 bg-white hover:bg-[#F8FDF9] text-gray-800 border border-emerald-300/80 rounded-xl shadow-xs hover:border-emerald-400 transition-all text-left"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-lg bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center shrink-0 border border-sky-200/60 text-sky-800 transition-colors">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm font-bold block text-gray-900 leading-snug">
                      Check Queue Status
                    </span>
                    <span className="text-xs text-gray-500 block">
                      View live crowd & token count
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 group-hover:text-emerald-700 transition-all ml-2 shrink-0" />
              </button>
            </div>

            {/* Active Student Switcher strip */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs text-gray-600">
              <span className="font-medium text-gray-700">Browsing as:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {students.map((std) => (
                  <button
                    key={std.id}
                    onClick={() => switchStudent(std.id)}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      currentStudent.id === std.id
                        ? 'bg-emerald-200/90 text-emerald-950 font-semibold border border-emerald-400/80 shadow-2xs'
                        : 'bg-white hover:bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {std.name.split(' ')[0]} ({std.department.split(' ')[0]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual & Live Kitchen Status Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden border border-[#E0EBE2] bg-white shadow-sm">
              <img
                src="/src/assets/images/canteen_hero_banner_1793279339140.jpg"
                alt="Modern campus canteen with students"
                className="w-full h-56 sm:h-64 object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />

              {/* Status Snapshot overlay/card */}
              <div className="p-5 bg-white space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                    <span className="text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Main Food Hall Status
                    </span>
                  </div>
                  <span className="text-xs text-emerald-800 font-medium bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    Live Updates
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC]">
                    <span className="text-[11px] text-gray-500 block mb-1">Serving Now</span>
                    <span className="text-lg font-bold text-emerald-900 font-mono tabular-nums block">
                      #{queueStats.servingNowToken}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC]">
                    <span className="text-[11px] text-gray-500 block mb-1">Avg Wait</span>
                    <span className="text-lg font-bold text-gray-900 font-mono tabular-nums block">
                      {queueStats.avgWaitTimeMins}m
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF9F5] border border-[#EAE6DC]">
                    <span className="text-[11px] text-gray-500 block mb-1">Orders in Line</span>
                    <span className="text-lg font-bold text-gray-900 font-mono tabular-nums block">
                      {queueStats.totalWaiting + queueStats.totalPreparing}
                    </span>
                  </div>
                </div>

                {/* Next Break Alert */}
                {currentBreakInfo.next && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-50/80 border border-sky-200/80 text-xs text-sky-900">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sky-700 shrink-0" />
                      <span>
                        Next: <strong>{currentBreakInfo.next.name}</strong> ({currentBreakInfo.next.startTime})
                      </span>
                    </div>
                    <span className="font-semibold text-sky-800">
                      in {currentBreakInfo.minutesUntilNext}m
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Crowd & Metrics Bar */}
      <section className="bg-white rounded-xl border border-[#E9E5DA] p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Live Campus Canteen Traffic Meter</h2>
            <p className="text-xs text-gray-500">Real-time occupancy and estimated kitchen throughput</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-500">Crowd Density:</span>
            <span
              className={`font-semibold px-2.5 py-1 rounded-md text-xs border ${
                queueStats.occupancyPercent > 70
                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-200'
              }`}
            >
              {queueStats.occupancyPercent > 70 ? 'Peak Rush' : 'Moderate & Fluid'} ({queueStats.occupancyPercent}%)
            </span>
          </div>
        </div>

        {/* Progress gauge */}
        <div className="pt-4 space-y-2">
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden p-0.5">
            <div
              className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-emerald-400 via-emerald-500 to-amber-400"
              style={{ width: `${queueStats.occupancyPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-gray-400 font-medium">
            <span>Low (10-30%)</span>
            <span>Balanced (30-65%)</span>
            <span>Rush Hour (65-100%)</span>
          </div>
        </div>
      </section>

      {/* 4 Feature Module Quick Navigation Cards */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Explore CanteenFlow Modules</h2>
          <span className="text-xs text-gray-500">Fast access for students, kitchen staff & devs</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Student Portal & Break Schedule */}
          <div
            onClick={() => setCurrentTab('student')}
            className="group cursor-pointer bg-white p-6 rounded-xl border border-[#E9E5DA] hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-800 mb-4 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-between">
              <span>Student Portal & Timetable</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Browse break intervals, pre-order from the kitchen menu, and watch your live token wait time countdown.
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <span>View Break Schedules & Order</span>
            </div>
          </div>

          {/* Card 2: Staff POS Screen */}
          <div
            onClick={() => setCurrentTab('staff')}
            className="group cursor-pointer bg-white p-6 rounded-xl border border-[#E9E5DA] hover:border-sky-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-800 mb-4 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-between">
              <span>Staff POS Terminal</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-sky-700 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Counter PIN login (1234 / 5678), walk-in order punching, and instant &lsquo;Mark as Served&rsquo; wait-time computation.
            </p>
            <div className="text-[11px] text-sky-800 font-semibold flex items-center gap-1">
              <span>Open Staff POS & Kitchen Display</span>
            </div>
          </div>

          {/* Card 3: Database & JDBC Architecture */}
          <div
            onClick={() => setCurrentTab('jdbc')}
            className="group cursor-pointer bg-white p-6 rounded-xl border border-[#E9E5DA] hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-emerald-200/80 flex items-center justify-center text-emerald-900 mb-4 group-hover:scale-105 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1 flex items-center justify-between">
              <span>JDBC Architecture & Logs</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-1 transition-all" />
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Simulated MySQL connection pooling, PreparedStatement execution, schema DDL, and real-time JDBC audit logs.
            </p>
            <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-1">
              <span>Inspect PreparedStatements & Pool</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
