import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Layers,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  BookOpen,
  Send,
  Save,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { AssignmentHelpResult, OutlineSection } from '../types';
import { STORAGE_KEYS } from '../data/presets';

interface AssignmentMentorTabProps {
  onAddTopicToStudyPlan?: (topicName: string, subjectName: string) => void;
}

const SAMPLE_PROMPTS = [
  {
    category: 'Computer Science',
    title: 'Dijkstra Algorithm & Shortest Path Routing Proof',
    type: 'Code & Theory Report',
  },
  {
    category: 'Economics & History',
    title: 'Causes and Macroeconomic Consequences of the Industrial Revolution',
    type: 'Essay / Paper',
  },
  {
    category: 'Psychology & Health',
    title: 'Cognitive Behavioral Therapy for Generalized Anxiety Disorders',
    type: 'Case Study',
  },
  {
    category: 'Finance & Business',
    title: 'Discounted Cash Flow Valuation & WACC Sensitivity Analysis',
    type: 'Case Study',
  },
];

export const AssignmentMentorTab: React.FC<AssignmentMentorTabProps> = ({
  onAddTopicToStudyPlan,
}) => {
  const [topic, setTopic] = useState('');
  const [academicLevel, setAcademicLevel] = useState('College / Undergraduate');
  const [assignmentType, setAssignmentType] = useState('Essay / Paper');
  const [details, setDetails] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<AssignmentHelpResult | null>(null);
  const [scratchpad, setScratchpad] = useState('');
  const [savedAssignments, setSavedAssignments] = useState<AssignmentHelpResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ASSIGNMENTS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Load scratchpad for current result
  useEffect(() => {
    if (currentResult) {
      try {
        const key = `studypulse_scratchpad_${currentResult.id}`;
        const savedNote = localStorage.getItem(key) || '';
        setScratchpad(savedNote);
      } catch {}
    }
  }, [currentResult]);

  const handleScratchpadChange = (text: string) => {
    setScratchpad(text);
    if (currentResult) {
      try {
        localStorage.setItem(`studypulse_scratchpad_${currentResult.id}`, text);
      } catch {}
    }
  };

  const handleGenerate = async (customTopic?: string, customType?: string) => {
    const t = (customTopic || topic).trim();
    const type = customType || assignmentType;
    if (!t) {
      setError('Please enter an assignment prompt or topic.');
      return;
    }

    setIsLoading(true);
    setError(null);
    if (customTopic) setTopic(customTopic);
    if (customType) setAssignmentType(customType);

    try {
      const res = await fetch('/api/assignment-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: t,
          academicLevel,
          assignmentType: type,
          details,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${res.status}`);
      }

      const data: AssignmentHelpResult = await res.json();
      data.id = `asg-${Date.now()}`;
      data.createdAt = new Date().toISOString();
      data.topic = t;
      data.academicLevel = academicLevel;
      data.assignmentType = type;

      setCurrentResult(data);

      const updated = [data, ...savedAssignments.filter((a) => a.topic !== t)].slice(0, 10);
      setSavedAssignments(updated);
      try {
        localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
      } catch {}
    } catch (err: any) {
      console.error('Assignment help error:', err);
      setError(err?.message || 'Failed to generate assignment scaffolding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = savedAssignments.filter((a) => a.id !== id);
    setSavedAssignments(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ASSIGNMENTS, JSON.stringify(updated));
    } catch {}
    if (currentResult?.id === id) {
      setCurrentResult(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs">
        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
          Scaffolding & Rubric Mentor
        </span>
        <h2 className="text-lg font-bold text-slate-900 mt-0.5">AI College Assignment Mentor</h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Input your assignment prompt or essay question to generate an actionable step-by-step roadmap, structured outline with word counts, key arguments, and common pitfalls to avoid.
        </p>

        {/* Quick Sample Prompts */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Try a College Sample Prompt:
          </div>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleGenerate(p.title, p.type)}
                className="text-left text-xs bg-slate-50 hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 rounded-lg px-2.5 py-1.5 transition-colors flex items-center gap-1.5"
              >
                <span className="font-semibold text-slate-700">{p.category}:</span>
                <span className="text-slate-600">{p.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Form on Left, Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: 5 cols */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Assignment Parameters</span>
            </h3>

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Prompt / Question / Topic *
              </label>
              <textarea
                rows={3}
                required
                placeholder="Paste the prompt or topic from your college syllabus..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Academic Level</label>
                <select
                  value={academicLevel}
                  onChange={(e) => setAcademicLevel(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-indigo-500"
                >
                  <option>College / Undergraduate</option>
                  <option>Advanced / Graduate</option>
                  <option>Introductory / Prep</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Assignment Type</label>
                <select
                  value={assignmentType}
                  onChange={(e) => setAssignmentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-indigo-500"
                >
                  <option>Essay / Paper</option>
                  <option>Case Study</option>
                  <option>Lab Report</option>
                  <option>Literature Review</option>
                  <option>Research Proposal</option>
                  <option>Code & Theory Report</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">
                Special Rubric Criteria / Details (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Must cite 4 empirical papers; 1500 words limit; APA format..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={() => handleGenerate()}
              disabled={isLoading || !topic.trim()}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isLoading ? 'Scaffolding Roadmap...' : 'Generate Assignment Roadmap'}</span>
            </button>
          </div>

          {/* Saved History */}
          {savedAssignments.length > 0 && (
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                Recent Scaffolding History
              </div>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {savedAssignments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => setCurrentResult(a)}
                    className={`p-2.5 rounded-lg border text-left cursor-pointer transition-colors flex items-center justify-between gap-2 ${
                      currentResult?.id === a.id
                        ? 'border-indigo-300 bg-indigo-50/50'
                        : 'border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-[11px] font-semibold text-indigo-700 truncate">{a.assignmentType}</div>
                      <div className="text-xs font-medium text-slate-900 truncate">{a.topic}</div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSaved(a.id, e)}
                      className="text-slate-400 hover:text-rose-600 p-1 shrink-0"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Output: 7 cols */}
        <div className="lg:col-span-7 space-y-4">
          {!currentResult ? (
            <div className="bg-white rounded-2xl p-10 border border-slate-200 text-center shadow-2xs space-y-3">
              <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-800 text-base">No Scaffolding Active</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Submit an assignment topic on the left or click one of the college sample prompts above to view the step-by-step roadmap and rubric breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header card with action */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                      {currentResult.assignmentType} Scaffolding
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{currentResult.title}</h3>
                  </div>

                  {onAddTopicToStudyPlan && (
                    <button
                      type="button"
                      onClick={() => onAddTopicToStudyPlan(currentResult.topic, 'General Assignment')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0 shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Study Plan</span>
                    </button>
                  )}
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 leading-relaxed">
                  <span className="font-bold">Objective: </span>
                  {currentResult.simpleExplanation}
                </div>
              </div>

              {/* 4 Pillars & Examples */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Key Arguments to Include</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    {currentResult.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Common Pitfalls to Avoid</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    {currentResult.commonMistakes.map((mistake, idx) => (
                      <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-rose-500 font-bold shrink-0">×</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Structured Outline with Word Counts */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-bold text-slate-900 text-sm">Structured Paper Outline & Milestones</h4>
                </div>

                <div className="space-y-2.5">
                  {currentResult.structuredOutline.map((sec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-900">{sec.section}</span>
                        <span className="text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                          {sec.suggestedWordCount}
                        </span>
                      </div>
                      <p className="text-slate-600 text-xs">{sec.goal}</p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {sec.keyElements.map((el, eIdx) => (
                          <span
                            key={eIdx}
                            className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                          >
                            {el}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Scratchpad */}
              <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-slate-900 text-sm">Drafting Scratchpad (Auto-Saved)</h4>
                  </div>
                  <span className="text-slate-400 text-[11px]">Saves automatically to your browser</span>
                </div>
                <textarea
                  rows={4}
                  placeholder="Jot down working thesis, citations, paper outline notes..."
                  value={scratchpad}
                  onChange={(e) => handleScratchpadChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
