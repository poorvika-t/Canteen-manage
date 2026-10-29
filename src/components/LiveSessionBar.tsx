import React, { useState, useEffect } from 'react';
import { useCanteen } from '../context/CanteenContext';
import { MapPin, Clock, CheckCircle2, AlertCircle, X, ChevronRight } from 'lucide-react';

export const LiveSessionBar: React.FC = () => {
  const { activeSession, leaveCanteenSession, studentActiveOrder, setCurrentTab } = useCanteen();
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const start = activeSession.joinedAt;
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  if (!activeSession) return null;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const elapsedFormatted = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

  const isReady = activeSession.status === 'ORDER_READY' || studentActiveOrder?.status === 'READY_FOR_PICKUP';
  const isCompleted = activeSession.status === 'COMPLETED' || studentActiveOrder?.status === 'SERVED';

  return (
    <div className="bg-emerald-50/90 border-b border-emerald-200/80 px-4 py-2.5 sm:px-6 transition-all shadow-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isReady
                ? 'bg-emerald-600 text-white animate-bounce'
                : isCompleted
                ? 'bg-sky-100 text-sky-800'
                : 'bg-emerald-200/80 text-emerald-800'
            }`}
          >
            {isReady ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : isCompleted ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <MapPin className="w-4 h-4" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-emerald-950">
                {isReady
                  ? 'Your Order is Ready for Pickup!'
                  : isCompleted
                  ? 'Order Completed & Served'
                  : 'Live Canteen Session Active'}
              </span>
              <span className="text-emerald-300">·</span>
              <span className="text-emerald-800 font-medium">
                Student: {activeSession.studentName}
              </span>
            </div>

            <div className="text-[12px] text-emerald-800/85 flex items-center gap-3 mt-0.5">
              {activeSession.tokenNo ? (
                <span>
                  Token: <strong className="text-emerald-950 font-bold tabular-nums">#{activeSession.tokenNo}</strong>
                </span>
              ) : (
                <span>Ready to order from campus menu</span>
              )}
              <span className="text-emerald-300">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-700" />
                <span className="tabular-nums font-mono text-emerald-950">{elapsedFormatted} elapsed</span>
              </span>
              {studentActiveOrder && !isReady && !isCompleted && (
                <>
                  <span className="text-emerald-300">·</span>
                  <span>
                    Est. Wait: <span className="font-semibold tabular-nums">~{studentActiveOrder.estimatedWaitMinutes} mins</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {studentActiveOrder ? (
            <button
              onClick={() => setCurrentTab('student')}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors flex items-center gap-1 shadow-xs"
            >
              <span>Track Queue</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentTab('student')}
              className="text-xs font-semibold px-3 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 transition-colors shadow-xs"
            >
              Browse Menu
            </button>
          )}

          <button
            onClick={leaveCanteenSession}
            title="End Session"
            className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-200/60 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
