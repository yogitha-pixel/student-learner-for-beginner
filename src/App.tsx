import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TimetableTab } from './components/TimetableTab';
import { SubjectsTab } from './components/SubjectsTab';
import { AssignmentMentorTab } from './components/AssignmentMentorTab';
import { StudyCoachTab } from './components/StudyCoachTab';
import { ProgressTab } from './components/ProgressTab';
import { FocusTimerModal } from './components/FocusTimerModal';
import { TopicTipsModal } from './components/TopicTipsModal';
import { RemindersModal } from './components/RemindersModal';
import { Subject, StudyPreferences, StudyPlan, StreakData, StudySession } from './types';
import { MAJOR_PRESETS, DEFAULT_PREFERENCES, STORAGE_KEYS } from './data/presets';
import { AlertCircle, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('timetable');

  // Subjects state
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading subjects from localStorage', e);
    }
    return MAJOR_PRESETS.cs.subjects;
  });

  // Preferences state
  const [preferences, setPreferences] = useState<StudyPreferences>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
      if (stored) return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed reading preferences from localStorage', e);
    }
    return DEFAULT_PREFERENCES;
  });

  // Study plan state
  const [plan, setPlan] = useState<StudyPlan | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STUDY_PLAN);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading plan from localStorage', e);
    }
    return null;
  });

  // Streak state
  const [streak, setStreak] = useState<StreakData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.STREAK);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed reading streak from localStorage', e);
    }
    return {
      currentStreak: 2,
      bestStreak: 4,
      lastCompletedDate: new Date().toISOString().split('T')[0],
      totalSessionsCompleted: 6,
      totalMinutesStudied: 270,
    };
  });

  // UI status states
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [activeFocusSession, setActiveFocusSession] = useState<StudySession | null>(null);
  const [isFocusModalOpen, setIsFocusModalOpen] = useState(false);

  const [activeTipsSession, setActiveTipsSession] = useState<StudySession | null>(null);
  const [isTipsModalOpen, setIsTipsModalOpen] = useState(false);

  const [isRemindersModalOpen, setIsRemindersModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
    } catch (e) {
      console.error('Failed saving subjects', e);
    }
  }, [subjects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(preferences));
    } catch (e) {
      console.error('Failed saving preferences', e);
    }
  }, [preferences]);

  useEffect(() => {
    try {
      if (plan) {
        localStorage.setItem(STORAGE_KEYS.STUDY_PLAN, JSON.stringify(plan));
      } else {
        localStorage.removeItem(STORAGE_KEYS.STUDY_PLAN);
      }
    } catch (e) {
      console.error('Failed saving plan', e);
    }
  }, [plan]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(streak));
    } catch (e) {
      console.error('Failed saving streak', e);
    }
  }, [streak]);

  // Initial plan generation if not present
  useEffect(() => {
    if (!plan && subjects.length > 0) {
      handleGeneratePlan();
    }
  }, []);

  // Preset switch
  const handleSelectPreset = (key: string) => {
    const preset = MAJOR_PRESETS[key];
    if (preset) {
      setSubjects(preset.subjects);
      generatePlanForSubjects(preset.subjects);
    }
  };

  const handleGeneratePlan = async () => {
    generatePlanForSubjects(subjects);
  };

  const generatePlanForSubjects = async (subjectsList: Subject[]) => {
    if (subjectsList.length === 0) {
      setErrorMessage('Please add at least one subject before generating a timetable.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjects: subjectsList,
          preferences,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server responded with ${res.status}`);
      }

      const data = await res.json();
      const newPlan: StudyPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date().toISOString(),
        summary:
          data.summary ||
          'Prioritized study timetable focused on tough subjects and upcoming deadlines.',
        highYieldTips: data.highYieldTips || [],
        days: data.days || [],
      };

      setPlan(newPlan);
      setActiveTab('timetable');
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setErrorMessage(err?.message || 'Could not generate plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle session status
  const handleUpdateSessionStatus = (
    sessionId: string,
    status: 'completed' | 'pending',
    notes?: string
  ) => {
    if (!plan) return;

    let justCompleted = false;
    let sessionMinutes = 45;

    const updatedDays = plan.days.map((day) => {
      const updatedSessions = day.sessions.map((sess) => {
        if (sess.id === sessionId) {
          if (status === 'completed' && sess.status !== 'completed') {
            justCompleted = true;
            sessionMinutes = sess.durationMinutes || 45;
          }
          return {
            ...sess,
            status,
            notes: notes !== undefined ? notes : sess.notes,
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
          };
        }
        return sess;
      });
      return { ...day, sessions: updatedSessions };
    });

    setPlan({ ...plan, days: updatedDays });

    if (justCompleted) {
      const todayStr = new Date().toISOString().split('T')[0];
      const newStreakCount =
        streak.lastCompletedDate === todayStr ? streak.currentStreak : streak.currentStreak + 1;

      setStreak({
        currentStreak: newStreakCount,
        bestStreak: Math.max(streak.bestStreak, newStreakCount),
        lastCompletedDate: todayStr,
        totalSessionsCompleted: streak.totalSessionsCompleted + 1,
        totalMinutesStudied: streak.totalMinutesStudied + sessionMinutes,
      });
    }
  };

  // Rebalance schedule
  const handleRebalanceSchedule = async () => {
    if (!plan) return;
    setIsRebalancing(true);

    try {
      const today = new Date().toISOString().split('T')[0];
      const incomplete = plan.days.flatMap((d) =>
        d.sessions.filter((s) => s.status === 'pending' && s.date <= today)
      );
      const remainingDays = plan.days.filter((d) => d.date >= today);

      const res = await fetch('/api/rebalance-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          incompleteSessions: incomplete,
          remainingDays: remainingDays.map((d) => d.date),
          subjects,
        }),
      });

      const data = await res.json();
      if (data.redistributedSessions && Array.isArray(data.redistributedSessions)) {
        const rebalanceMap = new Map<string, { sessionId: string; newDate: string; newTime?: string }>(
          data.redistributedSessions.map((r: any) => [r.sessionId, r])
        );

        const updatedDays = plan.days.map((day) => {
          const sessions = day.sessions.map((sess) => {
            const rebal = rebalanceMap.get(sess.id);
            if (rebal) {
              return {
                ...sess,
                date: rebal.newDate,
                startTime: rebal.newTime || sess.startTime,
              };
            }
            return sess;
          });
          return { ...day, sessions };
        });

        setPlan({
          ...plan,
          days: updatedDays,
          summary: `${data.advice || 'Missed sessions redistributed.'} ${plan.summary}`,
        });
      }
    } catch (err: any) {
      console.error('Rebalance failed:', err);
    } finally {
      setIsRebalancing(false);
    }
  };

  // Launch focus timer
  const handleStartSessionTimer = (session: StudySession) => {
    setActiveFocusSession(session);
    setIsFocusModalOpen(true);
  };

  // Launch topic flash tips
  const handleGetTopicTips = (session: StudySession) => {
    setActiveTipsSession(session);
    setIsTipsModalOpen(true);
  };

  // Add topic to study plan from assignment mentor
  const handleAddTopicToStudyPlan = (topicName: string, subjectName: string) => {
    if (!plan || plan.days.length === 0) return;

    const firstDay = plan.days[0];
    const newSession: StudySession = {
      id: `sess-custom-${Date.now()}`,
      date: firstDay.date,
      subjectId: 'custom-asg',
      subjectName: subjectName || 'Assignment Scaffolding',
      topic: topicName,
      difficulty: 'Medium',
      priority: 'high',
      technique: 'Structured Drafting & Scaffolding',
      startTime: '16:00',
      durationMinutes: 45,
      status: 'pending',
    };

    const updatedDays = plan.days.map((d, idx) => {
      if (idx === 0) {
        return {
          ...d,
          sessions: [newSession, ...d.sessions],
          totalMinutes: d.totalMinutes + 45,
        };
      }
      return d;
    });

    setPlan({ ...plan, days: updatedDays });
    setActiveTab('timetable');
  };

  // Count unread urgent exams (<= 5 days)
  const urgentRemindersCount = (() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return subjects.filter((s) => {
      const exam = new Date(s.examDate);
      exam.setHours(0, 0, 0, 0);
      const diff = Math.ceil((exam.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return diff >= 0 && diff <= 5;
    }).length;
  })();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streak={streak}
        onOpenTimer={() => {
          setActiveFocusSession(null);
          setIsFocusModalOpen(true);
        }}
        onOpenReminders={() => setIsRemindersModalOpen(true)}
        unreadRemindersCount={urgentRemindersCount}
        onSelectPreset={handleSelectPreset}
        isGenerating={isGenerating}
      />

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between text-xs text-rose-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Views */}
        {activeTab === 'timetable' && (
          <TimetableTab
            plan={plan}
            onUpdateSessionStatus={handleUpdateSessionStatus}
            onStartSessionTimer={handleStartSessionTimer}
            onGetTopicTips={handleGetTopicTips}
            onRebalanceSchedule={handleRebalanceSchedule}
            isRebalancing={isRebalancing}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'subjects' && (
          <SubjectsTab
            subjects={subjects}
            preferences={preferences}
            onUpdateSubjects={setSubjects}
            onUpdatePreferences={setPreferences}
            onGeneratePlan={handleGeneratePlan}
            isGenerating={isGenerating}
          />
        )}

        {activeTab === 'assignment' && (
          <AssignmentMentorTab onAddTopicToStudyPlan={handleAddTopicToStudyPlan} />
        )}

        {activeTab === 'n8n-chat' && <StudyCoachTab subjects={subjects} plan={plan} />}

        {activeTab === 'progress' && (
          <ProgressTab plan={plan} subjects={subjects} streak={streak} />
        )}
      </main>

      {/* Focus Timer Modal */}
      <FocusTimerModal
        session={activeFocusSession}
        isOpen={isFocusModalOpen}
        onClose={() => setIsFocusModalOpen(false)}
        onSessionCompleted={(sessId, notes) =>
          handleUpdateSessionStatus(sessId, 'completed', notes)
        }
      />

      {/* Topic Tips Modal */}
      <TopicTipsModal
        session={activeTipsSession}
        isOpen={isTipsModalOpen}
        onClose={() => setIsTipsModalOpen(false)}
      />

      {/* Reminders Modal */}
      <RemindersModal
        isOpen={isRemindersModalOpen}
        onClose={() => setIsRemindersModalOpen(false)}
        subjects={subjects}
        plan={plan}
        onStartSession={(sessId) => {
          if (plan) {
            for (const d of plan.days) {
              const target = d.sessions.find((s) => s.id === sessId);
              if (target) {
                handleStartSessionTimer(target);
                break;
              }
            }
          }
        }}
        onRebalanceSchedule={handleRebalanceSchedule}
        isRebalancing={isRebalancing}
      />
    </div>
  );
}
