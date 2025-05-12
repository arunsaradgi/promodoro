import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const Analytics = () => {
  const [sessions, setSessions] = useState([])
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalMinutes: 0,
    averageSessionLength: 0,
    longestStreak: 0
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(response.data)
      calculateStats(response.data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  const calculateStats = (sessions) => {
    const totalMinutes = sessions.reduce((sum, session) => sum + session.duration, 0)
    const totalSessions = sessions.length
    const averageSessionLength = totalSessions > 0 ? totalMinutes / totalSessions : 0

    // Calculate longest streak
    let currentStreak = 0
    let longestStreak = 0
    let lastDate = null

    sessions.forEach((session) => {
      const sessionDate = new Date(session.startTime).toDateString()
      if (lastDate === null) {
        currentStreak = 1
      } else if (sessionDate === lastDate) {
        currentStreak++
      } else {
        currentStreak = 1
      }
      longestStreak = Math.max(longestStreak, currentStreak)
      lastDate = sessionDate
    })

    setStats({
      totalSessions,
      totalMinutes,
      averageSessionLength: Math.round(averageSessionLength),
      longestStreak
    })
  }

  const prepareChartData = () => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    }).reverse()

    const dailyMinutes = last7Days.map(date => {
      return sessions
        .filter(session => session.startTime.startsWith(date))
        .reduce((sum, session) => sum + session.duration, 0)
    })

    return {
      labels: last7Days.map(date => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })),
      datasets: [
        {
          label: 'Minutes Focused',
          data: dailyMinutes,
          borderColor: 'rgb(14, 165, 233)',
          backgroundColor: 'rgba(14, 165, 233, 0.5)',
          tension: 0.4
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Focus Time Last 7 Days'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Minutes'
        }
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Total Sessions</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalSessions}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Total Minutes</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.totalMinutes}</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Average Session</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.averageSessionLength}m</p>
        </div>
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900">Longest Streak</h3>
          <p className="text-3xl font-bold text-primary-600">{stats.longestStreak} days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="card">
        <Line data={prepareChartData()} options={chartOptions} />
      </div>
    </div>
  )
}

export default Analytics 