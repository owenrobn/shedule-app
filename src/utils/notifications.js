export function requestNotificationPermission() {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
}

export function sendTaskNotification(task, slot) {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Task Reminder", {
      body: `${task.name} - ${slot.day} ${slot.start} to ${slot.end}`,
    });
  }
}