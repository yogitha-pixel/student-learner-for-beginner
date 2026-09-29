import React, { useState } from 'react';
import {
  GraduationCap,
  Flame,
  Clock,
  Bell,
  Calendar,
  BookOpen,
  FileText,
  Bot,
  TrendingUp,
  Sparkles,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { StreakData } from '../types';
import { MAJOR_PRESETS } from '../data/presets';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  streak: StreakData;
  onOpenTimer: () => void;
  onOpenReminders: () => void;
  unreadRemindersCount: number;
  onSelectPreset: (key: string) => void;
  isGenerating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  streak,
  onOpenTimer,
  onOpenReminders,
  unreadRemindersCount,
  onSelectPreset,
  isGenerating,
}) => {
  const [showPresetsMenu, setShowPresetsMenu] = useState(false);

  const navItems = [
    { id: 'timetable', label: 'AI Timetable', icon: Calendar },
    { id: 'subjects', label: 'College Subjects', icon: BookOpen },
    { id: 'assignment', label: 'Assignment Mentor', icon: FileText },
    { id: 'n8n-chat', label: 'AI Study Coach', icon: Bot, badge: 'n8n' },
    { id: 'progress', label: 'Analytics & Watchlist', icon: TrendingUp },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('timetable')}
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 group-hover:bg-indigo-700 transition-colors">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-slate-900 tracking-tight">Student Learner</span>
                <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                  College AI Planner
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Smart Timetable · Exam Countdown · Assignment Scaffolding
              </p>
            </div>
          </div>

          {/* Quick Actions & Widgets */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Major Presets Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPresetsMenu(!showPresetsMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Major Presets</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showPresetsMenu && (
                <div
                  className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setShowPresetsMenu(false)}
                >
                  <div className="px-2.5 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Load Course Preset
                  </div>
                  {Object.entries(MAJOR_PRESETS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        onSelectPreset(key);
                        setShowPresetsMenu(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 flex items-center gap-2 transition-colors"
                    >
                      <span className="text-sm">{val.icon}</span>
                      <span>{val.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Streak Counter */}
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-amber-900 text-xs font-semibold"
              title={`${streak.currentStreak} day consistency streak! Best: ${streak.bestStreak} days`}
            >
              <Flame className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span>{streak.currentStreak}d Streak</span>
            </div>

            {/* Focus Session launcher */}
            <button
              type="button"
              onClick={onOpenTimer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-xs"
              title="Launch Pomodoro Focus Timer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Focus Timer</span>
            </button>

            {/* Reminders / Exam Alerts */}
            <button
              type="button"
              onClick={onOpenReminders}
              className="relative p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Upcoming Exam Alerts & Schedule Rebalancer"
            >
              <Bell className="w-4 h-4" />
              {unreadRemindersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadRemindersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      isActive ? 'bg-indigo-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
