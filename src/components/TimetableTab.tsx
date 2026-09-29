import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Sparkles,
  Download,
  RotateCcw,
  Zap,
  Target,
  ArrowRight,
  BookOpen,
} from 'lucide-react';
import { StudyPlan, StudySession } from '../types';
import { exportPlanToICS } from '../utils/calendar';

interface TimetableTabProps {
  plan: StudyPlan | null;
  onUpdateSessionStatus: (sessionId: string, status: 'completed' | 'pending') => void;
  onStartSessionTimer: (session: StudySession) => void;
  onGetTopicTips: (session: StudySession) => void;
  onRebalanceSchedule: () => void;
  isRebalancing: boolean;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

export const TimetableTab: React.FC<TimetableTabProps> = ({
  plan,
  onUpdateSessionStatus,
  onStartSessionTimer,
  onGetTopicTips,
  onRebalanceSchedule,
  isRebalancing,
  onGeneratePlan,
  isGenerating,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [difficultyFilter, setDifficultyFilter] = useState<'all' | 'Hard' | 'Medium' | 'Easy'>('all');

  if (!plan || !plan.days || plan.days.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center max-w-xl mx-auto my-8 shadow-xs">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your AI Timetable is Ready to Build</h2>
        <p className="text-sm text-slate-600 mt-2 mb-6 leading-relaxed">
          Generate your personalized, evidence-based college timetable prioritizing tough subjects, upcoming exam countdowns, and optimal spaced review.
        </p>
        <button
          type="button"
          onClick={onGeneratePlan}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold text-sm transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{isGenerating ? 'Generating Timetable...' : 'Generate Daily Timetable Now'}</span>
        </button>
      </div>
    );
  }

  const currentDay = plan.days[selectedDayIndex] || plan.days[0];
  const totalSessions = currentDay.sessions.length;
  const completedSessions = currentDay.sessions.filter((s) => s.status === 'completed').length;
  const progressPercent = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const filteredSessions = currentDay.sessions.filter((sess) => {
    if (difficultyFilter === 'all') return true;
    return sess.difficulty === difficultyFilter;
  });

  return (
    <div className="space-y-5">
      {/* Top Header & Strategy Summary */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              Evidence-Based Timetable
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">Daily College Study Schedule</h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => exportPlanToICS(plan)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              title="Download iCalendar file (.ics) for Google Calendar or Apple Calendar"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export .ICS</span>
            </button>

            <button
              type="button"
              onClick={onRebalanceSchedule}
              disabled={isRebalancing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              title="Redistribute missed or overdue sessions across upcoming days"
            >
              <RotateCcw className={`w-3.5 h-3.5 text-slate-500 ${isRebalancing ? 'animate-spin' : ''}`} />
              <span>{isRebalancing ? 'Rebalancing...' : 'Rebalance Schedule'}</span>
            </button>

            <button
              type="button"
              onClick={onGeneratePlan}
              disabled={isGenerating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:bg-indigo-400 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isGenerating ? 'Generating...' : 'Re-Generate'}</span>
            </button>
          </div>
        </div>

        {plan.summary && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-900">AI Prioritization Strategy</div>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{plan.summary}</p>
            </div>
          </div>
        )}
      </div>

      {/* Day Selector Ribbon */}
      <div className="bg-white rounded-xl p-2 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {plan.days.map((day, idx) => {
            const dayCompleted = day.sessions.filter((s) => s.status === 'completed').length;
            const isAllDone = day.sessions.length > 0 && dayCompleted === day.sessions.length;
            const isSelected = idx === selectedDayIndex;

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDayIndex(idx)}
                className={`flex-shrink-0 px-3.5 py-2.5 rounded-lg text-left transition-colors ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-bold">
                    {day.dayOfWeek.slice(0, 3)} {day.date.slice(5)}
                  </span>
                  {isAllDone && (
                    <span
                      className={`text-[10px] px-1 rounded ${
                        isSelected ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Done
                    </span>
                  )}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {dayCompleted}/{day.sessions.length} sessions ({Math.round((day.totalMinutes || 0) / 60)}h)
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Overview */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <span>
                {currentDay.dayOfWeek}, {currentDay.date}
              </span>
              <span className="text-xs font-medium text-slate-500">
                · {totalSessions} sessions ({Math.round((currentDay.totalMinutes / 60) * 10) / 10} hours)
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>Theme:</span>
              <span className="font-semibold text-slate-800">{currentDay.focusTheme}</span>
            </p>
          </div>

          <div className="sm:text-right">
            <div className="text-xs text-slate-500 font-medium mb-1">
              Day Progress: {completedSessions} / {totalSessions} ({progressPercent}%)
            </div>
            <div className="w-full sm:w-44 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium mr-1">Filter:</span>
          {(['all', 'Hard', 'Medium', 'Easy'] as const).map((diff) => (
            <button
              key={diff}
              type="button"
              onClick={() => setDifficultyFilter(diff)}
              className={`px-2.5 py-1 rounded-md capitalize font-medium transition-colors ${
                difficultyFilter === diff
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Session Cards List */}
      <div className="space-y-3">
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <p className="text-sm text-slate-500">No sessions match this filter for this day.</p>
          </div>
        ) : (
          filteredSessions.map((sess) => {
            const isDone = sess.status === 'completed';
            const isHard = sess.difficulty === 'Hard';

            return (
              <div
                key={sess.id}
                className={`bg-white rounded-xl p-4 sm:p-5 border transition-all ${
                  isDone
                    ? 'border-emerald-200 bg-emerald-50/20 opacity-80'
                    : isHard
                    ? 'border-rose-200 shadow-xs hover:border-rose-300'
                    : 'border-slate-200 shadow-xs hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Left: Completion Toggle & Topic Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <button
                      type="button"
                      onClick={() => onUpdateSessionStatus(sess.id, isDone ? 'pending' : 'completed')}
                      className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors focus:outline-none shrink-0"
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>

                    <div className="space-y-1 flex-1 min-w-0">
                      {/* Course Name & Meta */}
                      <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-slate-900">{sess.subjectName}</span>
                        <span className="text-slate-400">·</span>
                        <span
                          className={`font-semibold ${
                            sess.difficulty === 'Hard'
                              ? 'text-rose-600'
                              : sess.difficulty === 'Medium'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {sess.difficulty} Difficulty
                        </span>
                        {sess.priority === 'high' && (
                          <>
                            <span className="text-slate-400">·</span>
                            <span className="text-red-700 font-semibold flex items-center gap-0.5">
                              ★ High Priority
                            </span>
                          </>
                        )}
                      </div>

                      {/* Topic Title */}
                      <h4
                        className={`text-sm font-semibold leading-snug break-words ${
                          isDone ? 'line-through text-slate-400' : 'text-slate-800'
                        }`}
                      >
                        {sess.topic}
                      </h4>

                      {/* Sub-meta: Technique & Time */}
                      <div className="flex items-center gap-3 pt-1 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Target className="w-3 h-3 text-indigo-600" />
                          <span>{sess.technique}</span>
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {sess.startTime} · {sess.durationMinutes} mins
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onGetTopicTips(sess)}
                      className="text-xs font-semibold px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                      title="Get 3 quick high-yield flash tips for this topic"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span className="hidden sm:inline">AI Study Tips</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onStartSessionTimer(sess)}
                      className="text-xs font-semibold px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                      title="Start Pomodoro Focus Timer for this session"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isDone ? 'Review' : 'Focus'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* College High-Yield Exam Advice Card */}
      {plan.highYieldTips && plan.highYieldTips.length > 0 && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">College High-Yield Exam Advice</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plan.highYieldTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
              >
                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                  {idx + 1}
                </div>
                <p className="leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
