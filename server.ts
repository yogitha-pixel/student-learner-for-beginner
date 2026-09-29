import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// ----------------------------------------------------
// Fallback Plan Generator
// ----------------------------------------------------
function generateFallbackPlan(subjects: any[], preferences: any) {
  const daysCount = preferences?.daysToPlan || 7;
  const start = new Date(preferences?.startDate || new Date().toISOString().split('T')[0]);
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const techniques = [
    'Active Recall & Self-Quiz',
    'Feynman Technique (Teach-Back)',
    'Spaced Review & Flash Cards',
    'Past-Paper Problem Drills',
    'Formula Derivation & Concept Mapping',
  ];

  const days: any[] = [];
  const sortedSubjects = [...subjects].sort((a, b) => {
    // Prioritize Hard and nearest exam dates
    const diffWeight: Record<string, number> = { Hard: 3, Medium: 2, Easy: 1 };
    const wA = diffWeight[a.difficulty] || 2;
    const wB = diffWeight[b.difficulty] || 2;
    return wB - wA;
  });

  let topicCounter = 0;
  for (let i = 0; i < daysCount; i++) {
    const curDate = new Date(start);
    curDate.setDate(curDate.getDate() + i);
    const dateStr = curDate.toISOString().split('T')[0];
    const isWeekend = curDate.getDay() === 0 || curDate.getDay() === 6;
    const dailyHours = isWeekend
      ? preferences?.dailyHoursWeekend || 5
      : preferences?.dailyHoursWeekday || 3.5;
    const sessionMinutes = preferences?.sessionDurationMinutes || 45;
    const totalSessions = Math.max(1, Math.floor((dailyHours * 60) / (sessionMinutes + 10)));

    let preferredStartHour = 14; // default afternoon
    if (preferences?.preferredTime === 'morning') preferredStartHour = 9;
    if (preferences?.preferredTime === 'evening') preferredStartHour = 18;
    if (preferences?.preferredTime === 'night') preferredStartHour = 20;

    const sessions: any[] = [];
    for (let s = 0; s < totalSessions; s++) {
      const sub = sortedSubjects[(topicCounter + s) % sortedSubjects.length];
      const topicsList = sub.topics && sub.topics.length > 0 ? sub.topics : ['Core Concept Review'];
      const topic = topicsList[s % topicsList.length];
      const technique = techniques[(s + i) % techniques.length];
      const startH = preferredStartHour + Math.floor((s * (sessionMinutes + 15)) / 60);
      const startM = (s * (sessionMinutes + 15)) % 60;
      const startTimeStr = `${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}`;

      sessions.push({
        id: `sess-${dateStr}-${s + 1}`,
        date: dateStr,
        subjectId: sub.id,
        subjectName: sub.name,
        topic,
        difficulty: sub.difficulty || 'Medium',
        priority: sub.difficulty === 'Hard' ? 'high' : 'medium',
        technique,
        startTime: startTimeStr,
        durationMinutes: sessionMinutes,
        status: 'pending',
      });
    }

    topicCounter++;
    const focusTheme =
      sessions.length > 0
        ? `Focus: ${sessions[0].subjectName} Deep Work & Recall`
        : 'Structured Review Day';

    days.push({
      date: dateStr,
      dayOfWeek: daysOfWeek[curDate.getDay()],
      focusTheme,
      totalMinutes: sessions.reduce((acc, sess) => acc + sess.durationMinutes, 0),
      sessions,
    });
  }

  return {
    summary: `Structured ${daysCount}-day college study timetable with balanced intervals, active recall, and spaced repetition weighted toward high-difficulty courses.`,
    highYieldTips: [
      'Prioritize Hard courses first during peak alertness hours before fatigue sets in.',
      'Test yourself with active retrieval instead of passively re-reading notes or slides.',
      'Take disciplined 10-minute micro-breaks between intensive 45-minute focus intervals.',
      'Review weak concept mistakes within 24 hours to lock them into long-term memory.',
    ],
    days,
  };
}

// ----------------------------------------------------
// 1. POST /api/generate-plan
// ----------------------------------------------------
app.post('/api/generate-plan', async (req: Request, res: Response) => {
  const { subjects, preferences } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return res.status(400).json({ error: 'At least one subject is required.' });
  }

  if (ai) {
    try {
      const prompt = `You are an elite college academic advisor and learning strategist.
Generate an optimal, high-yield daily study timetable for a college student based on the following subjects and preferences.

Subjects:
${JSON.stringify(subjects, null, 2)}

Study Preferences:
${JSON.stringify(preferences, null, 2)}

Rules:
1. Distribute sessions across the ${preferences?.daysToPlan || 7} days starting from ${preferences?.startDate || new Date().toISOString().split('T')[0]}.
2. Heavily prioritize Hard difficulty subjects and subjects with closest upcoming exam dates.
3. Assign an effective evidence-based cognitive technique for each session (e.g. "Active Recall & Self-Quiz", "Feynman Technique", "Spaced Review", "Past-Paper Problem Drills", "Formula Derivation").
4. Keep session durations at ${preferences?.sessionDurationMinutes || 45} minutes.
5. Provide a realistic startTime string (e.g. "09:00", "14:15") according to preferredTime ("${preferences?.preferredTime || 'afternoon'}").
6. Provide a 1-sentence high-level summary strategy and 4 actionable highYieldTips.

Return ONLY a JSON object with this exact shape:
{
  "summary": "string",
  "highYieldTips": ["string", "string", "string", "string"],
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayOfWeek": "string",
      "focusTheme": "string",
      "totalMinutes": number,
      "sessions": [
        {
          "id": "string",
          "date": "YYYY-MM-DD",
          "subjectId": "string",
          "subjectName": "string",
          "topic": "string",
          "difficulty": "Hard" | "Medium" | "Easy",
          "priority": "high" | "medium" | "low",
          "technique": "string",
          "startTime": "HH:MM",
          "durationMinutes": number,
          "status": "pending"
        }
      ]
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json(parsed);
      }
    } catch (err: any) {
      console.warn('Gemini generate-plan error, falling back to local algorithm:', err?.message || err);
    }
  }

  // Fallback
  const fallback = generateFallbackPlan(subjects, preferences);
  return res.json(fallback);
});

// ----------------------------------------------------
// 2. POST /api/subject-tips
// ----------------------------------------------------
app.post('/api/subject-tips', async (req: Request, res: Response) => {
  const { subjectName, topic, difficulty } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  if (ai) {
    try {
      const prompt = `You are an expert college professor in ${subjectName || 'this subject'}.
Provide 3 ultra-concise, high-yield exam flash study tips, a memorable mnemonic/memory trick, and 1 realistic practice exam question for:
Topic: "${topic}" (${difficulty || 'Medium'} difficulty).

Return ONLY a JSON object:
{
  "tips": [
    "string",
    "string",
    "string"
  ],
  "memoryTrick": "string",
  "practiceQuestion": "string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini subject-tips error, falling back:', err?.message || err);
    }
  }

  // Fallback tips
  return res.json({
    tips: [
      `Write out the core mechanism and definitions for "${topic}" on a blank page without consulting notes (Active Retrieval).`,
      `Identify the 2 most common pitfalls or edge cases students miss on exam questions about "${topic}".`,
      `Practice 2 timed past-paper problems under 15-minute exam simulation conditions.`,
    ],
    memoryTrick: `Associate the key steps with the mnemonic rule: Input → State Transition → Terminal Condition.`,
    practiceQuestion: `Explain the fundamental trade-off involved in "${topic}" and compute or describe the expected outcome when conditions are varied.`,
  });
});

// ----------------------------------------------------
// 3. POST /api/assignment-help
// ----------------------------------------------------
app.post('/api/assignment-help', async (req: Request, res: Response) => {
  const { topic, academicLevel, assignmentType, details } = req.body;

  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  if (ai) {
    try {
      const prompt = `You are a university academic writing tutor and assignment scaffolding mentor.
Break down the following assignment into a clear, beginner-friendly roadmap for a college student.

Assignment Prompt/Topic: "${topic}"
Academic Level: "${academicLevel || 'College / Undergraduate'}"
Assignment Type: "${assignmentType || 'Essay / Paper'}"
Additional Instructions: "${details || 'None provided'}"

Provide:
1. title: Engaging, clear title
2. simpleExplanation: A 2-sentence plain-English breakdown of what this assignment is really asking.
3. keyPoints: 4 essential pillars or concepts to include.
4. examples: 3 concrete illustrative examples or case studies.
5. structuredOutline: 4-5 sections (e.g. Introduction, Argument 1, Argument 2, Counter-Argument, Synthesis/Conclusion). For each section include section name, goal, keyElements array, and suggestedWordCount.
6. commonMistakes: 3 common errors students lose marks for.
7. recommendedNextSteps: 3 quick chronological action steps.

Return ONLY a JSON object matching these keys.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const text = response.text;
      if (text) {
        return res.json(JSON.parse(text));
      }
    } catch (err: any) {
      console.warn('Gemini assignment-help error, falling back:', err?.message || err);
    }
  }

  // Fallback
  return res.json({
    title: topic.length > 50 ? topic.slice(0, 50) + '...' : topic,
    simpleExplanation: `This assignment assesses your capacity to critically evaluate the core concepts of "${topic}", present reasoned arguments supported by academic literature, and draw substantiated conclusions.`,
    keyPoints: [
      `Establish a strong, falsifiable thesis statement directly answering the prompt.`,
      `Contextualize foundational theories and recent empirical research.`,
      `Critically compare contrasting viewpoints rather than merely summarizing.`,
      `Demonstrate practical application and real-world implications.`,
    ],
    examples: [
      `Empirical case study illustrating the primary mechanism under standard conditions.`,
      `Comparative analysis contrasting historical precedents with current best practices.`,
      `Edge case or limitation highlighting boundary constraints of the methodology.`,
    ],
    structuredOutline: [
      {
        section: '1. Introduction & Problem Statement',
        goal: 'Hook the reader, provide necessary background context, and state thesis.',
        keyElements: ['Hook & Significance', 'Theoretical Context', 'Explicit Thesis Statement', 'Roadmap of Paper'],
        suggestedWordCount: '150 - 250 words',
      },
      {
        section: '2. Theoretical Framework & Core Evidence',
        goal: 'Explicate key models, definitions, and supporting empirical literature.',
        keyElements: ['Primary Concepts Defined', 'Key Studies Examined', 'Methodological Strengths'],
        suggestedWordCount: '400 - 600 words',
      },
      {
        section: '3. Critical Analysis & Counter-Perspectives',
        goal: 'Address alternative interpretations and defend the central thesis.',
        keyElements: ['Counter-Arguments Addressed', 'Nuanced Rebuttals', 'Synthesis of Trade-offs'],
        suggestedWordCount: '350 - 500 words',
      },
      {
        section: '4. Conclusion & Actionable Implications',
        goal: 'Summarize key takeaways and point toward future academic inquiry.',
        keyElements: ['Restatement of Thesis (evolved)', 'Summary of Findings', 'Broader Implications'],
        suggestedWordCount: '150 - 200 words',
      },
    ],
    commonMistakes: [
      'Writing a descriptive summary instead of an analytical argument.',
      'Failing to cite primary academic sources or relying on unsubstantiated claims.',
      'Leaving conclusions abrupt without tying back to the initial thesis statement.',
    ],
    recommendedNextSteps: [
      'Formulate your working thesis statement in 1-2 concise sentences.',
      'Gather 3-5 peer-reviewed journal articles supporting your primary sections.',
      'Draft the body paragraphs before refining the introduction and conclusion.',
    ],
  });
});

// ----------------------------------------------------
// 4. POST /api/rebalance-plan
// ----------------------------------------------------
app.post('/api/rebalance-plan', async (req: Request, res: Response) => {
  const { incompleteSessions, remainingDays } = req.body;

  if (!incompleteSessions || !Array.isArray(incompleteSessions) || incompleteSessions.length === 0) {
    return res.json({ redistributedSessions: [], advice: 'No overdue sessions need rebalancing.' });
  }

  const days = remainingDays && remainingDays.length > 0 ? remainingDays : [new Date().toISOString().split('T')[0]];

  // Evenly distribute incomplete sessions across remaining days
  const redistributedSessions = incompleteSessions.map((sess: any, index: number) => {
    const targetDay = days[index % days.length];
    return {
      sessionId: sess.id,
      newDate: targetDay,
      newTime: '17:00',
    };
  });

  return res.json({
    redistributedSessions,
    advice: `Successfully redistributed ${incompleteSessions.length} missed study session${
      incompleteSessions.length > 1 ? 's' : ''
    } smoothly across your remaining days to keep your mastery on schedule!`,
  });
});

// ----------------------------------------------------
// 5. POST /api/n8n-chat
// ----------------------------------------------------
app.post('/api/n8n-chat', async (req: Request, res: Response) => {
  const { message, sessionId, chatHistory, subjects, timetableSummary, webhookUrl } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // If user provided custom n8n webhook URL
  if (webhookUrl && typeof webhookUrl === 'string' && webhookUrl.startsWith('http')) {
    try {
      const n8nRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: sessionId || 'default-session',
          history: chatHistory || [],
          subjects: subjects || [],
          timetableSummary: timetableSummary || '',
          timestamp: new Date().toISOString(),
        }),
      });

      if (n8nRes.ok) {
        const data = await n8nRes.json().catch(() => null);
        if (data) {
          const reply = data.output || data.response || data.message || data.reply || (typeof data === 'string' ? data : JSON.stringify(data));
          return res.json({ reply });
        }
      }
    } catch (err: any) {
      console.warn('n8n webhook call failed, defaulting to built-in Gemini tutor:', err?.message || err);
    }
  }

  // Built-in Gemini Study Coach
  if (ai) {
    try {
      const historyContext = (chatHistory || [])
        .slice(-6)
        .map((m: any) => `${m.sender === 'user' ? 'Student' : 'Tutor'}: ${m.text}`)
        .join('\n');

      const subjectsContext = subjects && subjects.length > 0
        ? `Student Courses:\n${subjects.map((s: any) => `- ${s.name} (Exam: ${s.examDate}, ${s.difficulty})`).join('\n')}`
        : 'No specific courses registered.';

      const prompt = `You are "Student Learner AI Study Coach" — a supportive, evidence-based academic tutor and college mentor.
You specialize in active recall, spaced repetition, college exam preparation, prioritization, and assignment clarity.

${subjectsContext}

Timetable Context:
${timetableSummary || 'Student has an active timetable.'}

Recent Conversation:
${historyContext}

Student's new message: "${message}"

Guidelines:
- Provide actionable, clear, encouraging guidance.
- Break down complex concepts into simple analogies or step-by-step points.
- If asked about study strategy or exam countdowns, cite specific techniques (e.g., active recall, past exams, interleaving).
- Keep formatting clean using concise markdown bullet points and bold headers.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          temperature: 0.6,
        },
      });

      const reply = response.text || 'I am here to help you ace your college courses and study efficiently! What would you like to review?';
      return res.json({ reply });
    } catch (err: any) {
      console.warn('Gemini chat error, using fallback:', err?.message || err);
    }
  }

  // Fallback intelligent reply
  return res.json({
    reply: `Here is a high-yield recommendation for your studies:\n\n• **Active Recall:** Close your book and write down everything you remember about your key topics for 10 minutes.\n• **High-Yield Priority:** Tackle your hardest course first while your mental energy is at its highest.\n• **Interleaving:** Alternate between 45-minute focus intervals of different subjects to strengthen long-term memory retention.\n\nKeep pushing forward — consistency compounds quickly!`,
  });
});

// ----------------------------------------------------
// Frontend Mounting (Vite in dev, static in prod)
// ----------------------------------------------------
async function startServer() {
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Student Learner server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
