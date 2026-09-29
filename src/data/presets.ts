import { Subject, StudyPreferences } from '../types';

export function getFutureDate(daysAhead: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

export const MAJOR_PRESETS: Record<
  string,
  { label: string; icon: string; subjects: Subject[] }
> = {
  cs: {
    label: 'Computer Science Major',
    icon: '💻',
    subjects: [
      {
        id: 'sub-cs-1',
        name: 'Data Structures & Algorithms',
        examDate: getFutureDate(5),
        difficulty: 'Hard',
        topics: [
          'Binary Search Trees',
          'Graph Traversal (BFS/DFS)',
          'Dynamic Programming',
          'Dijkstra Algorithm',
        ],
        color: '#6366f1',
        targetHours: 14,
      },
      {
        id: 'sub-cs-2',
        name: 'Operating Systems',
        examDate: getFutureDate(9),
        difficulty: 'Hard',
        topics: [
          'Process Scheduling',
          'Virtual Memory & Paging',
          'Deadlocks & Semaphores',
          'File Systems',
        ],
        color: '#ec4899',
        targetHours: 12,
      },
      {
        id: 'sub-cs-3',
        name: 'Linear Algebra',
        examDate: getFutureDate(13),
        difficulty: 'Medium',
        topics: [
          'Eigenvalues & Eigenvectors',
          'Matrix Diagonalization',
          'Vector Spaces',
          'Inner Products',
        ],
        color: '#06b6d4',
        targetHours: 8,
      },
      {
        id: 'sub-cs-4',
        name: 'Technical Writing',
        examDate: getFutureDate(18),
        difficulty: 'Easy',
        topics: [
          'Research Paper Abstract',
          'Documentation Standards',
          'Peer Review Revisions',
        ],
        color: '#10b981',
        targetHours: 4,
      },
    ],
  },
  premed: {
    label: 'Pre-Med / Health Sciences',
    icon: '🩺',
    subjects: [
      {
        id: 'sub-med-1',
        name: 'Organic Chemistry II',
        examDate: getFutureDate(4),
        difficulty: 'Hard',
        topics: [
          'Electrophilic Aromatic Substitution',
          'Carbonyl Mechanisms',
          'NMR Spectroscopy',
          'Stereochemistry',
        ],
        color: '#f43f5e',
        targetHours: 16,
      },
      {
        id: 'sub-med-2',
        name: 'Human Physiology',
        examDate: getFutureDate(8),
        difficulty: 'Hard',
        topics: [
          'Renal Regulation',
          'Action Potentials & Synapses',
          'Cardiac Cycle',
          'Endocrine Feedback',
        ],
        color: '#8b5cf6',
        targetHours: 12,
      },
      {
        id: 'sub-med-3',
        name: 'Cell Biology',
        examDate: getFutureDate(12),
        difficulty: 'Medium',
        topics: [
          'Mitochondrial Respiration',
          'Membrane Transport',
          'Cell Cycle Checkpoints',
        ],
        color: '#3b82f6',
        targetHours: 8,
      },
      {
        id: 'sub-med-4',
        name: 'Biostatistics',
        examDate: getFutureDate(16),
        difficulty: 'Easy',
        topics: [
          'Hypothesis Testing (t-tests)',
          'p-values & Confidence Intervals',
          'Chi-Square Analysis',
        ],
        color: '#14b8a6',
        targetHours: 6,
      },
    ],
  },
  business: {
    label: 'Business & Finance',
    icon: '📊',
    subjects: [
      {
        id: 'sub-biz-1',
        name: 'Corporate Finance',
        examDate: getFutureDate(6),
        difficulty: 'Hard',
        topics: [
          'DCF Valuation Models',
          'Cost of Capital (WACC)',
          'Capital Budgeting',
          'Risk & Return CAPM',
        ],
        color: '#f59e0b',
        targetHours: 14,
      },
      {
        id: 'sub-biz-2',
        name: 'Financial Accounting',
        examDate: getFutureDate(10),
        difficulty: 'Medium',
        topics: [
          'Cash Flow Statements',
          'Inventory Valuations (FIFO/LIFO)',
          'Balance Sheet Adjustments',
        ],
        color: '#3b82f6',
        targetHours: 10,
      },
      {
        id: 'sub-biz-3',
        name: 'Microeconomics',
        examDate: getFutureDate(14),
        difficulty: 'Medium',
        topics: [
          'Monopoly vs Oligopoly',
          'Elasticity of Demand',
          'Game Theory & Nash Equilibrium',
        ],
        color: '#10b981',
        targetHours: 8,
      },
      {
        id: 'sub-biz-4',
        name: 'Marketing Principles',
        examDate: getFutureDate(20),
        difficulty: 'Easy',
        topics: [
          'Market Segmentation',
          'Consumer Psychology',
          'Digital Ad Strategies',
        ],
        color: '#a855f7',
        targetHours: 5,
      },
    ],
  },
  engineering: {
    label: 'Engineering Core',
    icon: '⚙️',
    subjects: [
      {
        id: 'sub-eng-1',
        name: 'Thermodynamics',
        examDate: getFutureDate(5),
        difficulty: 'Hard',
        topics: [
          'First & Second Law Systems',
          'Carnot Cycles',
          'Enthalpy & Entropy',
          'Phase Change Diagrams',
        ],
        color: '#ef4444',
        targetHours: 15,
      },
      {
        id: 'sub-eng-2',
        name: 'Circuits & Signals',
        examDate: getFutureDate(9),
        difficulty: 'Hard',
        topics: [
          'RLC Transient Analysis',
          'AC Phasor Analysis',
          'Fourier Transforms',
          'Op-Amps Filters',
        ],
        color: '#8b5cf6',
        targetHours: 12,
      },
      {
        id: 'sub-eng-3',
        name: 'Multivariable Calculus',
        examDate: getFutureDate(14),
        difficulty: 'Medium',
        topics: [
          'Partial Derivatives',
          'Multiple Integrals',
          'Green & Stokes Theorems',
          'Vector Fields',
        ],
        color: '#0ea5e9',
        targetHours: 9,
      },
    ],
  },
};

export const DEFAULT_PREFERENCES: StudyPreferences = {
  dailyHoursWeekday: 3.5,
  dailyHoursWeekend: 5.0,
  preferredTime: 'afternoon',
  sessionDurationMinutes: 45,
  breakDurationMinutes: 10,
  startDate: new Date().toISOString().split('T')[0],
  daysToPlan: 7,
};

export const STORAGE_KEYS = {
  SUBJECTS: 'studypulse_subjects_v1',
  PREFERENCES: 'studypulse_preferences_v1',
  STUDY_PLAN: 'studypulse_plan_v1',
  STREAK: 'studypulse_streak_v1',
  ASSIGNMENTS: 'studypulse_saved_assignments_v1',
  CHAT_HISTORY: 'studypulse_n8n_chat_history_v1',
  CHAT_SESSION_ID: 'studypulse_n8n_chat_session_id',
  WEBHOOK_URL: 'studypulse_custom_webhook_v1',
};
