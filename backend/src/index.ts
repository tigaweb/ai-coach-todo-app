import { PrismaClient } from "../generated/prisma";
import { Hono } from "hono";
import { cors } from "hono/cors"
import { serve } from '@hono/node-server';
import { UserRepository } from "./repositories/UserRepository";
import { AuthUsecase } from "./usecases/AuthUsecase";
import { AuthController } from "./controllers/AuthController";
import dotenv from 'dotenv';
import { TaskRepository } from "./repositories/TaskRepository";
import { TaskUsecase } from "./usecases/TaskUsecase";
import { TaskController } from "./controllers/TaskController";
import { authMiddleware } from "./middleware/auth";
import { AIController } from "./controllers/AIController";
import { AICoachRepository } from "./repositories/AICoachRepository";
import { AICommentRepository } from "./repositories/AICommentRepository";
import { PromptRepository } from "./repositories/PromptRepository";
import { AICoachUsecase } from "./usecases/AICoachUsecase";

// 環境変数の読み込み
dotenv.config();

// prismaクライアントの初期化
const prisma = new PrismaClient();

// repositoriesの初期化
const userRepository = new UserRepository(prisma);
const taskRepository = new TaskRepository(prisma);
const aiCommentRepository = new AICommentRepository(prisma);
const aiCoachRepository = new AICoachRepository();
const promptRepository = new PromptRepository(prisma);

// usecasesの初期化
const authUsecase = new AuthUsecase(userRepository);
const taskUsecase = new TaskUsecase(taskRepository);
const aiCoachUsecase = new AICoachUsecase(
  aiCommentRepository,
  aiCoachRepository,
  promptRepository,
  taskRepository
);

// controllersの初期化
const authController = new AuthController(authUsecase);
const taskController = new TaskController(taskUsecase);
const aiController = new AIController(aiCoachUsecase);


const app = new Hono();

// CORS設定
app.use('*', cors({
  origin: ['http://localhost:19006', 'http://localhost:8081'],
  credentials: true,
}));

// ヘルスチェック
app.get('/health', (c) => c.json({
  status: 'OK',
  timestamp: new Date().toISOString()
}))

// 認証ルート
app.post('/api/auth/register', (c) => authController.register(c));
app.post('/api/auth/login', (c) => authController.login(c));

// 認証ミドルウェア
app.use('/api/tasks/*', authMiddleware(authUsecase));
app.use('/api/ai-comments/*', authMiddleware(authUsecase));

// タスク
app.get('/api/tasks', (c) => taskController.getAllTasks(c));
app.get('/api/tasks/:id', (c) => taskController.getTaskById(c));
app.post('/api/tasks', (c) => taskController.createTask(c));
app.put('/api/tasks/:id', (c) => taskController.updateTask(c));
app.delete('/api/tasks/:id', (c) => taskController.deleteTask(c));

// AI
app.post('/api/tasks/:id/consult', (c) => aiController.consultTask(c));
app.get('/api/tasks/:id/comments', (c) => aiController.getTaskComments(c));
app.get('/api/ai-comments/:id', (c) => aiController.getCommentById(c));

// DB初期化
async function initializeDatabase() {
  try {
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected successfully');

    // デフォルトのシステムプロンプトの追加 ※管理画面を作らないため流し込みで対応
    const existingPrompts = await prisma.prompt.findMany();
    if (existingPrompts.length === 0) {
      await prisma.prompt.create({
        data: {
          name: 'Default Coach Prompt',
          content: 'あなたは優秀なタスク管理コーチです。ユーザーのタスクに対して建設的で実用的なアドバイスを500文字以内で提供してください。具体的なアクションプランや改善点を含めて回答してください。',
          isActive: true
        }
      });
      console.log('Default prompt created');
    }

    // テスト用のログインユーザーの作成
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    
    if (!testUser) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          passwordHash: hashedPassword
        }
      });
      console.log('Test user created (email: test@example.com, password: password123)');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// graceful shutdownの処理追加
process.on('SIGINT', async () => { // Ctrl + Cでの終了時
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  console.log(' Database disconnected');
  process.exit(0);
});

process.on('SIGTERM', async () => { // コンテナ終了時
  console.log('\n Shutting down gracefully...');
  await prisma.$disconnect();
  console.log(' Database disconnected');
  process.exit(0);
});

// サーバー起動&DB初期化
async function startServer() {
  await initializeDatabase();
  
  const port = parseInt(process.env.PORT || '3000');
  console.log(`Server is running on port ${port}`);
  
  serve({
    fetch: app.fetch,
    port,
  });
}

// コンテナ起動時にサーバーを起動
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
}); 