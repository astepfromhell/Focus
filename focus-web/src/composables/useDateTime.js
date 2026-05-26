import { formatDate, formatTime, formatRelativeTime, getWeekdayText, formatChineseDate } from '@/utils/dateTime'

export function useDateTime() {
    return {
        formatDate,
        formatTime,
        formatRelativeTime,
        getWeekdayText,
        formatChineseDate
    }
}