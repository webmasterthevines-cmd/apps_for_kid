# Raspberry Pi 4 デプロイ・環境構築手順書

## 1. 概要
本ドキュメントは、作成した子ども向け学習Webアプリケーション（Vite + React + Node.js Express + SQLite3）を Raspberry Pi 4 上にデプロイし、ローカルネットワーク（LAN）内で常時稼働（自動起動）させるための具体手順を解説する。

---

## 2. 前提条件・必要環境
* **ハードウェア**: Raspberry Pi 4 Model B (RAM 2GB / 4GB / 8GB)
* **OS**: Raspberry Pi OS (64-bit) (Bookworm / Bullseye)
* **ネットワーク**: Wi-Fi または Ethernet 接続（ローカルIP取得済み）
* **アクセス権限**: `sudo` 権限を持つユーザー (例: `pi`)

---

## 3. ステップ1: 依存環境のインストール (Node.js & Git)

Raspberry Pi のターミナルで以下を実行し、最新の Node.js (LTS v22/v24) と Git をセットアップする。

```bash
# パッケージリストの更新
sudo apt update && sudo apt upgrade -y

# Node.js セットアップ (NodeSource LTS スクリプトを利用)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs git build-essential python3

# バージョン確認 (Node.js v22+ / npm v10+ であることを確認)
node -v
npm -v
```

---

## 4. ステップ2: アプリケーションコードの配置とビルド

```bash
# アプリケーション配置先ディレクトリを作成して移動
mkdir -p /home/pi/projects
cd /home/pi/projects

# コードの配置 (Git クローン または ファイル転送)
# git clone <repository-url> apps_for_kid
cd apps_for_kid

# 依存パッケージのインストール
npm install --cache ./scratch/.npm-cache

# フロントエンドのプロダクションビルド (dist/ フォルダを作成)
npm run build
```

---

## 5. ステップ3: 動作確認テスト

サービス化の前に、手動で Express サーバーを起動しアクセス確認を行う。

```bash
# Express サーバー起動 (ポート 3000)
npm run server
```

* **動作確認**:
  * Raspberry Pi 上のブラウザで `http://localhost:3000` を開く。
  * 同一Wi-Fi / LAN内のPCやタブレットから `http://<Raspberry-PiのIPアドレス>:3000` を開く。

※ IPアドレスの確認コマンド: `hostname -I`

---

## 6. ステップ4: systemd による自動起動・常時稼働設定

Raspberry Pi 起動時に自動で Web サーバーが立ち上がるよう `systemd` サービスを設定する。

### 6.1 サービスファイルの作成

`/etc/systemd/system/apps_for_kid.service` を新規作成する。

```bash
sudo nano /etc/systemd/system/apps_for_kid.service
```

以下の内容を記述して保存する（ユーザー名 `pi` やパスは環境に合わせて調整）。

```ini
[Unit]
Description=Kids Learning Web App Server
After=network.target

[Service]
Type=simple
User=pi
WorkingDirectory=/home/pi/projects/apps_for_kid
ExecStart=/usr/bin/npm run server
Restart=on-failure
RestartSec=5s
Environment=NODE_ENV=production PORT=3000

[Install]
WantedBy=multi-user.target
```

### 6.2 サービスの有効化と起動

```bash
# systemd 設定の再読み込み
sudo systemctl daemon-reload

# サービスの有効化（ラズパイ起動時に自動実行）
sudo systemctl enable apps_for_kid.service

# サービスを今すぐ起動
sudo systemctl start apps_for_kid.service

# ステータス確認 (active (running) であれば正常)
sudo systemctl status apps_for_kid.service
```

---

## 7. ステップ5: データの自動永続化とバックアップ

SQLite データベースファイルは `/home/pi/projects/apps_for_kid/kids_learning.db` に生成される。

### 7.1 定期バックアップ設定 (cron)

学習履歴のバックアップを週1回自動作成する場合:

```bash
crontab -e
```

以下の行を追加（毎週日曜深夜3時に `kids_learning_backup.db` へコピー）:

```cron
0 3 * * 0 cp /home/pi/projects/apps_for_kid/kids_learning.db /home/pi/projects/apps_for_kid/kids_learning_backup.db
```

---

## 8. トラブルシューティング

| 症状 | 原因と対策 |
| :--- | :--- |
| 他の端末からアクセスできない | ポート 3000 がファイアウォールでブロックされている可能性。<br>`sudo ufw allow 3000/tcp` を実行。 |
| DB書き込みエラー | フォルダのパーミッション不足。<br>`chmod -R 755 /home/pi/projects/apps_for_kid` を確認。 |
| サービスが起動しない | ログを確認: `journalctl -u apps_for_kid.service -n 50 --no-pager` |
