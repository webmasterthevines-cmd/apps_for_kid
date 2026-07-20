# REST API 仕様書 (Backend Web Server)

## 1. 概要
本仕様書は、React フロントエンドと Node.js (Express/Fastify) バックエンドWebサーバー間でデータを送受信するための RESTful API 仕様を定義する。

---

## 2. ベースURL & 通信フォーマット
* **Base URL**: `http://<raspberry-pi-ip>:3000/api`
* **データフォーマット**: JSON (`Content-Type: application/json`)

---

## 3. エンドポイント一覧

| メソッド | パス | 説明 |
| :--- | :--- | :--- |
| **GET** | `/users/me` | 現在選択されているユーザープロファイル取得 |
| **POST** | `/sessions` | 学習セッション結果の保存（学習終了時） |
| **GET** | `/sessions/history` | 過去の学習履歴・スコア取得 |
| **GET** | `/analytics/summary` | 学習分析要約（テーマ別正答率・得意/苦手・WPM推移） |
| **GET** | `/badges` | ユーザーの獲得バッジ一覧取得 |

---

## 4. エンドポイント詳細仕様

### 4.1 学習セッションの保存 (`POST /api/sessions`)

* **Request Body**:
```json
{
  "userId": 1,
  "subject": "typing",
  "mode": "english_words",
  "score": 450,
  "totalQuestions": 10,
  "correctCount": 9,
  "accuracy": 90.0,
  "wpm": 35.5,
  "durationSeconds": 60,
  "details": [
    {
      "questionText": "apple",
      "userAnswer": "apple",
      "correctAnswer": "apple",
      "isCorrect": 1,
      "responseTimeMs": 1200
    },
    {
      "questionText": "banana",
      "userAnswer": "banan",
      "correctAnswer": "banana",
      "isCorrect": 0,
      "responseTimeMs": 2500
    }
  ]
}
```

* **Response (201 Created)**:
```json
{
  "success": true,
  "sessionId": 124,
  "newBadges": [
    {
      "code": "typing_speed_30",
      "name": "タイピングスプリンター",
      "description": "WPM 30以上を達成！"
    }
  ]
}
```

---

### 4.2 学習分析サマリーの取得 (`GET /api/analytics/summary?userId=1`)

* **Response (200 OK)**:
```json
{
  "userId": 1,
  "totalSessions": 25,
  "totalDurationMinutes": 120,
  "streakDays": 4,
  "subjects": {
    "math": {
      "sessionsCount": 10,
      "avgAccuracy": 85.5,
      "strongTopics": ["わり算"],
      "weakTopics": ["単位換算"]
    },
    "typing": {
      "sessionsCount": 15,
      "avgWpm": 32.4,
      "maxWpm": 42.0,
      "avgAccuracy": 92.0
    }
  },
  "weeklyProgress": [
    { "date": "2026-07-14", "score": 300, "wpm": 28 },
    { "date": "2026-07-15", "score": 450, "wpm": 32 }
  ]
}
```
