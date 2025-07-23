import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { CreateTaskRequest } from '../types';

type CreateTaskScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTask'>;

const CreateTaskScreen: React.FC = () => {
  const navigation = useNavigation<CreateTaskScreenNavigationProp>();
  const { createTask, isLoading } = useTaskStore();
  
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [completionCriteria, setCompletionCriteria] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

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
    
    const taskData: CreateTaskRequest = {
      title: title.trim(),
      notes: notes.trim() || undefined,
      completionCriteria: completionCriteria.trim() || undefined,
      dueDate: dueDate.trim() || undefined,
    };

    try {
      await createTask(taskData);
      Alert.alert('成功', 'タスクが作成されました', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('エラー', 'タスクの作成に失敗しました');
    }
  };

  const handleCancel = () => {
    if (title.trim() || notes.trim() || completionCriteria.trim() || dueDate.trim()) {
      Alert.alert(
        '確認',
        '入力内容が保存されていません。戻りますか？',
        [
          { text: 'キャンセル', style: 'cancel' },
          { text: '戻る', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={handleCancel} />
          <Appbar.Content title="新しいタスク" />
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
                {isLoading ? <ActivityIndicator size="small" color="white" /> : 'タスクを作成'}
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

export default CreateTaskScreen; 