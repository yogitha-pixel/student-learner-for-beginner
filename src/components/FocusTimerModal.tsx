import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { StudySession } from '../types';
import { focusAudio } from '../utils/sound';

interface FocusTimerModalProps {
  session: StudySession | null;
  isOpen: boolean;
  onClose: () => void;
  onSessionCompleted: (sessionId: string, notes?: string) => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({
  session,
  isOpen,
  onClose,
  onSessionCompleted,
}) => {
  const initialDuration = (session?.durationMinutes || 25) * 60;
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [isActive, setIsActive] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'whitenoise' | 'ambient'>('off');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (session) {
      setTimeLeft((session.durationMinutes || 25) * 60);
      setIsActive(false);
      setNotes(session.notes || '');
    }
  }, [session]);

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      focusAudio.playChime();
      focusAudio.stop();
      setAmbientSound('off');
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Audio control
  const handleSoundToggle = (mode: 'rain' | 'whitenoise' | 'ambient') => {
    if (ambientSound === mode) {
      focusAudio.stop();
      setAmbientSound('off');
    } else {
      focusAudio.playSound(mode);
      setAmbientSound(mode);
    }
  };

  const handleClose = () => {
    focusAudio.stop();
    setAmbientSound('off');
    setIsActive(false);
    onClose();
  };

  const handleMarkComplete = () => {
    if (session) {
      onSessionCompleted(session.id, notes);
    }
    handleClose();
  };

  if (!isOpen) return null;

  const totalTime = (session?.durationMinutes || 25) * 60;
  const progressFraction = timeLeft / totalTime;
  const strokeDashoffset = 440 * (1 - progressFraction);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
              {session?.technique || 'Pomodoro Focus Session'}
            </span>
            <h3 className="font-bold text-slate-900 text-base leading-snug truncate">
              {session?.topic || 'General Focus Block'}
            </h3>
            {session && <p className="text-xs text-slate-500">{session.subjectName}</p>}
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Circular Timer Visualizer */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
              {/* Background circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-100 fill-none"
              />
              {/* Animated Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="8"
                strokeDasharray="440"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-indigo-600 fill-none transition-all duration-500"
              />
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {timeFormatted}
              </div>
              <span className="text-xs text-slate-400 font-medium mt-1">
                {isActive ? 'In Focus Mode' : timeLeft === 0 ? 'Session Complete!' : 'Paused'}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-4">
            <button
              type="button"
              onClick={() => {
                setTimeLeft(totalTime);
                setIsActive(false);
              }}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsActive(!isActive)}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              {isActive ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Start Focus</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Ambient Sound Selector */}
        <div className="pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 font-medium flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-slate-400" />
              <span>Ambient White Noise:</span>
            </span>
            <span className="text-slate-400 text-[11px] capitalize">{ambientSound}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'rain', label: 'Rain' },
              { id: 'whitenoise', label: 'White Noise' },
              { id: 'ambient', label: 'Study Hall' },
            ].map((sound) => {
              const active = ambientSound === sound.id;
              return (
                <button
                  key={sound.id}
                  type="button"
                  onClick={() => handleSoundToggle(sound.id as any)}
                  className={`py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    active
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {sound.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Session Notes */}
        <div className="space-y-1 text-xs">
          <label className="block text-slate-700 font-medium">Session Scratchpad / Active Recall Notes</label>
          <textarea
            rows={2}
            placeholder="Jot key formulas, recall notes, or questions that arose during study..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-indigo-500 text-xs"
          />
        </div>

        {/* Mark Completed Button */}
        {session && (
          <button
            type="button"
            onClick={handleMarkComplete}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Session as Completed</span>
          </button>
        )}
      </div>
    </div>
  );
};
