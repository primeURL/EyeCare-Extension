import './index.css'

import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import ContentPage from './content/content'

const root = document.createElement('div')
root.id = '__reminder_popup_container__'
document.body.append(root)

createRoot(root).render(
  <StrictMode>
    <ContentPage />
  </StrictMode>
)

chrome.runtime.onMessage.addListener((message) => {
  console.log('msg',message)
  if (message.type === "SHOW_EYE_CARE_NOTIFICATION") {
    showBlinkReminder();
  }
});

function showBlinkReminder() {
  // Remove any existing notification
  const existingNotification = document.querySelector('.eye-care-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'eye-care-notification';
  
  // Create countdown timer for 10 seconds
  let countdown = 10;
  
  notification.innerHTML = `
    <div class="notification-content">
      <div class="notification-icon">👁️</div>
      <div class="notification-text">
        <h3>Time to Blink!</h3>
        <p>Take a 10-second break and blink naturally</p>
        <div class="countdown-timer">
          <span class="countdown-number">${countdown}</span>
          <span class="countdown-label">seconds remaining</span>
        </div>
      </div>
      <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
  `;
  
  // Add notification to body
  document.body.appendChild(notification);
  
  // Countdown timer
  const countdownInterval = setInterval(() => {
    countdown--;
    const countdownElement = notification.querySelector('.countdown-number');
    if (countdownElement) {
      countdownElement.textContent = countdown.toString();
    }
    
    if (countdown <= 0) {
      clearInterval(countdownInterval);
      // Add completion animation
      notification.classList.add('completed');
      
      // Auto-remove after showing completion
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 2000);
    }
  }, 1000);
  
  // Auto-remove after 12 seconds total (10 + 2 for completion)
  setTimeout(() => {
    clearInterval(countdownInterval);
    if (notification.parentElement) {
      notification.remove();
    }
  }, 12000);
}