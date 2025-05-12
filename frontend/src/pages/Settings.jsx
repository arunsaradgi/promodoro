import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const Settings = () => {
  const { user } = useAuth()
  const [settings, setSettings] = useState({
    workDuration: 25,
    breakDuration: 5,
    longBreakDuration: 15,
    sessionsUntilLongBreak: 4,
    notifications: true,
    sound: true
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.get('http://localhost:5000/api/settings', {
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const newValue = type === 'checkbox' ? checked : Number(value)
    setSettings(prev => ({
      ...prev,
      [name]: newValue
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      console.log('Sending settings:', settings) // Debug log
      const response = await axios.put(
        'http://localhost:5000/api/settings',
        settings,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      )
      console.log('Response:', response.data) // Debug log
      if (response.data) {
        setSettings(response.data)
        toast.success('Settings updated successfully!')
      }
    } catch (error) {
      console.error('Error updating settings:', error.response?.data || error)
      toast.error(error.response?.data?.message || 'Failed to update settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Settings</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Timer Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Timer Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="workDuration" className="block text-sm font-medium text-gray-700">
                  Work Duration (minutes)
                </label>
                <input
                  type="number"
                  id="workDuration"
                  name="workDuration"
                  min="1"
                  max="60"
                  value={settings.workDuration}
                  onChange={handleChange}
                  className="input mt-1"
                />
              </div>
              <div>
                <label htmlFor="breakDuration" className="block text-sm font-medium text-gray-700">
                  Break Duration (minutes)
                </label>
                <input
                  type="number"
                  id="breakDuration"
                  name="breakDuration"
                  min="1"
                  max="30"
                  value={settings.breakDuration}
                  onChange={handleChange}
                  className="input mt-1"
                />
              </div>
              <div>
                <label htmlFor="longBreakDuration" className="block text-sm font-medium text-gray-700">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  id="longBreakDuration"
                  name="longBreakDuration"
                  min="1"
                  max="60"
                  value={settings.longBreakDuration}
                  onChange={handleChange}
                  className="input mt-1"
                />
              </div>
              <div>
                <label htmlFor="sessionsUntilLongBreak" className="block text-sm font-medium text-gray-700">
                  Sessions Until Long Break
                </label>
                <input
                  type="number"
                  id="sessionsUntilLongBreak"
                  name="sessionsUntilLongBreak"
                  min="1"
                  max="10"
                  value={settings.sessionsUntilLongBreak}
                  onChange={handleChange}
                  className="input mt-1"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifications"
                  name="notifications"
                  checked={settings.notifications}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="notifications" className="ml-2 block text-sm text-gray-900">
                  Enable Notifications
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="sound"
                  name="sound"
                  checked={settings.sound}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="sound" className="ml-2 block text-sm text-gray-900">
                  Enable Sound
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings 