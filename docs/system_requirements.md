# システム要求仕様書（実行環境・技術スタック定義）

## 1. 概要
本ドキュメントは、小学生中学年（3〜4年生）を対象とした学習Webアプリケーション（算数・英語・タイピング）の基盤となる実行環境および技術スタックの要求仕様書である。
詳細な機能要件およびデータ分析仕様については [`docs/functional_requirements.md`](file:///Users/celica/devp/projects/apps_for_kid/docs/functional_requirements.md) にて定義する。

---

## 2. 実行環境要件（Hardware & OS）
* **ターゲットハードウェア**: Raspberry Pi 4 Model B (RAM 2GB / 4GB / 8GB)
* **OS環境**: Raspberry Pi OS (64-bit) / Debian Linux ベース
* **ネットワーク構成**: ローカルネットワーク（LAN）内でのWebサーバー配信、またはスタンドアロン接続
* **システム運用方針**:
  * systemd / PM2 / Docker（必要に応じて）によるプロセス自動起動および常時稼働
  * リソース消費を極力抑えた軽量な配信構成

---

## 3. 最新技術スタック調査結果 (2026年7月現在)

| 区分 | 技術要素 | 最新推奨バージョン | 選定理由・特徴 |
| :--- | :--- | :--- | :--- |
| **Runtime (JS/TS)** | Node.js | v24.x (Active LTS) / v26.x (Current) | Raspberry Pi上での安定稼働および最新Web APIサポートを両立。 |
| **Language (Backend/Tool)** | Python | v3.13.x / v3.14.x | 高いライブラリ互換性と安定性を誇る。Webサーバー（FastAPI/Flask）構成時に活用可能。 |
| **Language (Frontend)** | TypeScript | v5.x / v7.x | 静的型定義による保守性の向上およびコンパイルパフォーマンスの最適化。 |
| **Frontend Framework** | React | v19.x | コンポーネント指向による柔軟な画面構築とアクセシビリティ対応。 |
| **Styling (CSS)** | Tailwind CSS | v4.x | ユーティリティファーストによるクラス命名統一、高保守性・拡張性、Vite+Reactとの優れた親和性。 |
| **Database (Data Storage)** | SQLite | v3.x | サーバー側ファイルベースDB。軽量でRaspberry Piのメモリ消費が少なく、バックアップ・永続化が容易。 |
| **Build Tool** | Vite | v6.x | 超高速なHMR（Hot Module Replacement）および軽量なプロダクションビルド。 |

---

## 4. Webサーバー・配信構成案

保守性およびRaspberry Pi 4の負荷特性に応じて、以下のいずれかの構成を採用する。

### 構成案 A: Node.js (Express / Fastify) スタンドアロン構成 【推奨】
* **フロントエンド**: Vite + React + TypeScript でビルドされた静的アセット (`dist/`)
* **バックエンド / Webサーバー**: Node.js (Express または Fastify)
* **データベース**: SQLite3 (better-sqlite3 または prisma/drizzle ORM)
* **特徴**:
  * フロントエンド・バックエンドの言語を TypeScript に統一可能で保守性が極めて高い。
  * SQLiteによる永続化API（学習履歴・スコア・バッジ獲得状態）を容易に構築可能。

### 構成案 B: Python (FastAPI + Uvicorn / Flask) 構成
* **フロントエンド**: Vite + React + TypeScript でビルドされた静的アセット (`dist/`)
* **バックエンド / Webサーバー**: Python 3.13+ (FastAPI + Uvicorn)
* **特徴**:
  * Python環境との親和性が高く、機械学習や音声処理・画像処理などの学習コンテンツ拡張に強み。

---

## 5. 非機能要件・設計方針

1. **シングルユーザー前提のシンプル設計**:
   * アプリの実行ユーザーは基本的に1人のみ。複雑な認証・アカウント切り替え処理を排除し、実装速度を最優先する。
2. **実装速度の重視（Speed over Richness）**:
   * 過剰に重いアニメーションやグラフィック装飾は避け、迅速にMVP（プロトタイプ）を構築・検証することを最優先とする。
3. **軽量UI & パフォーマンス（Raspberry Pi 4最適化）**:
   * Raspberry Pi 4のスペック制約を考慮し、動作の重さで子どもの学習意欲を削がないよう、レスポンスが速く軽快なUI（軽量アセット・レンダリング最適化）を目指す。
4. **保守性 (Maintainability)**:
   * 型安全性（TypeScript）によるバグの未然防止およびコードベースのシンプル維持。
5. **可用性・自動再起動 (Reliability)**:
   * systemd または PM2 によるWebサーバープロセスの自動監視と起動保証。

---

## 6. 今後の開発フェーズ
1. **フェーズ1 (完了)**: 実行環境・技術スタック要求仕様書の作成 (`docs/system_requirements.md`)
2. **フェーズ2**: アプリケーション機能要件・UI/UX仕様書の策定
3. **フェーズ3**: プロジェクト基盤（Vite + React + TS, Webサーバー）のセットアップ
4. **フェーズ4**: 機能開発およびRaspberry Pi 4での実機動作検証
