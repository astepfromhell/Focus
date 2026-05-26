/**
 * 常量定义文件
 */

// ==================== 任务类型 ====================
export const TASK_TYPE = {
    SHORT: 'SHORT',
    LONG: 'LONG'
}

export const TASK_TYPE_LABEL = {
    [TASK_TYPE.SHORT]: '短任务',
    [TASK_TYPE.LONG]: '长任务'
}

// ==================== 任务状态 ====================
export const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
}

export const TASK_STATUS_LABEL = {
    [TASK_STATUS.PENDING]: '待处理',
    [TASK_STATUS.IN_PROGRESS]: '进行中',
    [TASK_STATUS.COMPLETED]: '已完成',
    [TASK_STATUS.CANCELLED]: '已取消'
}

// ==================== 任务优先级 ====================
export const TASK_PRIORITY = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high'
}

export const TASK_PRIORITY_LABEL = {
    [TASK_PRIORITY.LOW]: '低',
    [TASK_PRIORITY.MEDIUM]: '中',
    [TASK_PRIORITY.HIGH]: '高'
}

export const TASK_PRIORITY_COLOR = {
    [TASK_PRIORITY.LOW]: '#66BB6A',
    [TASK_PRIORITY.MEDIUM]: '#FFA726',
    [TASK_PRIORITY.HIGH]: '#FF6B6B'
}

// ==================== 便签颜色 ====================
export const NOTE_COLORS = [
    { hex: '#fffab3', name: '黄色' },
    { hex: '#ffca91', name: '橙色' },
    { hex: '#b8d5b8', name: '绿色' },
    { hex: '#aacce8', name: '蓝色' },
    { hex: '#a18e7f', name: '棕色' },
    { hex: '#fac3d5', name: '粉色' },
    { hex: '#d6b4df', name: '紫色' },
    { hex: '#98b1af', name: '青色' },
    { hex: '#ffb2b2', name: '红色' },
    { hex: '#c1c1c1', name: '灰色' }
]

// ==================== 番茄钟预设 ====================
export const POMODORO_PRESETS = {
    CLASSIC: { id: 'CLASSIC', name: '经典番茄', icon: '🍅', work: 25, break: 5 },
    LONG_FOCUS: { id: 'LONG_FOCUS', name: '长专注', icon: '🪶', work: 50, break: 10 },
    SPRINT: { id: 'SPRINT', name: '快速冲刺', icon: '⚡', work: 15, break: 3 },
    CUSTOM: { id: 'CUSTOM', name: '自定义', icon: '🤎', work: 25, break: 5 }
}

// ==================== 日期范围类型 ====================
export const DATE_RANGE = {
    WEEK: 'WEEK',
    MONTH: 'MONTH',
    DAYS_30: 'DAYS_30',
    DAYS_90: 'DAYS_90',
    ALL: 'ALL'
}

export const DATE_RANGE_LABEL = {
    [DATE_RANGE.WEEK]: '本周',
    [DATE_RANGE.MONTH]: '本月',
    [DATE_RANGE.DAYS_30]: '近30天',
    [DATE_RANGE.DAYS_90]: '近90天',
    [DATE_RANGE.ALL]: '全部'
}

// ==================== 视图类型 ====================
export const TASK_VIEW_TYPE = {
    TODAY: 'TODAY',
    CALENDAR: 'CALENDAR'
}

// ==================== 便签标签页 ====================
export const NOTE_TAB = {
    ACTIVE: 'ACTIVE',
    ARCHIVED: 'ARCHIVED'
}

// ==================== 番茄钟模式 ====================
export const TIMER_MODE = {
    WORK: 'WORK',
    BREAK: 'BREAK'
}

// ==================== 番茄钟预设值范围 ====================
export const POMODORO_LIMITS = {
    WORK_MIN: 1,
    WORK_MAX: 180,
    BREAK_MIN: 1,
    BREAK_MAX: 60
}

// ==================== 密码强度 ====================
export const PASSWORD_STRENGTH = {
    NONE: { label: '', color: 'transparent', value: 0 },
    WEAK: { label: '弱', color: '#DC2626', value: 1 },
    MEDIUM: { label: '中', color: '#D97706', value: 2 },
    STRONG: { label: '强', color: '#16A34A', value: 3 }
}

// ==================== 截止状态 ====================
export const DEADLINE_STATUS = {
    NORMAL: 'NORMAL',
    SOON: 'SOON',
    URGENT: 'URGENT',
    OVERDUE: 'OVERDUE'
}

export const DEADLINE_STATUS_TEXT = {
    [DEADLINE_STATUS.NORMAL]: '',
    [DEADLINE_STATUS.SOON]: '即将截止',
    [DEADLINE_STATUS.URGENT]: '紧急',
    [DEADLINE_STATUS.OVERDUE]: '已逾期'
}

// ==================== 本地存储 Key ====================
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_ID: 'user_id',
    REMEMBER_ME: 'remember_me',
    REMEMBERED_EMAIL: 'remembered_email',
    THEME: 'theme',
    PRIMARY_COLOR: 'primary_color'
}