<template>
  <div class="daily-statistics-card">
    <div class="card-header">
      <span class="card-icon">📊</span>
      <span class="card-title">每日统计</span>
    </div>

    <div class="chart-container" ref="chartRef"></div>

    <div class="stat-list">
      <div v-for="item in dailyStats" :key="item.date" class="stat-row">
        <div class="stat-date">
          <span class="weather-emoji">{{ getWeatherEmoji(index) }}</span>
          <span>{{ formatDate(item.date) }}</span>
        </div>
        <div class="stat-badge">
          <span class="badge-icon">🍅</span>
          <span>{{ item.sessionCount }}个</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
})

const chartRef = ref(null)
let chartInstance = null

const dailyStats = ref(props.data)

// 天气表情（用于美化）
const weatherEmojis = ['🌞', '⛅', '🌧️', '🌤️', '🌙']

const getWeatherEmoji = (index) => {
  return weatherEmojis[index % weatherEmojis.length]
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  // 处理 YYYY-MM-DD 格式
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    return `${parts[1]}/${parts[2]}`
  }
  return dateStr.substring(5, 10)
}

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(chartRef.value)

  const dates = dailyStats.value.map(item => formatDate(item.date))
  const sessions = dailyStats.value.map(item => item.sessionCount || 0)
  const minutes = dailyStats.value.map(item => Math.round(item.totalMinutes / 60) || 0)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['番茄钟个数', '专注时长(小时)'],
      bottom: 0,
      itemWidth: 20,
      itemHeight: 12,
      textStyle: { color: '#6A7B6E' }
    },
    grid: {
      left: '10%',
      right: '8%',
      top: '15%',
      bottom: '12%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLabel: {
        rotate: 45,
        fontSize: 11,
        color: '#9CA3AF'
      },
      axisLine: { lineStyle: { color: '#E5E7EB' } }
    },
    yAxis: [
      {
        type: 'value',
        name: '番茄钟个数',
        nameTextStyle: { fontSize: 12, color: '#6A7B6E' },
        axisLabel: { fontSize: 11, color: '#9CA3AF' },
        splitLine: { lineStyle: { color: '#F3F4F6' } }
      },
      {
        type: 'value',
        name: '专注时长(小时)',
        nameTextStyle: { fontSize: 12, color: '#6A7B6E' },
        axisLabel: { fontSize: 11, color: '#9CA3AF' },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '番茄钟个数',
        type: 'bar',
        data: sessions,
        itemStyle: {
          borderRadius: [6, 6, 0, 0],
          color: '#FFD166'
        },
        barWidth: '40%'
      },
      {
        name: '专注时长(小时)',
        type: 'line',
        yAxisIndex: 1,
        data: minutes,
        smooth: true,
        lineStyle: {
          width: 2,
          color: '#8FBC8F'
        },
        symbol: 'circle',
        symbolSize: 8,
        itemStyle: {
          color: '#8FBC8F',
          borderColor: '#fff',
          borderWidth: 2
        },
        areaStyle: {
          opacity: 0.1,
          color: '#8FBC8F'
        }
      }
    ]
  }

  chartInstance.setOption(option)
}

// 监听数据变化
watch(() => props.data, (newData) => {
  dailyStats.value = newData
  if (chartInstance) {
    initChart()
  }
}, { deep: true })

// 监听窗口大小变化
const handleResize = () => {
  chartInstance?.resize()
}

onMounted(() => {
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }
})
</script>

<style scoped>
.daily-statistics-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.card-icon {
  font-size: 18px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2C3E2E;
}

.chart-container {
  width: 100%;
  height: 280px;
  margin-bottom: 20px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: #F5F9F5;
  border-radius: 12px;
}

.stat-date {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #2C3E2E;
}

.weather-emoji {
  font-size: 14px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  background: rgba(255, 209, 102, 0.15);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  color: #B88C00;
}

.badge-icon {
  font-size: 13px;
}
</style>