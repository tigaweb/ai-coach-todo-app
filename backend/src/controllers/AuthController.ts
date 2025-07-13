import { Context } from "hono";
import { AuthUsecase } from "../usecases/AuthUsecase";
import { CreateUserRequest, LoginRequest } from "../entities/User";

export class AuthController {
  constructor(private authUsecase: AuthUsecase) { }

  async register(c: Context) {
    try {
      const body = await c.req.json() as CreateUserRequest;

      if (!body.email || !body.password) {
        return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400)
      }

      const result = await this.authUsecase.register(body);
      return c.json(result)
    } catch (error) {
      console.error('Registration error: ', error)
      return c.json({
        error: error instanceof Error ? error.message : 'ユーザー登録に失敗しました'
      }, 400);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json() as LoginRequest;

      // バリデーション
      if (!body.email || !body.password) {
        return c.json({ error: 'メールアドレスとパスワードは必須です' }, 400);
      }

      const result = await this.authUsecase.login(body);
      return c.json(result);
    } catch (error) {
      console.error('Login error:', error);
      return c.json({
        error: error instanceof Error ? error.message : 'ログインに失敗しました'
      }, 400);
    }
  }
}