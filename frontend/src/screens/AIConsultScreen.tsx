import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, Keyboard, TouchableWithoutFeedback } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  TextInput,
  Button,
  Appbar,
  ActivityIndicator,
  Chip
} from 'react-native-paper';
import { useTaskStore } from '../stores/taskStore';
import { useAIStore } from '../stores/aiStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { AIComment } from '../types';

type AIConsultScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'AIConsult'>;
type AIConsultScreenRouteProp = RouteProp<RootStackParamList, 'AIConsult'>;

const AIConsultScreen: React.FC = () => {
  const navigation = useNavigation<AIConsultScreenNavigationProp>();
  const route = useRoute<AIConsultScreenRouteProp>();
  const { taskId } = route.params;

  const { currentTask, fetchTask } = useTaskStore();
  const { comments, isLoading, consultTask, fetchTaskComments } = useAIStore();

  const [userInput, setUserInput] = useState('');
  const [isTaskLoading, setIsTaskLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsTaskLoading(true);
      await Promise.all([
        fetchTask(taskId),
        fetchTaskComments(taskId)
      ]);
      setIsTaskLoading(false);
    };
    loadData();
  }, [taskId]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      Alert.alert('エラー', '質問を入力してください');
      return;
    }

    if (userInput.length > 500) {
      Alert.alert('エラー', '質問は500文字以内で入力してください');
      return;
    }

    try {
      await consultTask(taskId, userInput.trim());
      setUserInput('');
    } catch (error) {
      Alert.alert('エラー', 'AI相談に失敗しました。OpenAI APIキーが設定されているか確認してください。');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderComment = (comment: AIComment) => (
    <View key={comment.id} style={styles.commentContainer} pointerEvents="box-none">
      <Card style={styles.userCard}>
        <Card.Content>
          <View style={styles.commentHeader}>
            <Chip icon="account" style={styles.userChip}>あなた</Chip>
            <Paragraph style={styles.timestamp}>
              {formatDate(comment.createdAt)}
            </Paragraph>
          </View>
          <Paragraph style={styles.commentText}>{comment.userInput}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.aiCard}>
        <Card.Content>
          <View style={styles.commentHeader}>
            <Chip icon="robot" style={styles.aiChip}>AIコーチ</Chip>
          </View>
          <Paragraph style={styles.commentText}>{comment.aiResponse}</Paragraph>
        </Card.Content>
      </Card>
    </View>
  );

  if (isTaskLoading) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="AI相談" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>読み込み中...</Paragraph>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="AI相談" />
        </Appbar.Header>

        <KeyboardAvoidingView
          style={styles.keyboardAvoidingView}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <View style={styles.content}>
            {/* Chat History with Task Information */}
            <ScrollView
              style={styles.chatScrollView}
              contentContainerStyle={styles.chatContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={true}
              scrollEventThrottle={16}
              bounces={true}
            >
              {/* Task Information */}
              {currentTask && (
                <Card style={styles.taskCard}>
                  <Card.Content>
                    <Title style={styles.taskTitle}>{currentTask.title}</Title>
                    <Paragraph style={styles.taskInfo}>
                      進捗: {currentTask.progress}% |
                      完了予定: {currentTask.dueDate ?
                        new Date(currentTask.dueDate).toLocaleDateString('ja-JP') :
                        '未設定'
                      }
                    </Paragraph>
                    {currentTask.completionCriteria && (
                      <Paragraph style={styles.taskCriteria}>
                        完了条件: {currentTask.completionCriteria}
                      </Paragraph>
                    )}
                  </Card.Content>
                </Card>
              )}

              {/* Chat Content */}
              {comments.length === 0 ? (
                <View pointerEvents="box-none">
                  <Card style={styles.welcomeCard}>
                    <Card.Content>
                      <Title style={styles.welcomeTitle}>AIコーチにご相談ください</Title>
                      <Paragraph style={styles.welcomeText}>
                        このタスクについて何でもお聞きください：
                      </Paragraph>
                      <Paragraph style={styles.exampleText}>
                        • 進め方がわからない
                        • モチベーションが上がらない
                        • 効率的なやり方を知りたい
                        • 完了条件が適切か確認したい
                      </Paragraph>
                    </Card.Content>
                  </Card>
                </View>
              ) : (
                <>
                  {comments.map(renderComment)}
                </>
              )}
            </ScrollView>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <Card style={styles.inputCard}>
                <Card.Content>
                  <TextInput
                    label="AIコーチに質問する"
                    value={userInput}
                    onChangeText={setUserInput}
                    mode="outlined"
                    style={styles.input}
                    multiline
                    numberOfLines={3}
                    placeholder="タスクについて質問や相談があれば入力してください..."
                    disabled={isLoading}
                    maxLength={500}
                    blurOnSubmit={false}
                  />
                  <View style={styles.inputFooter}>
                    <Paragraph style={styles.charCount}>
                      {userInput.length}/500
                    </Paragraph>
                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      disabled={isLoading || !userInput.trim()}
                      style={styles.submitButton}
                    >
                      {isLoading ? <ActivityIndicator size="small" color="white" /> : '送信'}
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  taskCard: {
    margin: 16,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  taskInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskCriteria: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  chatScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  chatContent: {
    paddingBottom: 16,
  },
  welcomeCard: {
    marginBottom: 16,
    elevation: 1,
  },
  welcomeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    marginBottom: 12,
  },
  exampleText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  commentContainer: {
    marginBottom: 16,
  },
  userCard: {
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
    elevation: 1,
  },
  aiCard: {
    marginLeft: 20,
    backgroundColor: '#f3e5f5',
    elevation: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userChip: {
    backgroundColor: '#2196f3',
  },
  aiChip: {
    backgroundColor: '#9c27b0',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
  },
  inputCard: {
    margin: 16,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: 12,
    color: '#666',
  },
  submitButton: {
    minWidth: 80,
  },
});

export default AIConsultScreen; 