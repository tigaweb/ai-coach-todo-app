# フロントエンド - React Native実装

![React Native](https://img.shields.io/badge/react_native-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Expo](https://img.shields.io/badge/expo-1C1E24?style=for-the-badge&logo=expo&logoColor=#D04A37)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Navigation](https://img.shields.io/badge/React_Navigation-61DAFB?style=for-the-badge&logo=react&logoColor=black)

## 🎯 技術構成

このフロントエンドは**React Native + Expo**を使用したクロスプラットフォームアプリケーションです。**TypeScript**による型安全な開発と、**React Navigation**による従来型のナビゲーション実装を採用しています。

### 主要ライブラリ

```json
{
  "dependencies": {
    "expo": "~53.0.17",                           // クロスプラットフォーム開発フレームワーク
    "react-native": "0.79.5",                    // ネイティブアプリ開発フレームワーク
    "@react-navigation/native": "^7.1.14",       // ナビゲーション管理
    "@react-navigation/native-stack": "^7.3.21", // スタックナビゲーション
    "react-native-paper": "^5.14.5",             // Material Design UIライブラリ
    "zustand": "^5.0.6",                         // 軽量状態管理
    "axios": "^1.10.0",                          // HTTP通信ライブラリ
    "@react-native-async-storage/async-storage": "^2.2.0" // ローカルストレージ
  }
}
```

### 技術選定理由

| 技術 | 選定理由 | 代替案 |
|------|----------|-------|
| **React Navigation** | プログラマティックナビゲーション、完全なカスタマイゼーション | Expo Router（ファイルベース） |
| **Zustand** | 学習コストが低い、軽量、TypeScript親和性 | Redux Toolkit、Context API |
| **React Native Paper** | Material Design準拠、一貫したデザイン | NativeBase、Tamagui |
| **Axios** | HTTP通信の標準ライブラリ、インターセプター対応 | Fetch API、TanStack Query |

### 開発ツール

```json
{
  "devDependencies": {
    "@babel/core": "^7.25.2",     // JavaScript変換
    "@types/react": "~19.0.10",   // React型定義
    "typescript": "~5.8.3"        // TypeScript言語サポート
  }
}
```

## 🏗️ プロジェクト構造

### ディレクトリ構成

```
src/
├── screens/           # 📱 画面コンポーネント
│   ├── LoginScreen.tsx          # ログイン画面
│   ├── TaskListScreen.tsx       # タスク一覧画面
│   ├── TaskDetailScreen.tsx     # タスク詳細画面
│   ├── CreateTaskScreen.tsx     # タスク作成画面
│   ├── EditTaskScreen.tsx       # タスク編集画面
│   └── AIConsultScreen.tsx      # AI相談画面
│
├── stores/            # 🗄️ 状態管理（Zustand）
│   ├── authStore.ts             # 認証状態管理
│   ├── taskStore.ts             # タスク状態管理
│   └── aiStore.ts               # AI相談状態管理
│
├── services/          # 🌐 API通信
│   └── api.ts                   # APIサービス（Axios）
│
├── types/             # 📝 型定義
│   ├── index.ts                 # エンティティ型定義
│   └── navigation.ts            # ナビゲーション型定義
│
├── navigation/        # 🧭 ナビゲーション設定
│   └── AppNavigator.tsx         # ナビゲーション構成
│
├── components/        # 🧩 再利用可能コンポーネント
│   └── (共通コンポーネント)
│
└── utils/             # 🛠️ ユーティリティ関数
    └── (ヘルパー関数)
```

### ファイル命名規則

```typescript
// 画面コンポーネント
ScreenName + Screen.tsx    // LoginScreen.tsx

// 状態管理
domain + Store.ts          // authStore.ts

// 型定義
interface名 = 単数形       // User, Task, AIComment
type名 = 具体的な名前      // RootStackParamList

// API関数
動詞 + 名詞               // getTask, createTask
```

## 🎨 設計方針

### 状態管理戦略（Zustand）

#### なぜZustandを選択したか

```typescript
// ❌ Context API - プロバイダー地獄
<AuthProvider>
  <ThemeProvider>
    <TaskProvider>
      <App />
    </TaskProvider>
  </ThemeProvider>
</AuthProvider>

// ❌ Redux - 大量のボイラープレート
// actions, reducers, selectors...

// ✅ Zustand - シンプルで直感的
const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  fetchTasks: async () => {
    const tasks = await apiService.getTasks();
    set({ tasks });
  }
}));
```

#### 状態管理の分割戦略

```typescript
// ドメインごとに状態を分割
├── authStore.ts     # 認証関連（ユーザー情報、ログイン状態）
├── taskStore.ts     # タスク関連（一覧、詳細、CRUD操作）
└── aiStore.ts       # AI相談関連（相談履歴、ローディング状態）
```

### ナビゲーション設計（React Navigation）

#### 従来型ナビゲーションの採用理由

```typescript
// なぜExpo Routerではなく、React Navigationを選択したか

// ✅ React Navigation の利点
// 1. プログラマティックナビゲーション
navigation.navigate('TaskDetail', { taskId: 123 });

// 2. 条件付きルーティング
{user.isAdmin && <Stack.Screen name="AdminPanel" />}

// 3. カスタムトランジション
screenOptions={{ cardStyleInterpolator: customTransition }}

// 4. 複雑なパラメータ渡し
navigation.navigate('Screen', { 
  callback: () => {},  // 関数も渡せる
  complexObject: data 
});
```

#### ナビゲーション構造

```typescript
// types/navigation.ts - 型安全なナビゲーション
export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: number };        // 必須パラメータ
  CreateTask: undefined;
  EditTask: { taskId: number };
  AIConsult: { taskId: number };
};

// 使用例
const navigation = useNavigation<NativeStackNavigationProp<MainTabParamList, 'TaskDetail'>>();
navigation.navigate('EditTask', { taskId: task.id }); // 型安全
```

### コンポーネント設計

#### Atomic Design的アプローチ

```typescript
// 🧩 Atoms（最小単位）
// - React Native Paper の基本コンポーネント
<Button>, <Text>, <TextInput>

// 🔧 Molecules（組み合わせ）
// - 特定の機能を持つコンポーネント群
<TaskCard>, <ProgressBar>, <StatusChip>

// 📱 Organisms（複雑な機能）
// - 画面の主要セクション
<TaskList>, <TaskForm>, <AIChatInterface>

// 📄 Templates（レイアウト）
// - 画面の骨格
<ScreenLayout>, <FormLayout>

// 📱 Pages（完全な画面）
// - 実際の画面コンポーネント
<TaskListScreen>, <TaskDetailScreen>
```

## 🔧 開発手順

### 環境構築

#### 1. 前提条件

```bash
# Node.js (v18以上)
node --version

# Expo CLI
npm install -g @expo/cli

# iOS Simulator (Mac only)
# Android Studio + Emulator
```

#### 2. プロジェクト初期化

```bash
# プロジェクト作成
npx create-expo-app --template blank-typescript

# 必要なライブラリインストール
npm install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npm install react-native-paper react-native-vector-icons
npm install zustand axios @react-native-async-storage/async-storage
```

#### 3. 設定ファイル

```typescript
// app.json - Expo設定
{
  "expo": {
    "name": "ai-coach-todo-app",
    "slug": "ai-coach-todo-app",
    "version": "1.0.0",
    "orientation": "portrait",
    "newArchEnabled": true,  // React Native新アーキテクチャ有効化
    "platforms": ["ios", "android", "web"]
  }
}

// tsconfig.json - TypeScript設定
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  }
}
```

### 開発サーバー起動

```bash
# 開発サーバー起動
npm start

# プラットフォーム別起動
npm run ios      # iOS Simulator
npm run android  # Android Emulator
npm run web      # Web Browser
```

### デバッグ設定

```typescript
// デバッグ用設定
const API_BASE_URL = __DEV__ 
  ? 'http://192.168.1.167:3000'  // 開発時：実際のIPアドレス
  : 'https://api.production.com'; // 本番時：本番API URL

// ログ出力
if (__DEV__) {
  console.log('Debug mode enabled');
}
```

## 📱 実装例

### API通信（services/api.ts）

```typescript
import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 60000,
      headers: { 'Content-Type': 'application/json' }
    });

    // リクエストインターセプター（認証トークン自動追加）
    this.client.interceptors.request.use(async (config) => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // レスポンスインターセプター（エラーハンドリング）
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          // ログイン画面に遷移
        }
        return Promise.reject(error);
      }
    );
  }

  // タスクAPI
  async getTasks(): Promise<TasksResponse> {
    const response = await this.client.get<TasksResponse>('/api/tasks');
    return response.data;
  }

  async createTask(task: CreateTaskRequest): Promise<TaskResponse> {
    const response = await this.client.post<TaskResponse>('/api/tasks', task);
    return response.data;
  }
}

export const apiService = new ApiService();
```

### 状態管理（stores/taskStore.ts）

```typescript
import { create } from 'zustand';

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchTasks: () => Promise<void>;
  createTask: (task: CreateTaskRequest) => Promise<void>;
  updateTask: (id: number, updates: UpdateTaskRequest) => Promise<void>;
  setCurrentTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.getTasks();
      set({ tasks: response.tasks, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'タスクの取得に失敗しました',
        isLoading: false 
      });
    }
  },

  createTask: async (taskData: CreateTaskRequest) => {
    set({ isLoading: true });
    try {
      const response = await apiService.createTask(taskData);
      set(state => ({
        tasks: [...state.tasks, response.task],
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error; // コンポーネント側でエラーハンドリング
    }
  },

  setCurrentTask: (task: Task | null) => {
    set({ currentTask: task });
  }
}));
```

### 画面コンポーネント（screens/TaskListScreen.tsx）

```typescript
import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Title, Button, FAB, Appbar } from 'react-native-paper';
import { useTaskStore } from '../stores/taskStore';
import { useNavigation } from '@react-navigation/native';

const TaskListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { tasks, isLoading, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <Title>{item.title}</Title>
        <Button 
          mode="outlined" 
          onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
        >
          詳細
        </Button>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="タスク一覧" />
      </Appbar.Header>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        refreshing={isLoading}
        onRefresh={fetchTasks}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTask')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  taskCard: { margin: 16, elevation: 2 },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0 }
});

export default TaskListScreen;
```

## 🎨 UI/UXデザイン

### Material Design 3対応

```typescript
// App.tsx - テーマ設定
import { MD3LightTheme, PaperProvider } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196f3',      // プライマリカラー
    secondary: '#03dac4',    // セカンダリカラー
  },
};

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <AppNavigator />
    </PaperProvider>
  );
}
```

### レスポンシブデザイン

```typescript
// utils/responsive.ts
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const responsive = {
  isTablet: width >= 768,
  isPhone: width < 768,
  screenWidth: width,
  screenHeight: height,
  
  // 相対サイズ計算
  wp: (percentage: number) => (width * percentage) / 100,
  hp: (percentage: number) => (height * percentage) / 100,
};

// 使用例
const styles = StyleSheet.create({
  container: {
    padding: responsive.isTablet ? 24 : 16,
    width: responsive.wp(100),
  },
});
```

## 🔧 ビルド・デプロイ

### ビルド設定

```bash
# iOS用ビルド
npx expo build:ios

# Android用ビルド
npx expo build:android

# Web用ビルド
npx expo build:web
```

### アプリ配布

```bash
# Expo Go での確認
npx expo publish

# スタンドアロンアプリビルド
npx expo build:ios --type archive    # iOS App Store
npx expo build:android --type apk    # Android APK
npx expo build:android --type aab    # Android App Bundle
```

## 📊 パフォーマンス最適化

### リスト表示の最適化

```typescript
// FlatListの最適化設定
<FlatList
  data={tasks}
  renderItem={renderTask}
  keyExtractor={(item) => item.id.toString()}
  
  // パフォーマンス最適化
  removeClippedSubviews={true}        // 画面外要素を削除
  maxToRenderPerBatch={10}            // 一度に描画する最大数
  windowSize={10}                     // ビューポートサイズ
  initialNumToRender={10}             // 初期描画数
  getItemLayout={(data, index) => ({  // アイテムサイズ事前計算
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>
```

### 画像最適化

```typescript
// expo-image使用（高性能な画像コンポーネント）
import { Image } from 'expo-image';

<Image
  source={{ uri: imageUrl }}
  style={styles.image}
  contentFit="cover"
  transition={200}           // フェードイン効果
  cachePolicy="memory-disk"  // キャッシュ戦略
/>
```

## 🧪 テスト戦略

### 単体テスト（Jest）※未実装

```typescript
// __tests__/stores/taskStore.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { useTaskStore } from '../../src/stores/taskStore';

describe('TaskStore', () => {
  test('タスク作成', async () => {
    const { result } = renderHook(() => useTaskStore());
    
    await act(async () => {
      await result.current.createTask({ title: 'テストタスク' });
    });
    
    expect(result.current.tasks).toHaveLength(1);
    expect(result.current.tasks[0].title).toBe('テストタスク');
  });
});
```

### コンポーネントテスト（React Native Testing Library）※未実装

```typescript
// __tests__/screens/TaskListScreen.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TaskListScreen from '../../src/screens/TaskListScreen';

describe('TaskListScreen', () => {
  test('タスク一覧表示', () => {
    const { getByText } = render(<TaskListScreen />);
    
    expect(getByText('タスク一覧')).toBeTruthy();
  });
  
  test('FABタップでタスク作成画面に遷移', () => {
    const { getByLabelText } = render(<TaskListScreen />);
    
    const fab = getByLabelText('plus');
    fireEvent.press(fab);
    
    // ナビゲーションのモック確認
  });
});
```

## 📱 開発のベストプラクティス

### エラーハンドリング ※未実装

```typescript
// components/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error);
    // エラーレポーティングサービスに送信
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text>アプリケーションエラーが発生しました</Text>
          <Button onPress={() => this.setState({ hasError: false })}>
            再試行
          </Button>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### メモリリーク対策 ※未実装

```typescript
// useEffect のクリーンアップ
useEffect(() => {
  const subscription = api.subscribe(handleUpdate);
  
  return () => {
    subscription.unsubscribe(); // クリーンアップ
  };
}, []);

// タイマーのクリーンアップ
useEffect(() => {
  const timer = setInterval(() => {
    // 定期処理
  }, 1000);
  
  return () => clearInterval(timer);
}, []);
```

## 🎯 学習成果

### React Nativeスキル
- **クロスプラットフォーム開発**の実践
- **TypeScript**によるコンポーネント開発
- **React Hooks**の効果的な活用
- **パフォーマンス最適化**技術

### 状態管理スキル
- **Zustand**による軽量状態管理
- **非同期処理**と状態の統合
- **エラー状態**の適切な管理

### UI/UXスキル
- **Material Design**に基づくデザイン
- **アクセシビリティ**対応
- **レスポンシブデザイン**の実装

### アーキテクチャスキル
- **コンポーネント設計**とReact Navigation
- **API連携**とエラーハンドリング
- **テスト駆動開発**の実践

---
