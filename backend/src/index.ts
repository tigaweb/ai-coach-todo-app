import { PrismaClient } from "@prisma/client";
import { Hono } from "hono";
import { cors } from "hono/cors"
import { UserRepository } from "./repositories/UserRepository";
import { AuthUsecase } from "./usecases/AuthUsecase";
import { AuthController } from "./controllers/AuthController";


const app = new Hono();

// CORS設定
app.use('*', cors({
  origin: ['http://localhost:19006', 'http://localhost:8081'],
  credentials: true,
}));

// 依存性注入
const prisma = new PrismaClient();
const userRepository = new UserRepository(prisma);
// const taskRepository = new TaskRepository(prisma)
const authUsecase = new AuthUsecase(userRepository);
// const taskUsecase = new TaskUsecase(taskRepository);
const authController = new AuthController(authUsecase);
// const taskController = new TaskController(taskUsecase);

// ヘルスチェック
app.get('/health', (c) => c.json({
  status: 'OK',
  timestamp: new Date().toISOString()
}))

// 認証ルート
app.post('/api/auth/register', (c) => authController.register(c));
app.post('/api/auth/login', (c) => authController.login(c));

// サーバー起動
const port = parseInt(process.env.PORT || '3000');
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};