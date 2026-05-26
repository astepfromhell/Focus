const db = require('./index');

const DEFAULT_SETTINGS = {
  pomodoroDuration: 25,
  shortBreak: 5,
  longBreak: 15,
  autoStartBreak: false,
  autoStartPomodoro: false,
  enableNotifications: true,
  notificationSound: true,
  soundVolume: 50,
  theme: 'light',
  primaryColor: '#FF6B6B',
  backgroundImageUrl: null,
  fontSize: 'medium',
  language: 'zh-CN',
  dataRetentionDays: 365,
};

const columnMap = {
  pomodoroDuration: 'pomodoro_duration',
  shortBreak: 'short_break',
  longBreak: 'long_break',
  autoStartBreak: 'auto_start_break',
  autoStartPomodoro: 'auto_start_pomodoro',
  enableNotifications: 'enable_notifications',
  notificationSound: 'notification_sound',
  soundVolume: 'sound_volume',
  theme: 'theme',
  primaryColor: 'primary_color',
  backgroundImageUrl: 'background_image_url',
  fontSize: 'font_size',
  language: 'language',
  dataRetentionDays: 'data_retention_days',
};

const toCamel = (row = {}) => ({
  id: row.id,
  pomodoroDuration: row.pomodoro_duration,
  shortBreak: row.short_break,
  longBreak: row.long_break,
  autoStartBreak: !!row.auto_start_break,
  autoStartPomodoro: !!row.auto_start_pomodoro,
  enableNotifications: !!row.enable_notifications,
  notificationSound: !!row.notification_sound,
  soundVolume: row.sound_volume,
  theme: row.theme,
  primaryColor: row.primary_color,
  backgroundImageUrl: row.background_image_url,
  fontSize: row.font_size,
  language: row.language,
  dataRetentionDays: row.data_retention_days,
});

const mapToDb = (payload = {}) => {
  const fields = {};
  Object.entries(columnMap).forEach(([key, column]) => {
    if (payload[key] !== undefined) fields[column] = payload[key];
  });
  return fields;
};

const UserSettings = {
  DEFAULT_SETTINGS,

  async createDefault(userId) {
    const data = mapToDb(DEFAULT_SETTINGS);
    const sql = `INSERT INTO user_settings (user_id, ${Object.keys(data).join(', ')}) VALUES (${['?'].concat(Object.keys(data).map(() => '?')).join(', ')})`;
    const values = [userId, ...Object.values(data)];
    await db.query(sql, values);
    return this.getByUserId(userId);
  },

  async getByUserId(userId) {
    const sql = 'SELECT * FROM user_settings WHERE user_id = ? LIMIT 1';
    const [rows] = await db.query(sql, [userId]);
    if (!rows[0]) return null;
    return toCamel(rows[0]);
  },

  async updateByUserId(userId, payload = {}) {
    const fields = mapToDb(payload);
    if (!Object.keys(fields).length) return this.getByUserId(userId);
    const sets = Object.keys(fields).map((key) => `${key} = ?`).join(', ');
    const sql = `UPDATE user_settings SET ${sets} WHERE user_id = ?`;
    await db.query(sql, [...Object.values(fields), userId]);
    return this.getByUserId(userId);
  },

  async resetToDefault(userId) {
    return this.updateByUserId(userId, DEFAULT_SETTINGS);
  },
};

module.exports = UserSettings;
