import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Settings,
  RefreshCw,
  RotateCcw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { ChatMessage, Subject, StudyPlan } from '../types';
import { STORAGE_KEYS } from '../data/presets';

interface StudyCoachTabProps {
  subjects: Subject[];
  plan: StudyPlan | null;
}

const QUICK_PROMPTS = [
  'How should I prioritize my study sessions today?',
  'Explain how to study for my hardest course',
  'Help me break down an assignment question',
  'Give me an active recall test on one of my topics',
];

export const StudyCoachTab: React.FC<StudyCoachTabProps> = ({ subjects, plan }) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: "Hello! 👋 I'm your AI College Study Coach powered by intelligent learning models and n8n workflow integration. I can help optimize your exam timetable, suggest active recall techniques, or break down difficult coursework concepts!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.WEBHOOK_URL) || '';
    } catch {
      return '';
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch {}
  }, [messages]);

  const handleSaveWebhook = (url: string) => {
    setWebhookUrl(url);
    try {
      localStorage.setItem(STORAGE_KEYS.WEBHOOK_URL, url);
    } catch {}
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const timetableSummary = plan ? plan.summary : 'No active timetable generated yet.';

      const res = await fetch('/api/n8n-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId: 'student-session-1',
          chatHistory: messages.slice(-6),
          subjects,
          timetableSummary,
          webhookUrl: webhookUrl.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || 'Let me help you with your study questions.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'bot',
        text: 'Sorry, I encountered an issue connecting to the study assistant. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    const fresh: ChatMessage[] = [
      {
        id: 'msg-welcome',
        sender: 'bot',
        text: "Chat cleared! How can I assist with your college exam prep or study timetable today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(fresh);
    try {
      localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(fresh));
    } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Header card with settings toggle */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">Student Learner AI Coach</h3>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                Online
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Exam strategy, active recall practice, and n8n webhook automation integration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>n8n Webhook</span>
            {showSettings ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleClearChat}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Optional n8n Webhook Settings Drawer */}
      {showSettings && (
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="font-semibold text-slate-900">Optional: Connect Custom n8n Webhook Workflow</div>
          <p className="text-slate-500 leading-relaxed">
            By default, Student Learner uses high-performance Gemini 3.8 Flash academic models. If you have an n8n webhook workflow set up (e.g. for Notion sync, Telegram alerts, or custom LangChain nodes), paste your n8n Production/Test Webhook URL below:
          </p>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="url"
              placeholder="https://your-n8n-instance.app/webhook/..."
              value={webhookUrl}
              onChange={(e) => handleSaveWebhook(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500 text-xs font-mono"
            />
            {webhookUrl && (
              <button
                type="button"
                onClick={() => handleSaveWebhook('')}
                className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 border border-slate-200 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages Viewport */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col h-[520px]">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed space-y-1.5 ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200/80 text-slate-800'
                      : 'bg-indigo-600 text-white shadow-2xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  <div
                    className={`text-[10px] text-right ${
                      isBot ? 'text-slate-400' : 'text-indigo-200'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <span
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <span
                  className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
                <span className="text-[11px] font-medium text-slate-600">Consulting study syllabus...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none bg-slate-50/50">
          <span className="text-[11px] font-semibold text-slate-400 shrink-0">Quick prompts:</span>
          {QUICK_PROMPTS.map((qp, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(qp)}
              className="text-[11px] bg-white border border-slate-200 text-slate-700 hover:text-indigo-700 hover:border-indigo-300 rounded-lg px-2.5 py-1 whitespace-nowrap transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 border-t border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about study schedules, exam countdowns, active recall, or assignments..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-indigo-500 focus:bg-white"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
