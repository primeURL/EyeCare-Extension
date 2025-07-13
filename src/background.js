let timerState = {
  isRunning: false,
  duration: 40 * 1000, // 40 seconds in milliseconds
  startTime: null,
  alarmName: 'eyeCareTimer'
};

chrome.runtime.onInstalled.addListener(() => {
  console.log('Eye Care Timer extension installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'START_TIMER':
      startTimer();
      sendResponse({ success: true, timerState });
      break;
    
    case 'STOP_TIMER':
      stopTimer();
      sendResponse({ success: true, timerState });
      break;
    
    case 'GET_TIMER_STATE':
      sendResponse({ timerState: getCurrentTimerState() });
      break;
    
    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === timerState.alarmName) {
    handleTimerComplete();
  }
});

function startTimer() {
  if (timerState.isRunning) return;
  
  timerState.isRunning = true;
  timerState.startTime = Date.now();
  
  // Create alarm for 40 seconds from now
  chrome.alarms.create(timerState.alarmName, {
    delayInMinutes: 40 / 60 // Convert 40 seconds to minutes
  });
  
  // Save state to storage
  chrome.storage.local.set({ timerState });
  
  console.log('Timer started for 40 seconds');
}

function stopTimer() {
  timerState.isRunning = false;
  timerState.startTime = null;
  
  // Clear the alarm
  chrome.alarms.clear(timerState.alarmName);
  
  // Save state to storage
  chrome.storage.local.set({ timerState });
  
  console.log('Timer stopped');
}

function getCurrentTimerState() {
  if (!timerState.isRunning || !timerState.startTime) {
    return { ...timerState, remainingTime: timerState.duration };
  }
  
  const elapsed = Date.now() - timerState.startTime;
  const remainingTime = Math.max(0, timerState.duration - elapsed);
  
  return {
    ...timerState,
    remainingTime,
    elapsed
  };
}

function handleTimerComplete() {
  console.log('Timer completed! Showing eye care notification');
  
  // Reset timer state
  timerState.isRunning = false;
  timerState.startTime = null;
  chrome.storage.local.set({ timerState });
  
  // Send message to all tabs to show notification
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach(tab => {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SHOW_EYE_CARE_NOTIFICATION'
      }).catch(error => {
        // Ignore errors for tabs that don't have content script
        console.log('Could not send message to tab:', tab.id);
      });
    });
  });
}

// Restore timer state on startup
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
      timerState = result.timerState;
      
      // If timer was running, check if it should have completed
      if (timerState.isRunning && timerState.startTime) {
        const elapsed = Date.now() - timerState.startTime;
        if (elapsed >= timerState.duration) {
          handleTimerComplete();
        } else {
          // Recreate alarm for remaining time
          const remainingMinutes = (timerState.duration - elapsed) / (60 * 1000);
          chrome.alarms.create(timerState.alarmName, {
            delayInMinutes: remainingMinutes
          });
        }
      }
    }
  });
});