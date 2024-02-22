/*
 * https://developer.enonic.com/docs/xp/stable/api/lib-task
 */
export interface TaskLib {
  get: (task: string) => TaskInfo
  isRunning: (task: string) => boolean
  list: (name?: string, state?: TaskState) => Array<TaskInfo>
  progress: (progress: TaskProgress) => void
  sleep: (timeMillis: number) => void
  submit: (task: SubmitOptions) => string
  submitNamed: (task: SubmitNamedOptions) => string
}

export interface SubmitOptions {
  description: string
  task: () => void
}

export interface SubmitNamedOptions {
  name: string
  config: object
}

export type TaskState = 'WAITING' | 'RUNNING' | 'FINISHED' | 'FAILED'

export interface TaskInfo {
  description: string
  id: string
  name: string
  state: TaskState
  application: string
  user: string
  startTime: string
  progress: TaskProgress
}

export interface TaskProgress {
  info: string
  current: number
  total: number
}
