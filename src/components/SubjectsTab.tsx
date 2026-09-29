import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Sparkles,
  Settings2,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { Subject, StudyPreferences, Difficulty, PreferredTime } from '../types';

interface SubjectsTabProps {
  subjects: Subject[];
  preferences: StudyPreferences;
  onUpdateSubjects: (subjects: Subject[]) => void;
  onUpdatePreferences: (preferences: StudyPreferences) => void;
  onGeneratePlan: () => void;
  isGenerating: boolean;
}

const COLOR_PALETTE = ['#6366f1', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6'];

export const SubjectsTab: React.FC<SubjectsTabProps> = ({
  subjects,
  preferences,
  onUpdateSubjects,
  onUpdatePreferences,
  onGeneratePlan,
  isGenerating,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [name, setName] = useState('');
  const [examDate, setExamDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [difficulty, setDifficulty] = useState<Difficulty>('Hard');
  const [targetHours, setTargetHours] = useState(12);
  const [color, setColor] = useState(COLOR_PALETTE[0]);
  const [newTopicInput, setNewTopicInput] = useState('');
  const [topics, setTopics] = useState<string[]>([]);

  const handleAddTopic = () => {
    if (newTopicInput.trim() && !topics.includes(newTopicInput.trim())) {
      setTopics([...topics, newTopicInput.trim()]);
      setNewTopicInput('');
    }
  };

  const handleRemoveTopic = (t: string) => {
    setTopics(topics.filter((topic) => topic !== t));
  };

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSub: Subject = {
      id: `sub-${Date.now()}`,
      name: name.trim(),
      examDate,
      difficulty,
      targetHours: Number(targetHours) || 10,
      color,
      topics: topics.length > 0 ? topics : ['General Core Syllabus Review'],
    };

    onUpdateSubjects([...subjects, newSub]);
    setName('');
    setTopics([]);
    setNewTopicInput('');
    setShowAddModal(false);
  };

  const handleDeleteSubject = (id: string) => {
    onUpdateSubjects(subjects.filter((s) => s.id !== id));
  };

  const getDaysUntilExam = (dateStr: string) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const exam = new Date(dateStr);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Action */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Academic Course Load
          </span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Your College Subjects ({subjects.length})</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure exam dates, difficulty levels, target hours, and specific syllabus topics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add Subject</span>
          </button>

          <button
            type="button"
            onClick={onGeneratePlan}
            disabled={isGenerating || subjects.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl text-xs font-semibold transition-colors shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{isGenerating ? 'Generating...' : 'Build AI Timetable'}</span>
          </button>
        </div>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {subjects.map((sub) => {
          const daysLeft = getDaysUntilExam(sub.examDate);
          const isUrgent = daysLeft >= 0 && daysLeft <= 4;
          const isPassed = daysLeft < 0;

          return (
            <div
              key={sub.id}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-colors"
            >
              {/* Color accent hairline */}
              <div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: sub.color || '#6366f1' }}
              />

              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-base leading-snug truncate">{sub.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
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
                      <span>·</span>
                      <span>{sub.targetHours}h Target</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSubject(sub.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 opacity-60 group-hover:opacity-100 transition-opacity"
                    title="Remove Subject"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Exam Countdown */}
                <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-600 flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exam: {sub.examDate}</span>
                  </span>
                  <span
                    className={`font-semibold ${
                      isPassed
                        ? 'text-slate-400'
                        : isUrgent
                        ? 'text-rose-600 font-bold'
                        : 'text-indigo-600'
                    }`}
                  >
                    {isPassed
                      ? 'Exam passed'
                      : daysLeft === 0
                      ? 'Exam Today!'
                      : `${daysLeft} day${daysLeft === 1 ? '' : 's'} remaining`}
                  </span>
                </div>

                {/* Topics / Syllabus */}
                <div className="mt-3">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Syllabus Topics ({sub.topics.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {sub.topics.map((t, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Study Preferences Configuration Panel */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <Settings2 className="w-4 h-4 text-slate-600" />
          <h3 className="font-bold text-slate-900 text-sm">Study Time & Algorithm Preferences</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">Weekday Study Target</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                max="12"
                value={preferences.dailyHoursWeekday}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, dailyHoursWeekday: parseFloat(e.target.value) || 3.5 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500"
              />
              <span className="text-slate-500 font-medium shrink-0">hrs/day</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Weekend Study Target</label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.5"
                min="1"
                max="14"
                value={preferences.dailyHoursWeekend}
                onChange={(e) =>
                  onUpdatePreferences({ ...preferences, dailyHoursWeekend: parseFloat(e.target.value) || 5 })
                }
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500"
              />
              <span className="text-slate-500 font-medium shrink-0">hrs/day</span>
            </div>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Preferred Time of Day</label>
            <select
              value={preferences.preferredTime}
              onChange={(e) =>
                onUpdatePreferences({ ...preferences, preferredTime: e.target.value as PreferredTime })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-indigo-500 capitalize"
            >
              <option value="morning">Morning (09:00)</option>
              <option value="afternoon">Afternoon (14:00)</option>
              <option value="evening">Evening (18:00)</option>
              <option value="night">Night (20:00)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-600 font-medium mb-1">Session Block Duration</label>
            <select
              value={preferences.sessionDurationMinutes}
              onChange={(e) =>
                onUpdatePreferences({
                  ...preferences,
                  sessionDurationMinutes: parseInt(e.target.value, 10) || 45,
                })
              }
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-indigo-500"
            >
              <option value="25">25 mins (Pomodoro)</option>
              <option value="45">45 mins (Standard College Block)</option>
              <option value="60">60 mins (Deep Work)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Add Subject Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-base">Add College Subject</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Course / Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Chemistry II or Operating Systems"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Upcoming Exam Date</label>
                  <input
                    type="date"
                    required
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-xs bg-white focus:outline-indigo-500"
                  >
                    <option value="Hard">Hard (High Priority)</option>
                    <option value="Medium">Medium</option>
                    <option value="Easy">Easy</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">Target Study Hours</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={targetHours}
                    onChange={(e) => setTargetHours(parseInt(e.target.value, 10) || 10)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-medium mb-1">Accent Color</label>
                  <div className="flex items-center gap-2 pt-1">
                    {COLOR_PALETTE.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${
                          color === c ? 'scale-110 border-slate-800' : 'border-transparent'
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Topics builder */}
              <div>
                <label className="block text-slate-700 font-medium mb-1">Key Topics or Exam Modules</label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="e.g. Graph Traversal or Dynamic Programming"
                    value={newTopicInput}
                    onChange={(e) => setNewTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTopic}
                    className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 shrink-0"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {topics.map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 px-2 py-0.5 rounded text-xs"
                    >
                      <span>{t}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(t)}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  {topics.length === 0 && (
                    <span className="text-[11px] text-slate-400">
                      Press enter or click Add to append topics
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold text-xs hover:bg-indigo-700 shadow-2xs"
                >
                  Save Subject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
