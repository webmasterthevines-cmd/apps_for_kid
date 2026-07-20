# 学びのひろば (Kids Learning Portal) 🎓

Raspberry Pi 4 上で動作する、小学生向け学習Webアプリケーションです。  
直感的なUIとサクサク動く動作環境で、「えいごタイピング」「さんすうドリル」「えいごクイズ & リスニング」を楽しく学びながら、学習結果をSQLiteデータベースに記録・分析できます。

---

## 🌟 主な機能と特徴

### 1. 🎮 3つの学習コンテンツ (各10問構成)
* **えいごタイピング (Typing Game)**
  * 初級〜中級レベル（英検5級〜4級相当 / 全123語・英文）の英語タイピング。
  * リアルタイム WPM（打鍵速度）、正確性 (%) 計測機能。
  * ブラウザ標準 **Web Speech API** による英語ネィティブ音声発声つき。
* **さんすうドリル (Math Drill)**
  * ユーザーが出題形式を自由に選択可能：
    1. **くりあがり たしざん**: 2〜4桁の繰り上がり足し算
    2. **くりさがり ひきざん**: 2〜4桁の繰り下がり引き算
    3. **かけざん (12×12)**: 1×1 〜 12×12 の拡大九九
    4. **えらぶ かけざん**: 指定数になる掛け算の4択問題
    5. **あなうめ・ぎゃくさん**: `x × 3 = 6` などの逆算問題
    6. **ぜんぶミックス**: 全形式からのランダム出題
  * 画面上のタッチパネルテンキー ＆ 物理キーボード入力の両方に対応。
* **えいごクイズ & リスニング (English Quiz & Listening)**
  * **Direct English Immersion**: 日本語訳を介さず「英語のまま理解する」全編英語表記仕様。
  * 音声を聞いて正しい英語を選ぶ 4択クイズ、リスニング・スペル入力モード搭載。

### 2. 💡 学習効果を高める工夫
* **スキップ＆学習アシスト機能**:
  * わからない問題は「スキップ」ボタンでスキップ可能。
  * スキップ時には**画面上に正解（および英語音声）を1.8秒間明示**してから次の問題へ進むため、次回への学習の機会を逃しません。
* **シングルユーザー＆軽量設計**:
  * Raspberry Pi 4 のスペック制限に配慮した高速・軽量レスポンシブデザイン。
  * アカウント切替やログインの手間なくすぐに学習をスタートできます。

### 3. 📊 データ保存 ＆ 学習分析ダッシュボード
* **SQLite3 データベース永続化**:
  * ブラウザのLocalStorage非依存。学習結果（スコア、正答率、WPM、所要時間、問題ごとの正誤ログ）をサーバー上の `kids_learning.db` に保存。
* **学習分析ダッシュボード**:
  * 累計プレイ回数、総学習時間、平均WPM、平均正確性、および直近のセッション履歴を一覧表示。

---

## 🛠️ 技術スタック

* **フロントエンド**: React 19, TypeScript, Vite 6, Tailwind CSS v4, Lucide-React
* **バックエンド**: Node.js (v22/v24 LTS), Express 4, `better-sqlite3`
* **音声エンジン**: Web Speech API (SpeechSynthesis)
* **データベース**: SQLite3 (`kids_learning.db`)
* **ターゲットハードウェア**: Raspberry Pi 4 Model B (Raspberry Pi OS 64-bit)

---

## 🚀 ローカル開発・起動手順

### 必要な環境
* Node.js v22.0.0 以上
* npm v10.0.0 以上

### インストールと起動

```bash
# リポジトリのクローン
git clone https://github.com/webmasterthevines-cmd/apps_for_kid.git
cd apps_for_kid

# パッケージのインストール
npm install --cache ./scratch/.npm-cache

# フロントエンドのビルド
npm run build

# Webサーバーおよびフロントエンドの同時起動
npm run app
```

ブラウザで `http://localhost:5173` または `http://localhost:3000` にアクセスしてください。

---

## 🍓 Raspberry Pi 4 デプロイ & 自動起動手順

詳細な構築・自動起動設定は [`docs/raspberry_pi_deployment.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/raspberry_pi_deployment.md) をご覧ください。

### systemd サービスの設定略順

1. Raspberry Pi 上でコードを取得しビルド:
   ```bash
   git pull origin main
   npm run build
   ```
2. サービスファイル `/etc/systemd/system/apps_for_kid.service` の作成
3. サービスの有効化と起動:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable apps_for_kid.service
   sudo systemctl start apps_for_kid.service
   ```
4. 同じローカルネットワーク（Wi-Fi/LAN）内のPCやタブレットのブラウザから `http://<Raspberry-PiのIPアドレス>:3000` または `http://raspberrypi.local:3000` でアクセス可能。

---

## 📁 ドキュメント一覧

* [`docs/system_requirements.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/system_requirements.md): システム要求仕様書（実行環境・技術スタック）
* [`docs/functional_requirements.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/functional_requirements.md): 機能要求仕様書（コンテンツ・学習分析要件）
* [`docs/basic_design.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/basic_design.md): 基本設計書（アーキテクチャ・モジュール構造・共通ロジック）
* [`docs/database_schema.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/database_schema.md): データベース設計書（SQLite DDL・テーブル構造）
* [`docs/api_specifications.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/api_specifications.md): REST API 仕様書
* [`docs/raspberry_pi_deployment.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/raspberry_pi_deployment.md): Raspberry Pi 4 環境構築・デプロイ手順書

---

## 📝 ライセンス
MIT License
