export type RootStackParamList = {
  Login: undefined;
  TaskList: undefined;
  TaskDetail: { taskId: number };
  CreateTask: undefined;
  EditTask: { taskId: number };
  AIConsult: { taskId: number };
};