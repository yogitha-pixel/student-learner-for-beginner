import React, { useState, useEffect } from 'react';
import { X, Sparkles, Lightbulb, HelpCircle, BookOpen, Check } from 'lucide-react';
import { StudySession, TopicFlashTips } from '../types';

interface TopicTipsModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TopicTipsModal: React.FC<TopicTipsModalProps> = ({
  session,
  isOpen,
  onClose,
}) => {
  const [tipsData, setTipsData] = useState<TopicFlashTips | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    if (session && isOpen) {
      setIsLoading(true);
      setShowAnswer(false);
      setTipsData(null);

      fetch('/api/subject-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectName: session.subjectName,
          topic: session.topic,
          difficulty: session.difficulty,
        }),
      })
        .then((res) => res.json())
        .then((data: TopicFlashTips) => {
          setTipsData(data);
        })
        .catch((err) => {
          console.error('Failed to fetch topic tips:', err);
          setTipsData({
            tips: [
              `Write out the core mechanism and definitions for "${session.topic}" on a blank page without looking at notes (Active Recall).`,
              `Identify the two most common exam pitfalls and boundary cases for this topic.`,
              `Practice 2 timed past-paper questions under realistic exam conditions.`,
            ],
            memoryTrick: `Input → Mechanism → Terminal Condition`,
            practiceQuestion: `Explain the fundamental concept of ${session.topic} and discuss how variation in initial parameters affects the outcome.`,
          });
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [session, isOpen]);

  if (!isOpen || !session) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              High-Yield Exam Tips
            </span>
            <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
              {session.topic}
            </h3>
            <p className="text-xs text-slate-500">
              {session.subjectName} · {session.difficulty} Difficulty
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
            <span className="text-xs font-medium text-slate-500">
              Generating topic-tailored study tips...
            </span>
          </div>
        ) : tipsData ? (
          <div className="space-y-4 text-xs">
            {/* 3 Flash Tips */}
            <div className="space-y-2">
              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>3 High-Yield Study Flash Tips</span>
              </div>
              <div className="space-y-2">
                {tipsData.tips.map((tip, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-slate-700"
                  >
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                      {idx + 1}
                    </div>
                    <p className="leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mnemonic / Memory Hook */}
            {tipsData.memoryTrick && (
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-600" />
                  <span>Memory Hook / Mnemonic</span>
                </div>
                <p className="text-amber-900 leading-relaxed font-medium">
                  {tipsData.memoryTrick}
                </p>
              </div>
            )}

            {/* Practice Exam Question */}
            {tipsData.practiceQuestion && (
              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
                <div className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <span>Realistic Practice Exam Question</span>
                </div>
                <p className="text-indigo-900 leading-relaxed">
                  {tipsData.practiceQuestion}
                </p>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
