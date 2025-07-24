import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  FAB,
  Appbar,
  ProgressBar,
  Button
} from 'react-native-paper';
import { useTaskStore } from '../stores/taskStore';
import { useAuthStore } from '../stores/authStore';
import { Task, TaskStatus } from '../types';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';

type TaskListScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'TaskList'>;

const TaskListScreen: React.FC = () => {
  const navigation = useNavigation<TaskListScreenNavigationProp>();
  const { tasks, isLoading, fetchTasks } = useTaskStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchTasks();
  }, []);

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return '#4CAF50';
      case TaskStatus.PENDING: return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED: return '完了';
      case TaskStatus.PENDING: return '未完了';
      default: return '不明';
    }
  };

  const renderTask = ({ item }: { item: Task }) => (
    <Card style={styles.taskCard}>
      <Card.Content>
        <View style={styles.taskHeader}>
          <Title style={styles.taskTitle}>{item.title}</Title>
          <Chip
            mode="outlined"
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: 'white' }}
          >
            {getStatusText(item.status)}
          </Chip>
        </View>

        <View style={styles.progressContainer}>
          <Paragraph>進捗: {item.progress}%</Paragraph>
          <ProgressBar progress={item.progress / 100} style={styles.progressBar} />
        </View>

        {item.dueDate && (
          <Paragraph style={styles.dueDate}>
            完了予定: {new Date(item.dueDate).toLocaleDateString('ja-JP')}
          </Paragraph>
        )}

        <View style={styles.buttonContainer}>
          <Button mode="outlined" onPress={() => { navigation.navigate('TaskDetail', { taskId: item.id }) }}>
            詳細
          </Button>
          <Button mode="contained" onPress={() => { navigation.navigate('AIConsult', { taskId: item.id }) }}>
            AI相談
          </Button>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="タスク一覧" />
        <Appbar.Action icon="logout" onPress={logout} />
      </Appbar.Header>

      <FlatList
        data={tasks}
        renderItem={renderTask}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchTasks} />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => { navigation.navigate('CreateTask') }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  list: {
    padding: 16,
  },
  taskCard: {
    marginBottom: 16,
    elevation: 2,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTitle: {
    flex: 1,
    fontSize: 18,
    marginRight: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    marginTop: 4,
    height: 8,
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default TaskListScreen;