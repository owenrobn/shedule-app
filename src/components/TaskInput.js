import React, { useState } from "react";

const TaskInput = ({ onAddTask }) => {
  const [name, setName] = useState("");
  const [days, setDays] = useState(1);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddTask({ name, days: Number(days) });
    setName("");
    setDays(1);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Task name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        min="1"
        value={days}
        onChange={(e) => setDays(e.target.value)}
        style={{ width: "60px", marginLeft: "0.5rem" }}
        required
      />
      <span style={{ marginLeft: "0.5rem" }}>days in scheduler</span>
      <button type="submit" style={{ marginLeft: "1rem" }}>
        Add Task
      </button>
    </form>
  );
};

export default TaskInput;