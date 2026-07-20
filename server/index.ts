import express from 'express';
import cors from 'cors';
import db from './db.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 静的ファイルの配信 (本番用)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// セッション結果保存 API
app.post('/api/sessions', (req, res) => {
  try {
    const {
      userId = 1,
      subject = 'typing',
      mode = 'english_words',
      score,
      totalQuestions,
      correctCount,
      accuracy,
      wpm,
      durationSeconds,
      details = []
    } = req.body;

    const insertSession = db.prepare(`
      INSERT INTO learning_sessions 
      (user_id, subject, mode, score, total_questions, correct_count, accuracy, wpm, duration_seconds)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertDetail = db.prepare(`
      INSERT INTO quiz_results 
      (session_id, question_text, user_answer, correct_answer, is_correct, response_time_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const runTx = db.transaction(() => {
      const info = insertSession.run(
        userId,
        subject,
        mode,
        score,
        totalQuestions,
        correctCount,
        accuracy,
        wpm ?? null,
        durationSeconds
      );
      const sessionId = info.lastInsertRowid;

      for (const d of details) {
        insertDetail.run(
          sessionId,
          d.questionText,
          d.userAnswer,
          d.correctAnswer,
          d.isCorrect ? 1 : 0,
          d.responseTimeMs
        );
      }
      return sessionId;
    });

    const sessionId = runTx();
    res.status(201).json({ success: true, sessionId });
  } catch (error) {
    console.error('Error saving session:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// 分析サマリー & 履歴取得 API
app.get('/api/analytics', (_req, res) => {
  try {
    const totalRow = db.prepare(`
      SELECT COUNT(*) as totalSessions, SUM(duration_seconds) as totalDurationSeconds, AVG(wpm) as avgWpm, AVG(accuracy) as avgAccuracy
      FROM learning_sessions WHERE user_id = 1
    `).get() as any;

    const recentSessions = db.prepare(`
      SELECT id, subject, mode, score, total_questions as totalQuestions, correct_count as correctCount, accuracy, wpm, duration_seconds as durationSeconds, created_at as createdAt
      FROM learning_sessions WHERE user_id = 1
      ORDER BY created_at DESC LIMIT 10
    `).all();

    res.json({
      totalSessions: totalRow.totalSessions || 0,
      totalDurationSeconds: totalRow.totalDurationSeconds || 0,
      avgWpm: totalRow.avgWpm ? Math.round(totalRow.avgWpm * 10) / 10 : 0,
      avgAccuracy: totalRow.avgAccuracy ? Math.round(totalRow.avgAccuracy * 10) / 10 : 0,
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// React Router SPAフォールバック
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
