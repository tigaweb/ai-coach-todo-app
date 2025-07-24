import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { 
  Card, 
  Title, 
  TextInput, 
  Button, 
  Appbar,
  ActivityIndicator,
  HelperText
} from 'react-native-paper';
import { useTaskStore } from '../stores/taskStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { UpdateTaskRequest } from '../types';

type EditTaskScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditTask'>;
type EditTaskScreenRouteProp = RouteProp<RootStackParamList, 'EditTask'>;

const EditTaskScreen: React.FC = () => {
  const navigation = useNavigation<EditTaskScreenNavigationProp>();
  const route = useRoute<EditTaskScreenRouteProp>();
  const { taskId } = route.params;
  
  const { currentTask, isLoading, fetchTask, updateTask } = useTaskStore();
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [completionCriteria, setCompletionCriteria] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    fetchTask(taskId);
  }, [taskId]);

  useEffect(() => {
    if (currentTask && !isInitialized) {
      setTitle(currentTask.title);
      setNotes(currentTask.notes || '');
      setCompletionCriteria(currentTask.completionCriteria || '');
      setDueDate(currentTask.dueDate ? currentTask.dueDate.split('T')[0] : '');
      setIsInitialized(true);
    }
  }, [currentTask, isInitialized]);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    
    if (!title.trim()) {
      newErrors.title = 'タイトルは必須です';
    }
    
    if (dueDate && !isValidDate(dueDate)) {
      newErrors.dueDate = '日付の形式が正しくありません (YYYY-MM-DD)';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const updateData: UpdateTaskRequest = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      completionCriteria: completionCriteria.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
    };

    try {
      await updateTask(taskId, updateData);
      Alert.alert('成功', 'タスクが更新されました', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('エラー', 'タスクの更新に失敗しました');
    }
  };

  const handleCancel = () => {
    if (!currentTask) return;
    
    const hasChanges = 
      title !== currentTask.title ||
      notes !== (currentTask.notes || '') ||
      completionCriteria !== (currentTask.completionCriteria || '') ||
      dueDate !== (currentTask.dueDate ? currentTask.dueDate.split('T')[0] : '');
    
    if (hasChanges) {
      Alert.alert(
        '確認',
        '変更内容が保存されていません。戻りますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '戻る', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  if (isLoading || !currentTask || !isInitialized) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="タスク編集" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Title style={styles.loadingText}>タスクを読み込み中...</Title>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="タスク編集" />
          <Appbar.Action 
            icon="check" 
            onPress={handleSubmit}
            disabled={isLoading}
          />
        </Appbar.Header>

        <KeyboardAvoidingView 
          style={styles.content}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
          <ScrollView 
            style={styles.scrollView}
            keyboardShouldPersistTaps="handled"
          >
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.formTitle}>タスク情報</Title>
            
            <TextInput
              label="タイトル *"
              value={title}
              onChangeText={setTitle}
              mode="outlined"
              style={styles.input}
              error={!!errors.title}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!errors.title}>
              {errors.title}
            </HelperText>

            <TextInput
              label="完了予定日 (YYYY-MM-DD)"
              value={dueDate}
              onChangeText={setDueDate}
              mode="outlined"
              style={styles.input}
              placeholder="例: 2024-12-31"
              error={!!errors.dueDate}
              disabled={isLoading}
            />
            <HelperText type="error" visible={!!errors.dueDate}>
              {errors.dueDate}
            </HelperText>

            <TextInput
              label="完了条件"
              value={completionCriteria}
              onChangeText={setCompletionCriteria}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="このタスクが完了したと判断する条件を記入してください"
              disabled={isLoading}
            />

            <TextInput
              label="備考"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="追加の情報や注意事項があれば記入してください"
              disabled={isLoading}
            />

            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={handleSubmit}
                style={styles.submitButton}
                disabled={isLoading}
              >
                {isLoading ? <ActivityIndicator size="small" color="white" /> : 'タスクを更新'}
              </Button>
              
              <Button
                mode="outlined"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isLoading}
              >
                キャンセル
              </Button>
            </View>
          </Card.Content>
        </Card>
          </ScrollView>
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
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
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
  card: {
    elevation: 2,
  },
  formTitle: {
    marginBottom: 16,
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    marginBottom: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
    paddingVertical: 8,
  },
  cancelButton: {
    paddingVertical: 8,
  },
});

export default EditTaskScreen; 