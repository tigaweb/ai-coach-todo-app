import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { 
  Card, 
  Title, 
  Paragraph, 
  Button, 
  Appbar,
  ActivityIndicator,
  ProgressBar,
  Chip,
  FAB,
  Portal,
  Dialog,
  TextInput
} from 'react-native-paper';
import { useTaskStore } from '../stores/taskStore';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { TaskStatus } from '../types';

type TaskDetailScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskDetail'>;
type TaskDetailScreenRouteProp = RouteProp<RootStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC = () => {
  const navigation = useNavigation<TaskDetailScreenNavigationProp>();
  const route = useRoute<TaskDetailScreenRouteProp>();
  const { taskId } = route.params;
  
  const { currentTask, isLoading, fetchTask, updateTask, deleteTask } = useTaskStore();
  const [showProgressDialog, setShowProgressDialog] = useState(false);
  const [progressValue, setProgressValue] = useState('');

  useEffect(() => {
    fetchTask(taskId);
  }, [taskId]);

  useEffect(() => {
    if (currentTask) {
      setProgressValue(currentTask.progress.toString());
    }
  }, [currentTask]);

  const handleEdit = () => {
    navigation.navigate('EditTask', { taskId });
  };

  const handleDelete = () => {
    Alert.alert(
      'タスク削除',
      'このタスクを削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTask(taskId);
              navigation.goBack();
            } catch (error) {
              Alert.alert('エラー', 'タスクの削除に失敗しました');
            }
          }
        }
      ]
    );
  };

  const handleAIConsult = () => {
    navigation.navigate('AIConsult', { taskId });
  };

  const handleProgressUpdate = async () => {
    const progress = parseInt(progressValue);
    if (isNaN(progress) || progress < 0 || progress > 100) {
      Alert.alert('エラー', '進捗は0から100の数値で入力してください');
      return;
    }

    try {
      await updateTask(taskId, { progress });
      setShowProgressDialog(false);
    } catch (error) {
      Alert.alert('エラー', '進捗の更新に失敗しました');
    }
  };

  const handleToggleComplete = async () => {
    if (!currentTask) return;
    
    const newStatus = currentTask.status === TaskStatus.COMPLETED 
      ? TaskStatus.PENDING 
      : TaskStatus.COMPLETED;
    
    const newProgress = newStatus === TaskStatus.COMPLETED ? 100 : currentTask.progress;

    try {
      await updateTask(taskId, { status: newStatus, progress: newProgress });
    } catch (error) {
      Alert.alert('エラー', 'ステータスの更新に失敗しました');
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '#4caf50';
      case TaskStatus.PENDING:
        return '#2196f3';
      default:
        return '#757575';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '完了';
      case TaskStatus.PENDING:
        return '未完了';
      default:
        return '削除済み';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading || !currentTask) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="タスク詳細" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Paragraph style={styles.loadingText}>タスクを読み込み中...</Paragraph>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="タスク詳細" />
        <Appbar.Action icon="pencil" onPress={handleEdit} />
        <Appbar.Action icon="delete" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.header}>
              <Title style={styles.title}>{currentTask.title}</Title>
              <Chip 
                style={[styles.statusChip, { backgroundColor: getStatusColor(currentTask.status) }]}
                textStyle={styles.statusText}
              >
                {getStatusText(currentTask.status)}
              </Chip>
            </View>

            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Paragraph style={styles.progressText}>
                  進捗: {currentTask.progress}%
                </Paragraph>
                <Button 
                  mode="outlined" 
                  compact 
                  onPress={() => setShowProgressDialog(true)}
                >
                  更新
                </Button>
              </View>
              <ProgressBar 
                progress={currentTask.progress / 100} 
                color="#2196f3" 
                style={styles.progressBar}
              />
            </View>

            <View style={styles.detailsSection}>
              <Paragraph style={styles.detailLabel}>完了予定日</Paragraph>
              <Paragraph style={styles.detailValue}>
                {formatDate(currentTask.dueDate)}
              </Paragraph>

              <Paragraph style={styles.detailLabel}>作成日</Paragraph>
              <Paragraph style={styles.detailValue}>
                {formatDate(currentTask.createdAt)}
              </Paragraph>

              <Paragraph style={styles.detailLabel}>最終更新日</Paragraph>
              <Paragraph style={styles.detailValue}>
                {formatDate(currentTask.updatedAt)}
              </Paragraph>
            </View>

            {currentTask.completionCriteria && (
              <View style={styles.section}>
                <Paragraph style={styles.sectionLabel}>完了条件</Paragraph>
                <Paragraph style={styles.sectionContent}>
                  {currentTask.completionCriteria}
                </Paragraph>
              </View>
            )}

            {currentTask.notes && (
              <View style={styles.section}>
                <Paragraph style={styles.sectionLabel}>備考</Paragraph>
                <Paragraph style={styles.sectionContent}>
                  {currentTask.notes}
                </Paragraph>
              </View>
            )}

            <View style={styles.actionButtons}>
              <Button 
                mode="contained" 
                onPress={handleToggleComplete}
                style={[
                  styles.actionButton,
                  { backgroundColor: currentTask.status === TaskStatus.COMPLETED ? '#ff9800' : '#4caf50' }
                ]}
              >
                {currentTask.status === TaskStatus.COMPLETED ? '未完了に戻す' : '完了にする'}
              </Button>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <FAB
        style={styles.fab}
        icon="robot"
        label="AI相談"
        onPress={handleAIConsult}
      />

      <Portal>
        <Dialog visible={showProgressDialog} onDismiss={() => setShowProgressDialog(false)}>
          <Dialog.Title>進捗を更新</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="進捗 (%)"
              value={progressValue}
              onChangeText={setProgressValue}
              keyboardType="numeric"
              mode="outlined"
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProgressDialog(false)}>キャンセル</Button>
            <Button onPress={handleProgressUpdate}>更新</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
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
    marginBottom: 80,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
  },
  statusChip: {
    marginLeft: 8,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
  },
  progressSection: {
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  detailsSection: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
    lineHeight: 24,
  },
  actionButtons: {
    marginTop: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#2196f3',
  },
});

export default TaskDetailScreen; 