import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [timeLeft, setTimeLeft] = useState(10)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            setIsRunning(false)
            showNotification()
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft])

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
    setTimeLeft(10)
    setIsRunning(true)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setTimeLeft(30)
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
