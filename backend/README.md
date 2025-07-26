# バックエンド - Clean Architecture実装

![Clean Architecture](https://img.shields.io/badge/Architecture-Clean-brightgreen)
![Hono](https://img.shields.io/badge/Framework-Hono-orange)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue)

## 🎯 アーキテクチャ概要

このバックエンドは**Clean Architecture**（クリーンアーキテクチャ）を採用し、保守性・拡張性・テスタビリティを重視した設計になっています。

### Clean Architectureとは

Clean Architectureは、Uncle Bob（Robert C. Martin）が提唱した、ソフトウェアの関心事を同心円状に分離する設計手法です。

#### 基本原則

1. **依存関係逆転の原則**: 内側の層は外側の層を知らない
2. **単一責任の原則**: 各層は明確に定義された責任を持つ
3. **テスト容易性**: 各層を独立してテストできる
4. **フレームワーク独立性**: 特定の技術に依存しない設計

#### なぜClean Architectureを採用したか

```typescript
// ❌ 従来の3層アーキテクチャの問題
Controller → Service → Repository
     ↓         ↓         ↓
   HTTP    Business   Database
  (外部)   Logic     (外部)

// ✅ Clean Architectureの解決策
Controllers → Usecases → Entities
     ↓           ↓
Repositories → Entities
    ↓
Database
(外部)
```

**問題点の解決**:
- **ビジネスロジック**が外部技術（フレームワーク、DB）に依存しない
- **テスト**時に外部依存を簡単にモック化できる
- **技術変更**（例：Express → Hono）の影響範囲を最小化

### 依存関係の方向

```
📦 External Interfaces (HTTP, Database)
      ↑
📦 Controllers (HTTP処理)
      ↑
📦 Usecases (ビジネスロジック)
      ↑
📦 Entities (ドメインモデル)
      ↑
📦 Repositories (データアクセス抽象化)
```

**重要**: 矢印は**依存関係の方向**を示し、内側の層は外側の層を知りません。

## 🏗️ プロジェクト構造

### レイヤー構成

```
src/
├── entities/          # 📦 Entities層（最内層）
│   ├── User.ts        # ユーザードメインモデル
│   ├── Task.ts        # タスクドメインモデル
│   ├── AIComment.ts   # AI相談ドメインモデル
│   └── Prompt.ts      # プロンプトドメインモデル
│
├── repositories/      # 📦 Repositories層（データアクセス）
│   ├── UserRepository.ts        # ユーザーデータアクセス
│   ├── TaskRepository.ts        # タスクデータアクセス
│   ├── AICommentRepository.ts   # AI相談データアクセス
│   ├── AICoachRepository.ts     # AI API通信
│   └── PromptRepository.ts      # プロンプトデータアクセス
│
├── usecases/          # 📦 Usecases層（ビジネスロジック）
│   ├── AuthUsecase.ts           # 認証ビジネスロジック
│   ├── TaskUsecase.ts           # タスクビジネスロジック
│   └── AICoachUsecase.ts        # AI相談ビジネスロジック
│
├── controllers/       # 📦 Controllers層（HTTP処理）
│   ├── AuthController.ts        # 認証HTTP処理
│   ├── TaskController.ts        # タスクHTTP処理
│   └── AIController.ts          # AI相談HTTP処理
│
├── middleware/        # 📦 Infrastructure（横断的関心事）
│   └── auth.ts        # JWT認証ミドルウェア
│
└── index.ts          # 🔧 依存性注入とアプリケーション起動
```

### 各層の責務

| 層 | 責務 | 依存先 | 例 |
|---|---|---|---|
| **Entities** | ドメインモデル・ビジネスルール | なし | 型定義、バリデーション |
| **Repositories** | データアクセス抽象化 | Entities | DB操作、API通信 |
| **Usecases** | ビジネスロジック | Entities, Repositories | 認証処理、タスク管理 |
| **Controllers** | HTTP処理 | Usecases | リクエスト/レスポンス変換 |
| **Infrastructure** | 外部技術連携 | 全層 | DB、フレームワーク |

## 🔧 技術構成

### 主要ライブラリ

```json
{
  "dependencies": {
    "hono": "^4.0.0",           // 高速TypeScriptフレームワーク
    "prisma": "^5.0.0",         // 型安全なORM
    "bcryptjs": "^2.4.3",       // パスワードハッシュ化
    "jsonwebtoken": "^9.0.0",   // JWT認証
    "openai": "^4.0.0",         // OpenAI API
    "zod": "^3.22.0"            // スキーマバリデーション
  }
}
```

### データベース設計

```sql
-- ユーザーテーブル
CREATE TABLE User (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  passwordHash VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- タスクテーブル
CREATE TABLE Task (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES User(id),
  title VARCHAR(100) NOT NULL,
  progress INTEGER DEFAULT 0,
  status INTEGER DEFAULT 0,
  dueDate TIMESTAMP,
  notes TEXT,
  completionCriteria TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI相談テーブル
CREATE TABLE AiComment (
  id SERIAL PRIMARY KEY,
  taskId INTEGER REFERENCES Task(id),
  userInput TEXT NOT NULL,
  aiResponse TEXT NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API設計

#### RESTful API原則に基づく設計

```typescript
// エンドポイント設計例
GET    /api/tasks           # タスク一覧取得
POST   /api/tasks           # タスク作成
GET    /api/tasks/:id       # 特定タスク取得
PUT    /api/tasks/:id       # タスク更新
DELETE /api/tasks/:id       # タスク削除
POST   /api/tasks/:id/consult # AI相談
```

## 📚 開発の流れ（内側から外側へ）

### Step 1: Entities（エンティティ）層

**なぜ最初に実装するか**: ビジネスの核となるドメインモデルを最初に定義することで、他の全ての層の基盤を作ります。

#### 実装例

```typescript
// src/entities/Task.ts
export interface Task {
  id: number;
  userId: number;
  title: string;           // 必須：タスクタイトル（100文字以内）
  progress: number;        // 0-100の進捗率
  status: TaskStatus;      // 0:未完了, 1:完了, 2:削除済み
  dueDate?: Date;         // 完了予定日
  notes?: string;         // 備考
  completionCriteria?: string; // 完了条件
  createdAt: Date;
  updatedAt: Date;
}

export enum TaskStatus {
  INCOMPLETE = 0,
  COMPLETED = 1,
  DELETED = 2
}

// ビジネスルールの例
export interface CreateTaskRequest {
  title: string;
  dueDate?: string;
  notes?: string;
  completionCriteria?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  progress?: number;
  status?: TaskStatus;
  dueDate?: string;
  notes?: string;
  completionCriteria?: string;
}
```

**学習ポイント**:
- **ドメイン駆動設計**: ビジネスロジックを型で表現
- **不変性**: データの整合性を保つ
- **バリデーション**: ビジネスルールを型レベルで制約

### Step 2: Repositories（リポジトリ）層

**なぜこの順序か**: Usecaseがデータアクセスを抽象化する必要があるため、インターフェースを先に定義します。

#### インターフェース定義

```typescript
// src/repositories/TaskRepository.ts
export interface ITaskRepository {
  findById(id: number): Promise<Task | null>;
  findByUserId(userId: number): Promise<Task[]>;
  create(userId: number, data: CreateTaskRequest): Promise<Task>;
  update(id: number, data: UpdateTaskRequest): Promise<Task>;
  delete(id: number): Promise<void>;
}
```

#### 実装

```typescript
export class TaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: number): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id }
    });
    return task;
  }

  async create(userId: number, data: CreateTaskRequest): Promise<Task> {
    return await this.prisma.task.create({
      data: {
        userId,
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        notes: data.notes,
        completionCriteria: data.completionCriteria,
        progress: 0,
        status: TaskStatus.INCOMPLETE
      }
    });
  }
}
```

**学習ポイント**:
- **抽象化**: インターフェースで依存関係を逆転
- **データマッピング**: DBモデルとドメインモデルの変換
- **エラーハンドリング**: データアクセス層での例外処理

### Step 3: Usecases（ユースケース）層

**なぜこの順序か**: アプリケーションの核となる動作を定義し、外部の変更に影響されないビジネスロジックを実装します。

```typescript
// src/usecases/TaskUsecase.ts
export class TaskUsecase {
  constructor(private taskRepository: ITaskRepository) {}

  async createTask(userId: number, taskData: CreateTaskRequest): Promise<Task> {
    // ビジネスルールのバリデーション
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('タスクタイトルは必須です。');
    }

    if (taskData.title.length > 100) {
      throw new Error('タスクタイトルは100文字以内で入力してください。');
    }

    if (taskData.dueDate) {
      const dueDate = new Date(taskData.dueDate);
      if (isNaN(dueDate.getTime())) {
        throw new Error('有効な完了予定日を入力してください。');
      }
    }

    // リポジトリを通じてデータ保存
    return await this.taskRepository.create(userId, taskData);
  }

  async updateTaskProgress(taskId: number, userId: number, progress: number): Promise<Task> {
    // 権限チェック
    const task = await this.taskRepository.findById(taskId);
    if (!task || task.userId !== userId) {
      throw new Error('タスクが見つかりません。');
    }

    // ビジネスルール適用
    if (progress < 0 || progress > 100) {
      throw new Error('進捗は0から100の範囲で入力してください。');
    }

    // 進捗100%で自動完了
    const status = progress === 100 ? TaskStatus.COMPLETED : TaskStatus.INCOMPLETE;

    return await this.taskRepository.update(taskId, { progress, status });
  }
}
```

**学習ポイント**:
- **ビジネスロジック集約**: 全てのビジネスルールをこの層に集約
- **権限制御**: ユーザーごとのデータアクセス制御
- **トランザクション**: 複数の操作を一貫性を保って実行

### Step 4: Controllers（コントローラー）層

**なぜこの順序か**: HTTP リクエストを受け取り、適切なUsecaseに処理を委譲するインターフェース層です。

```typescript
// src/controllers/TaskController.ts
export class TaskController {
  constructor(private taskUsecase: TaskUsecase) {}

  async createTask(c: Context) {
    try {
      // 認証ユーザー情報取得
      const user = c.get('user');
      
      // リクエストボディ取得・バリデーション
      const body = await c.req.json() as CreateTaskRequest;
      
      // Usecaseに処理委譲
      const task = await this.taskUsecase.createTask(user.id, body);
      
      // レスポンス返却
      return c.json({ task }, 201);
    } catch (error) {
      console.error('Create Task Error:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'タスクの作成に失敗しました。' 
      }, 400);
    }
  }

  async updateTask(c: Context) {
    try {
      const user = c.get('user');
      const taskId = parseInt(c.req.param('id'));
      const updates = await c.req.json() as UpdateTaskRequest;

      if (isNaN(taskId)) {
        return c.json({ error: '無効なタスクIDです。' }, 400);
      }

      const task = await this.taskUsecase.updateTask(taskId, user.id, updates);
      return c.json({ task });
    } catch (error) {
      console.error('Update Task Error:', error);
      return c.json({ 
        error: error instanceof Error ? error.message : 'タスクの更新に失敗しました。' 
      }, 400);
    }
  }
}
```

**学習ポイント**:
- **HTTP層の責務**: リクエスト/レスポンスの変換のみ
- **エラーハンドリング**: 適切なHTTPステータスコード
- **バリデーション**: HTTP層とビジネス層での二重チェック

### Step 5: Infrastructure（インフラストラクチャ）層

**なぜ最後か**: 横断的関心事（認証、ログ、エラーハンドリング）を処理し、他の層をサポートします。

```typescript
// src/middleware/auth.ts
export const authMiddleware = (authUsecase: AuthUsecase) => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: '認証が必要です。' }, 401);
      }

      const token = authHeader.substring(7);
      const user = await authUsecase.verifyToken(token);

      if (!user) {
        return c.json({ error: '無効なトークンです。' }, 401);
      }

      // ユーザー情報をコンテキストに設定
      c.set('user', { id: user.id, email: user.email });

      await next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      return c.json({ error: '認証エラーが発生しました。' }, 500);
    }
  };
};
```

## 🔄 実装パターン

### 依存性注入

```typescript
// src/index.ts - アプリケーション起動時の依存性注入
const prisma = new PrismaClient();

// リポジトリの初期化
const userRepository = new UserRepository(prisma);
const taskRepository = new TaskRepository(prisma);
const aiCoachRepository = new AICoachRepository();

// ユースケースの初期化（依存性注入）
const authUsecase = new AuthUsecase(userRepository);
const taskUsecase = new TaskUsecase(taskRepository);
const aiCoachUsecase = new AICoachUsecase(
  aiCommentRepository,
  aiCoachRepository,
  promptRepository,
  taskRepository
);

// コントローラーの初期化（依存性注入）
const authController = new AuthController(authUsecase);
const taskController = new TaskController(taskUsecase);
const aiController = new AIController(aiCoachUsecase);
```

**メリット**:
- **疎結合**: 各層が具体的な実装に依存しない
- **テスト容易性**: モックオブジェクトで単体テスト可能
- **拡張性**: 新しい実装への切り替えが容易

### エラーハンドリング

```typescript
// 統一されたエラーレスポンス形式
interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
}

// カスタムエラークラス
export class BusinessLogicError extends Error {
  constructor(message: string, public code: string = 'BUSINESS_ERROR') {
    super(message);
    this.name = 'BusinessLogicError';
  }
}

// エラーハンドリングパターン
try {
  const result = await someOperation();
  return c.json({ data: result });
} catch (error) {
  if (error instanceof BusinessLogicError) {
    return c.json({ error: error.message, code: error.code }, 400);
  }
  
  console.error('Unexpected Error:', error);
  return c.json({ error: 'Internal Server Error' }, 500);
}
```

### バリデーション ※未実装

```typescript
// Zodスキーマによるバリデーション
import { z } from 'zod';

const CreateTaskSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です').max(100, 'タイトルは100文字以内です'),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
  completionCriteria: z.string().optional()
});

// バリデーション適用
const validateCreateTask = (data: unknown): CreateTaskRequest => {
  const result = CreateTaskSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Validation Error: ${result.error.message}`);
  }
  return result.data;
};
```

## 🧪 テスト戦略

### 単体テスト（各層独立）※未実装

```typescript
// usecases/TaskUsecase.test.ts
describe('TaskUsecase', () => {
  let taskUsecase: TaskUsecase;
  let mockTaskRepository: jest.Mocked<ITaskRepository>;

  beforeEach(() => {
    mockTaskRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findByUserId: jest.fn()
    };
    taskUsecase = new TaskUsecase(mockTaskRepository);
  });

  test('正常なタスク作成', async () => {
    const taskData = { title: 'テストタスク' };
    const expectedTask = { id: 1, title: 'テストタスク', userId: 1 };
    
    mockTaskRepository.create.mockResolvedValue(expectedTask);
    
    const result = await taskUsecase.createTask(1, taskData);
    
    expect(result).toEqual(expectedTask);
    expect(mockTaskRepository.create).toHaveBeenCalledWith(1, taskData);
  });

  test('タイトル空文字でエラー', async () => {
    await expect(
      taskUsecase.createTask(1, { title: '' })
    ).rejects.toThrow('タスクタイトルは必須です。');
  });
});
```

### 統合テスト ※未実装

```typescript
// integration/api.test.ts
describe('Task API Integration', () => {
  test('POST /api/tasks', async () => {
    const response = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'テストタスク' })
      .expect(201);

    expect(response.body.task.title).toBe('テストタスク');
  });
});
```

## 📖 API仕様

### 認証

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "password123"
}

# レスポンス
{
  "token": "jwt-token-here",
  "user": {
    "id": 1,
    "email": "test@example.com"
  }
}
```

### タスク管理

```http
# タスク作成
POST /api/tasks
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "title": "新しいタスク",
  "dueDate": "2024-12-31",
  "notes": "メモ",
  "completionCriteria": "完了条件"
}

# AI相談
POST /api/tasks/1/consult
Authorization: Bearer jwt-token
Content-Type: application/json

{
  "userInput": "このタスクが遅れています。どうすればいいでしょうか？"
}
```

## 🚀 デプロイメント

### Docker構成

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://user:password@db:5432/aicoach
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: aicoach
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 環境変数

```bash
# .env
DATABASE_URL="postgresql://user:password@localhost:5432/aicoach"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="24h"
OPENAI_API_KEY="your-openai-api-key"
AI_MODEL="gpt-4"
MAX_TOKENS="500"
PORT="3000"
NODE_ENV="production"
```

## 🎯 学習成果

### アーキテクチャスキル
- **Clean Architecture**の実践的な実装
- **依存関係の制御**と**責任分離**
- **拡張性**と**保守性**を考慮した設計

### TypeScriptスキル
- **型安全**なAPI開発
- **インターフェース**による抽象化
- **ジェネリクス**と**ユニオン型**の活用

### データベーススキル
- **Prisma ORM**による型安全なクエリ
- **マイグレーション**管理
- **リレーション**とデータ整合性

### DevOpsスキル
- **Docker**によるコンテナ化
- **環境変数**による設定管理
- **CI/CD**パイプライン構築

---
