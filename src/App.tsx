import { useState, useEffect } from 'react'
import './App.css'


function App() {
  const [remainingTime, setRemainingTime] = useState(40) // 40 seconds
  const [isRunning, setIsRunning] = useState(false)

  // Load timer state from background script on component mount
  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' }, (response) => {
      if (response?.timerState) {
        const state = response.timerState
        setIsRunning(state.isRunning)
        setRemainingTime(Math.ceil(state.remainingTime / 1000)) // Convert to seconds
      }
    })
  }, [])

  // Update timer display every second when running
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning) {
      interval = setInterval(() => {
        chrome.runtime.sendMessage({ type: 'GET_TIMER_STATE' }, (response) => {
          if (response?.timerState) {
            const state = response.timerState
            setIsRunning(state.isRunning)
            setRemainingTime(Math.ceil(state.remainingTime / 1000))
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning])

  const startTimer = () => {
    chrome.runtime.sendMessage({ type: 'START_TIMER' }, (response) => {
      if (response?.success) {
        setIsRunning(true)
        setRemainingTime(40) // Reset to 40 seconds
      }
    })
  }

  const stopTimer = () => {
    chrome.runtime.sendMessage({ type: 'STOP_TIMER' }, (response) => {
      if (response?.success) {
        setIsRunning(false)
        setRemainingTime(40) // Reset to 40 seconds
      }
    })
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
          <span className="time">{formatTime(remainingTime)}</span>
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
          Timer runs for 40 seconds in background. You'll get a notification when it's time to blink!
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
