import React, { useState } from "react";

const FreeTimeInput = ({ onAddFreeTime }) => {
  const [day, setDay] = useState("Monday");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!start || !end) return;
    onAddFreeTime({ day, start, end });
    setStart("");
    setEnd("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <select value={day} onChange={e => setDay(e.target.value)}>
        {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
      <input
        type="time"
        value={start}
        onChange={e => setStart(e.target.value)}
        required
        style={{ marginLeft: "0.5rem" }}
      />
      <span style={{ margin: "0 0.5rem" }}>to</span>
      <input
        type="time"
        value={end}
        onChange={e => setEnd(e.target.value)}
        required
      />
      <button type="submit" style={{ marginLeft: "1rem" }}>
        Add Free Time
      </button>
    </form>
  );
};

export default FreeTimeInput;