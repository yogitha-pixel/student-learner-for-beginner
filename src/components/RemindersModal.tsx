import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  RotateCcw,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Subject, StudyPlan, StudySession } from '../types';

interface RemindersModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  plan: StudyPlan | null;
  onStartSession: (sessionId: string) => void;
  onRebalanceSchedule: () => void;
  isRebalancing: boolean;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  isOpen,
  onClose,
  subjects,
  plan,
  onStartSession,
  onRebalanceSchedule,
  isRebalancing,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  now.setHours(0, 0, 0, 0);

  // Urgent exams <= 5 days
  const urgentExams = subjects
    .map((sub) => {
      const exam = new Date(sub.examDate);
      exam.setHours(0, 0, 0, 0);
      const daysLeft = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return { ...sub, daysLeft };
    })
    .filter((sub) => sub.daysLeft >= 0 && sub.daysLeft <= 5)
    .sort((a, b) => a.daysLeft - b.daysLeft);

  // Overdue / pending sessions
  const todayStr = now.toISOString().split('T')[0];
  const overdueSessions: StudySession[] = [];

  if (plan && plan.days) {
    plan.days.forEach((d) => {
      if (d.date <= todayStr) {
        d.sessions.forEach((s) => {
          if (s.status === 'pending') {
            overdueSessions.push(s);
          }
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Reminders & Alerts</h3>
              <p className="text-xs text-slate-500">Urgent exam deadlines & missed sessions</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Urgent Exams */}
        <div className="space-y-2 text-xs">
          <div className="font-bold text-slate-900 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-500" />
            <span>Urgent Exam Countdowns (Within 5 Days)</span>
          </div>

          {urgentExams.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500">
              No exams within the next 5 days. You're on track!
            </div>
          ) : (
            <div className="space-y-2">
              {urgentExams.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{sub.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Exam Date: {sub.examDate} · {sub.difficulty}
                    </p>
                  </div>
                  <span className="text-rose-700 font-bold bg-rose-100 px-2.5 py-1 rounded-lg">
                    {sub.daysLeft === 0 ? 'Today!' : `${sub.daysLeft} day${sub.daysLeft === 1 ? '' : 's'} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Overdue / Missed Sessions */}
        <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Pending / Overdue Sessions ({overdueSessions.length})</span>
            </div>

            {overdueSessions.length > 0 && (
              <button
                type="button"
                onClick={onRebalanceSchedule}
                disabled={isRebalancing}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold transition-colors disabled:opacity-50"
              >
                <RotateCcw className={`w-3 h-3 ${isRebalancing ? 'animate-spin' : ''}`} />
                <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance Schedule'}</span>
              </button>
            )}
          </div>

          {overdueSessions.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>No overdue sessions! All scheduled reviews are up to date.</span>
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {overdueSessions.map((sess) => (
                <div
                  key={sess.id}
                  className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="text-[11px] font-semibold text-slate-500">{sess.subjectName}</div>
                    <div className="font-bold text-slate-900 truncate">{sess.topic}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {sess.date} · {sess.startTime} ({sess.durationMinutes}m)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onStartSession(sess.id);
                      onClose();
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shrink-0"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
