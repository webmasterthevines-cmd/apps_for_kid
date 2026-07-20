# データベース設計書 (SQLite Schema)

## 1. 概要
本仕様書は、小学生中学年向け学習Webアプリにおけるデータ永続化のための SQLite データベース構造（テーブル定義、カラム、型、制約、インデックス）を定義する。

---

## 2. ER図（概念データモデル）

```
 +------------------+       1:N       +----------------------+
 |      users       | <-------------> |  learning_sessions   |
 +------------------+                 +----------------------+
          |                                      |
          | 1:N                                  | 1:N
          v                                      v
 +------------------+                 +----------------------+
 |   user_badges    |                 |     quiz_results     |
 +------------------+                 +----------------------+
```

---

## 3. テーブル定義詳細

### 3.1 `users` (ユーザー情報)
| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ユーザーID |
| `name` | TEXT | NOT NULL | ユーザー表示名（例: "たろう"） |
| `grade` | INTEGER | NOT NULL DEFAULT 3 | 学年（3または4） |
| `created_at` | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 登録日時 |

### 3.2 `learning_sessions` (学習セッション)
学習1回（算数/英語/タイピングドリル1プレイ）ごとの集計結果。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | セッションID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY (`users.id`) | ユーザーID |
| `subject` | TEXT | NOT NULL | 学習テーマ (`math`, `english`, `typing`) |
| `mode` | TEXT | NOT NULL | 詳細モード (`division`, `words`, `sentences` 等) |
| `score` | INTEGER | NOT NULL | 獲得スコア/点数 |
| `total_questions` | INTEGER | NOT NULL | 総出題数 |
| `correct_count` | INTEGER | NOT NULL | 正解数 |
| `accuracy` | REAL | NOT NULL | 正答率 (%) |
| `wpm` | REAL | NULL | タイピングWPM（タイピング時のみ） |
| `duration_seconds` | INTEGER | NOT NULL | 所要時間（秒） |
| `created_at` | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 学習日時 |

### 3.3 `quiz_results` (問題ごとの詳細ログ)
弱点分析・誤答分析のための詳細ログ。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ログID |
| `session_id` | INTEGER | NOT NULL, FOREIGN KEY (`learning_sessions.id`) | セッションID |
| `question_text` | TEXT | NOT NULL | 出題内容 |
| `user_answer` | TEXT | NOT NULL | ユーザーの回答 |
| `correct_answer` | TEXT | NOT NULL | 正解内容 |
| `is_correct` | INTEGER | NOT NULL | 正誤（1: 正解, 0: 不正解） |
| `response_time_ms` | INTEGER | NOT NULL | 解答所要時間（ミリ秒） |

### 3.4 `user_badges` (獲得バッジ)
モチベーション向上のためのトロフィー・バッジ獲得履歴。

| カラム名 | データ型 | 制約 | 説明 |
| :--- | :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ID |
| `user_id` | INTEGER | NOT NULL, FOREIGN KEY (`users.id`) | ユーザーID |
| `badge_code` | TEXT | NOT NULL | バッジ識別コード (例: `typing_master_1`, `math_streak_7`) |
| `unlocked_at` | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 獲得日時 |

---

## 4. DDL (SQL作成スクリプト)

```sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    grade INTEGER NOT NULL DEFAULT 3,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS learning_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subject TEXT NOT NULL,
    mode TEXT NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    correct_count INTEGER NOT NULL,
    accuracy REAL NOT NULL,
    wpm REAL,
    duration_seconds INTEGER NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    user_answer TEXT NOT NULL,
    correct_answer TEXT NOT NULL,
    is_correct INTEGER NOT NULL,
    response_time_ms INTEGER NOT NULL,
    FOREIGN KEY (session_id) REFERENCES learning_sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS user_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    badge_code TEXT NOT NULL,
    unlocked_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックス作成（高速な分析クエリ用）
CREATE INDEX IF NOT EXISTS idx_sessions_user_subject ON learning_sessions(user_id, subject);
CREATE INDEX IF NOT EXISTS idx_sessions_created ON learning_sessions(created_at);
```
