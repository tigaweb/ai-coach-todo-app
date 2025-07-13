FROM node:18-alpine

WORKDIR /app

# package.json をコピーして依存関係をインストール
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# Prisma Client を生成
RUN npx prisma generate

# TypeScript をビルド
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]