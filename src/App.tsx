import { useState, useEffect } from 'react'
import './App.css'

interface TimerState {
  timeLeft: number
  isRunning: boolean
  startTime: number | null
}

function App() {
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<number | null>(null)

  // Load timer state from storage on component mount
  useEffect(() => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState) {
        const { timeLeft, isRunning, startTime: storedStartTime } = result.timerState
        
        if (isRunning && storedStartTime) {
          // Calculate elapsed time since timer started
          const elapsedSeconds = Math.floor((Date.now() - storedStartTime) / 1000)
          const newTimeLeft = Math.max(0, timeLeft - elapsedSeconds)
          
          if (newTimeLeft > 0) {
            setTimeLeft(newTimeLeft)
            setIsRunning(true)
            setStartTime(storedStartTime)
          } else {
            // Timer has completed while popup was closed
            showNotification()
            setTimeLeft(10)
            setIsRunning(false)
            setStartTime(null)
            saveTimerState({ timeLeft: 10, isRunning: false, startTime: null })
          }
        } else {
          setTimeLeft(timeLeft)
          setIsRunning(isRunning)
          setStartTime(storedStartTime)
        }
      }
    })
  }, [])

  // Save timer state to storage
  const saveTimerState = (state: TimerState) => {
    chrome.storage.local.set({ timerState: state })
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          const newTime = prevTime - 1
          
          if (newTime <= 0) {
            setIsRunning(false)
            setStartTime(null)
            showNotification()
            saveTimerState({ timeLeft: 10, isRunning: false, startTime: null })
            return 0
          }
          
          // Save current state
          saveTimerState({ timeLeft: newTime, isRunning: true, startTime })
          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, startTime])

  const showNotification = () => {
    // Create notification element
    const notification = document.createElement('div')
    notification.className = 'eye-care-notification'
    notification.innerHTML = `
      <div class="notification-content">
        <div class="notification-icon">👁️</div>
        <div class="notification-text">
          <h3>Time to Blink!</h3>
          <p>Take a 30-second break and blink naturally</p>
        </div>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `
    
    // Add to body
    document.body.appendChild(notification)
    
    // Auto remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove()
      }
    }, 10000)
  }

  const startTimer = () => {
    const now = Date.now()
    setTimeLeft(10)
    setIsRunning(true)
    setStartTime(now)
    saveTimerState({ timeLeft: 10, isRunning: true, startTime: now })
  }

  const stopTimer = () => {
    setIsRunning(false)
    setTimeLeft(10)
    setStartTime(null)
    saveTimerState({ timeLeft: 10, isRunning: false, startTime: null })
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="app-container">
      <h1>Eye Care Timer</h1>
      
      <div className="timer-section">
        <div className="timer-display">
          <span className="time">{formatTime(timeLeft)}</span>
        </div>
        
        <div className="controls">
          {!isRunning ? (
            <button onClick={startTimer} className="start-btn">
              Start Timer
            </button>
          ) : (
            <button onClick={stopTimer} className="stop-btn">
              Stop Timer
            </button>
          )}
        </div>
        
        <p className="instruction">
          Timer will run in background. You'll get a notification when it's time to blink!
        </p>
        
        {isRunning && (
          <div className="status-indicator">
            <span className="status-dot"></span>
            Timer is running...
          </div>
        )}
      </div>
    </div>
  )
}

export default App
