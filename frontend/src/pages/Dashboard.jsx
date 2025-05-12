import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import axios from 'axios'
import config from '../config'

const Dashboard = () => {
  const [timeLeft, setTimeLeft] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [sessions, setSessions] = useState([])
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4
  })
  const [sessionCount, setSessionCount] = useState(0)

  useEffect(() => {
    fetchSettings()
    fetchSessions()
  }, [])

  useEffect(() => {
    // Initialize timer with current settings
    setTimeLeft(settings.workDuration * 60)
  }, [settings])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${config.apiUrl}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data) {
        setSettings(response.data)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to fetch settings')
    }
  }

  const fetchSessions = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get(`${config.apiUrl}/sessions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSessions(response.data)
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  useEffect(() => {
    let timer
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      handleTimerComplete()
    }
    return () => clearInterval(timer)
  }, [isRunning, timeLeft])

  const handleTimerComplete = async () => {
    if (!isBreak) {
      // Save session
      try {
        const token = localStorage.getItem('token')
        await axios.post(
          `${config.apiUrl}/sessions`,
          { 
            type: 'work',
            duration: settings.workDuration
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
        toast.success('Session completed!')
        fetchSessions()
        setSessionCount(prev => prev + 1)
      } catch (error) {
        console.error('Error saving session:', error)
      }
    }

    // Switch between work and break
    setIsBreak(!isBreak)
    const isLongBreak = !isBreak && (sessionCount + 1) % settings.sessionsUntilLongBreak === 0
    setTimeLeft(isBreak ? settings.workDuration * 60 : (isLongBreak ? settings.longBreakDuration : settings.breakDuration) * 60)
    setIsRunning(false)
  }

  const toggleTimer = () => {
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setTimeLeft(isBreak ? settings.breakDuration * 60 : settings.workDuration * 60)
    setIsRunning(false)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="space-y-8">
      {/* Timer Section */}
      <div className="card">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isBreak ? 'Break Time' : 'Focus Time'}
          </h2>
          <div className="text-6xl font-bold text-primary-600 mb-8">
            {formatTime(timeLeft)}
          </div>
          <div className="space-x-4">
            <button
              onClick={toggleTimer}
              className="btn btn-primary"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button
              onClick={resetTimer}
              className="btn btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Recent Sessions */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Sessions</h2>
        <div className="space-y-4">
          {sessions.map((session) => (
            <div
              key={session._id}
              className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {new Date(session.startTime).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  {new Date(session.startTime).toLocaleTimeString()}
                </p>
              </div>
              <div className="text-primary-600 font-medium">
                {session.duration} minutes
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No sessions recorded yet
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard 