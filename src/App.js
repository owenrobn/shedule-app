import React, { useState, useEffect } from "react";
import TaskInput from "./components/TaskInput";
import FreeTimeInput from "./components/FreeTimeInput";
import { scheduleTasks } from "./utils/scheduler";
import { saveData, loadData } from "./utils/storage";
import { requestNotificationPermission, sendTaskNotification } from "./utils/notifications";
import { gapi } from "gapi-script";

const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
console.log("Google Client ID:", clientId);

function App() {
  // Google Auth state
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [gapiReady, setGapiReady] = useState(false);

  useEffect(() => {
    function start() {
      gapi.client.init({
        clientId: clientId,
        scope: "https://www.googleapis.com/auth/calendar.events"
      }).then(() => {
        const authInstance = gapi.auth2.getAuthInstance();
        if (authInstance) {
          setIsSignedIn(authInstance.isSignedIn.get());
          setUser(authInstance.currentUser.get());
          authInstance.isSignedIn.listen(setIsSignedIn);
          authInstance.currentUser.listen(setUser);
          setGapiReady(true);
        } else {
          console.error("Google Auth instance is null");
        }
      });
    }
    gapi.load("client:auth2", start);
  }, []);

  const handleLogin = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
      authInstance.signIn();
    }
  };

  const handleLogout = () => {
    const authInstance = gapi.auth2.getAuthInstance();
    if (authInstance) {
      authInstance.signOut();
    }
  };

  // State for tasks and free times
  const [tasks, setTasks] = useState(() => loadData("tasks"));
  const [freeTimes, setFreeTimes] = useState(() => loadData("freeTimes"));
  // State for editing tasks and slots
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingTask, setEditingTask] = useState({ name: "", days: 1 });
  const [editingSlotId, setEditingSlotId] = useState(null);
  const [editingSlot, setEditingSlot] = useState({ day: "Monday", start: "", end: "" });

  // Save to local storage whenever tasks or freeTimes change
  useEffect(() => {
    saveData("tasks", tasks);
  }, [tasks]);
  useEffect(() => {
    saveData("freeTimes", freeTimes);
  }, [freeTimes]);

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  // Add handlers
  const handleAddTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: Date.now() }]);
  };
  const handleAddFreeTime = (slot) => {
    setFreeTimes((prev) => [...prev, { ...slot, id: Date.now() }]);
  };

  // Edit Task Handlers
  const startEditTask = (task) => {
    setEditingTaskId(task.id);
    setEditingTask({ name: task.name, days: task.days });
  };
  const saveEditTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...editingTask } : t));
    setEditingTaskId(null);
  };
  const deleteTask = (id) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  // Edit Slot Handlers
  const startEditSlot = (slot) => {
    setEditingSlotId(slot.id);
    setEditingSlot({ day: slot.day, start: slot.start, end: slot.end });
  };
  const saveEditSlot = (id) => {
    setFreeTimes(freeTimes.map(s => s.id === id ? { ...s, ...editingSlot } : s));
    setEditingSlotId(null);
  };
  const deleteSlot = (id) => {
    setFreeTimes(freeTimes.filter(s => s.id !== id));
  };

  // Generate the schedule
  const scheduledTasks = scheduleTasks(tasks, freeTimes);

  return (
    <div style={{ maxWidth: 500, margin: "2rem auto", padding: "1rem", border: "1px solid #ccc", borderRadius: 8 }}>
      <h1>Organizer & Alarm App</h1>
      {/* Google Auth Section */}
      <div style={{ marginBottom: "1rem" }}>
        {gapiReady ? (
          isSignedIn ? (
            <div>
              <p>Signed in as {user && user.getBasicProfile().getEmail()}</p>
              <button onClick={handleLogout}>Sign out</button>
            </div>
          ) : (
            <button onClick={handleLogin}>Sign in with Google</button>
          )
        ) : (
          <p>Loading Google Sign-In...</p>
        )}
      </div>
      <TaskInput onAddTask={handleAddTask} />
      <FreeTimeInput onAddFreeTime={handleAddFreeTime} />
      <h2>Tasks</h2>
      <ul>
        {tasks.length === 0 && <li>No tasks yet.</li>}
        {tasks.map((task) =>
          editingTaskId === task.id ? (
            <li key={task.id}>
              <input
                type="text"
                value={editingTask.name}
                onChange={e => setEditingTask({ ...editingTask, name: e.target.value })}
              />
              <input
                type="number"
                min="1"
                value={editingTask.days}
                onChange={e => setEditingTask({ ...editingTask, days: Number(e.target.value) })}
                style={{ width: "60px", marginLeft: "0.5rem" }}
              />
              <button onClick={() => saveEditTask(task.id)} style={{ marginLeft: "0.5rem" }}>Save</button>
              <button onClick={() => setEditingTaskId(null)} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            </li>
          ) : (
            <li key={task.id}>
              {task.name} (expires in {task.days} day{task.days > 1 ? "s" : ""})
              <button onClick={() => startEditTask(task)} style={{ marginLeft: "0.5rem" }}>Edit</button>
              <button onClick={() => deleteTask(task.id)} style={{ marginLeft: "0.5rem" }}>Delete</button>
            </li>
          )
        )}
      </ul>
      <h2>Free Time Slots</h2>
      <ul>
        {freeTimes.length === 0 && <li>No free time slots yet.</li>}
        {freeTimes.map((slot) =>
          editingSlotId === slot.id ? (
            <li key={slot.id}>
              <select
                value={editingSlot.day}
                onChange={e => setEditingSlot({ ...editingSlot, day: e.target.value })}
              >
                {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <input
                type="time"
                value={editingSlot.start}
                onChange={e => setEditingSlot({ ...editingSlot, start: e.target.value })}
                style={{ marginLeft: "0.5rem" }}
              />
              <input
                type="time"
                value={editingSlot.end}
                onChange={e => setEditingSlot({ ...editingSlot, end: e.target.value })}
                style={{ marginLeft: "0.5rem" }}
              />
              <button onClick={() => saveEditSlot(slot.id)} style={{ marginLeft: "0.5rem" }}>Save</button>
              <button onClick={() => setEditingSlotId(null)} style={{ marginLeft: "0.5rem" }}>Cancel</button>
            </li>
          ) : (
            <li key={slot.id}>
              {slot.day}: {slot.start} - {slot.end}
              <button onClick={() => startEditSlot(slot)} style={{ marginLeft: "0.5rem" }}>Edit</button>
              <button onClick={() => deleteSlot(slot.id)} style={{ marginLeft: "0.5rem" }}>Delete</button>
            </li>
          )
        )}
      </ul>
      <h2>Schedule</h2>
      <ul>
        {scheduledTasks.length === 0 && <li>No scheduled tasks yet.</li>}
        {scheduledTasks.map((task) => (
          <li key={task.id}>
            {task.name}{" "}
            {task.scheduled
              ? `→ ${task.scheduled.day} ${task.scheduled.start}-${task.scheduled.end}`
              : "(no slot available)"}
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          scheduledTasks.forEach((task) => {
            if (task.scheduled) {
              sendTaskNotification(task, task.scheduled);
            }
          });
        }}
        style={{ margin: "1rem 0" }}
      >
        Test Notifications
      </button>
    </div>
  );
}

export default App;
