# AIコーチ付きTODOアプリ

![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Node.js](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)

## 📖 概要

タスク管理にAIアドバイス機能を統合したクロスプラットフォームアプリケーションです。学習目的で作成されており、モダンな技術スタックとクリーンアーキテクチャの実践例として設計されています。

### 主な機能

- ✅ **タスク管理**: CRUD操作、進捗管理、完了条件設定
- 🤖 **AI相談機能**: OpenAI APIを使用したタスクアドバイス
- 📱 **クロスプラットフォーム**: iOS・Android・Web対応
- 🔐 **認証機能**: JWT認証によるセキュアなログイン
- 📊 **リアルタイム同期**: タスクデータの即座反映

## 🏗️ 技術スタック

### フロントエンド
- **React Native** + **Expo** - クロスプラットフォーム開発
- **TypeScript** - 型安全な開発
- **React Navigation** - ナビゲーション管理
- **Zustand** - 軽量状態管理
- **React Native Paper** - Material Design UI

### バックエンド
- **Hono** - 高速TypeScriptフレームワーク
- **PostgreSQL** - リレーショナルデータベース
- **Prisma** - 型安全なORM
- **Docker** - コンテナ化
- **OpenAI API** - AI機能

### アーキテクチャ
- **Clean Architecture** - 保守性・拡張性を重視した設計
- **依存性注入** - テスタビリティの確保
- **API First** - フロントエンドとバックエンドの疎結合

## 🚀 セットアップ手順

### 前提条件

- **Node.js** v18以上
- **Docker** と **Docker Compose**
- **Git**
- **OpenAI API Key** (AI機能使用時)

### 1. リポジトリのクローン

```bash
git clone https://github.com/your-username/ai-coach-todo-app.git
cd ai-coach-todo-app
```

### 2. バックエンドの起動

```bash
# バックエンドディレクトリに移動
cd backend

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してOpenAI API Keyなどを設定

# Dockerでデータベースとアプリケーションを起動
docker compose up -d

# データベースマイグレーション（初回のみ）
npx prisma migrate deploy
npx prisma db seed
```

**APIサーバー**: http://localhost:3000

### 3. フロントエンドの起動

```bash
# 新しいターミナルでフロントエンドディレクトリに移動
cd frontend

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start
```

**Expo開発サーバー**: http://localhost:19006

### 4. 動作確認

#### テストユーザー情報
- **Email**: `test@example.com`
- **Password**: `password123`

#### API確認
```bash
# ヘルスチェック
curl http://localhost:3000/health

# ログインテスト
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📁 プロジェクト構成

```
ai-coach-todo-app/
├── backend/                 # バックエンドアプリケーション
│   ├── src/
│   │   ├── entities/       # ドメインモデル
│   │   ├── repositories/   # データアクセス層
│   │   ├── usecases/       # ビジネスロジック層
│   │   ├── controllers/    # HTTP処理層
│   │   └── middleware/     # ミドルウェア
│   ├── prisma/            # データベーススキーマ
│   ├── docker-compose.yml # Docker設定
│   └── README.md          # バックエンド詳細ドキュメント
│
├── frontend/               # フロントエンドアプリケーション
│   ├── src/
│   │   ├── screens/       # 画面コンポーネント
│   │   ├── stores/        # 状態管理
│   │   ├── services/      # API通信
│   │   └── types/         # 型定義
│   └── README.md          # フロントエンド詳細ドキュメント
│
└── README.md              # このファイル
```

## 🎯 学習ポイント

### バックエンド開発
- **Clean Architecture**の実践的な実装方法
- **TypeScript**による型安全なAPI開発
- **Prisma ORM**を使用したデータベース操作
- **Docker**によるコンテナ化とマイクロサービス設計

### フロントエンド開発
- **React Native**によるクロスプラットフォーム開発
- **TypeScript**によるコンポーネント開発
- **状態管理**ライブラリの選択と実装
- **Navigation**パターンの実装

### 設計思想
- **責任分離**による保守性の向上
- **依存関係逆転**によるテスタビリティの確保
- **API First**による疎結合設計
- **エラーハンドリング**の統一的な実装

## 🔧 開発ツール

### 推奨エディタ設定
- **VS Code** + **TypeScript**拡張
- **Prettier** - コード整形
- **ESLint** - 静的解析
- **Prisma** - データベースGUI

### デバッグツール
- **Prisma Studio** - データベース確認 (http://localhost:5555)
- **React Native Debugger** - フロントエンドデバッグ
- **Postman** / **curl** - API動作確認

## 📚 参考資料

### アーキテクチャ
- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Dependency Injection Pattern](https://en.wikipedia.org/wiki/Dependency_injection)

### 技術ドキュメント
- [Hono Documentation](https://hono.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)

## 📝 ライセンス

このプロジェクトは学習目的で作成されており、MITライセンスの下で公開されています。

## 🤝 コントリビューション

学習用プロジェクトのため、Issue・Pull Requestは歓迎しています。特に以下の観点での改善提案をお待ちしています：

- アーキテクチャの改善
- コードの可読性向上
- テストカバレッジの改善
- ドキュメントの充実

---

**Created for learning purposes - TypeScript Clean Architecture with React Native**
