import { Context, Next } from "hono";
import { AuthUsecase } from "../usecases/AuthUsecase";

export const authMiddleware = (authUsecase: AuthUsecase) => {
  return async (c: Context, next: Next) => {
    try {
      const authHeader = c.req.header('Authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return c.json({ error: '認証トークンが必要です' }, 401)
      }

      const token = authHeader.substring(7);
      const user = await authUsecase.verifyToken(token);

      if (!user) {
        return c.json({ error: '無効なトークンです。' }, 401);
      }

      // ユーザー情報をコンテキストに設定
      c.set('user', {
        id: user.id,
        email: user.email
      })

      await next();
    } catch (error) {
      return c.json({ error: '無効なトークンです' }, 401);
    }
  }
}