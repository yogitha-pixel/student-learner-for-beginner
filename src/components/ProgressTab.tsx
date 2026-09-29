import React from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Flame,
  AlertTriangle,
  Calendar,
  Award,
  BookOpen,
} from 'lucide-react';
import { StudyPlan, Subject, StreakData } from '../types';

interface ProgressTabProps {
  plan: StudyPlan | null;
  subjects: Subject[];
  streak: StreakData;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ plan, subjects, streak }) => {
  // Aggregate stats from plan
  let totalSessionsInPlan = 0;
  let completedSessionsInPlan = 0;
  let minutesCompletedInPlan = 0;

  if (plan && plan.days) {
    plan.days.forEach((day) => {
      day.sessions.forEach((s) => {
        totalSessionsInPlan++;
        if (s.status === 'completed') {
          completedSessionsInPlan++;
          minutesCompletedInPlan += s.durationMinutes || 45;
        }
      });
    });
  }

  const hoursLogged = Math.round((streak.totalMinutesStudied / 60) * 10) / 10;

  // Exam proximity watchlist
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const watchlist = [...subjects]
    .map((sub) => {
      const exam = new Date(sub.examDate);
      exam.setHours(0, 0, 0, 0);
      const daysDiff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return {
        ...sub,
        daysLeft: daysDiff,
      };
    })
    .sort((a, b) => a.daysLeft - b.daysLeft);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Performance Analytics
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">Study Progress & Exam Watchlist</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Real-time tracking of logged study hours, session completion rates, and upcoming exam urgency countdowns.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Study Hours Logged</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{hoursLogged}h</div>
          <p className="text-[11px] text-slate-400">Total verified focus time</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sessions Mastered</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {streak.totalSessionsCompleted}
          </div>
          <p className="text-[11px] text-slate-400">
            {completedSessionsInPlan} in current plan
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Consistency Streak</span>
            <Flame className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{streak.currentStreak} Days</div>
          <p className="text-[11px] text-slate-400">Personal best: {streak.bestStreak} days</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Courses</span>
            <BookOpen className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{subjects.length}</div>
          <p className="text-[11px] text-slate-400">Under active review</p>
        </div>
      </div>

      {/* Exam Proximity Watchlist */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm">Exam Proximity Watchlist</h3>
          </div>
          <span className="text-xs text-slate-500">Ordered by nearest deadline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {watchlist.map((sub) => {
            const isCritical = sub.daysLeft >= 0 && sub.daysLeft <= 3;
            const isWarning = sub.daysLeft > 3 && sub.daysLeft <= 7;
            const isPassed = sub.daysLeft < 0;

            return (
              <div
                key={sub.id}
                className={`p-4 rounded-xl border transition-colors flex flex-col justify-between space-y-3 ${
                  isCritical
                    ? 'border-rose-200 bg-rose-50/30'
                    : isWarning
                    ? 'border-amber-200 bg-amber-50/20'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span
                      className={`font-semibold ${
                        sub.difficulty === 'Hard'
                          ? 'text-rose-600'
                          : sub.difficulty === 'Medium'
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                    <span className="font-medium">{sub.examDate}</span>
                  </div>

                  <h4 className="font-bold text-slate-900 text-sm leading-snug">{sub.name}</h4>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{sub.topics.length} topics</span>
                  <span
                    className={`font-bold ${
                      isPassed
                        ? 'text-slate-400'
                        : isCritical
                        ? 'text-rose-600'
                        : isWarning
                        ? 'text-amber-700'
                        : 'text-indigo-600'
                    }`}
                  >
                    {isPassed
                      ? 'Exam Passed'
                      : sub.daysLeft === 0
                      ? 'Exam Today!'
                      : `${sub.daysLeft} day${sub.daysLeft === 1 ? '' : 's'} left`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Milestones & Motivation */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">Study Habit Milestones</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-800">Spaced Repetition</div>
            <p className="text-slate-500">
              Studying consistently for {streak.currentStreak} day{streak.currentStreak === 1 ? '' : 's'} boosts long-term recall by up to 200%.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-800">Active Recall Ratio</div>
            <p className="text-slate-500">
              High-difficulty topics are paired with self-quizzing and problem sets rather than passive reading.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <div className="font-semibold text-slate-800">Burnout Prevention</div>
            <p className="text-slate-500">
              Every 45-minute focus block includes spaced rest intervals to sustain cognitive sharpness.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
