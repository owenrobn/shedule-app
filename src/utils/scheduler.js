export function scheduleTasks(tasks, freeTimes) {
  const daysOfWeek = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const sortedFreeTimes = [...freeTimes].sort((a, b) => {
    const dayDiff = daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day);
    if (dayDiff !== 0) return dayDiff;
    return a.start.localeCompare(b.start);
  });

  let schedule = [];
  let freeTimeIndex = 0;

  for (let task of tasks) {
    if (freeTimeIndex < sortedFreeTimes.length) {
      schedule.push({
        ...task,
        scheduled: sortedFreeTimes[freeTimeIndex]
      });
      freeTimeIndex++;
    } else {
      schedule.push({
        ...task,
        scheduled: null
      });
    }
  }
  return schedule;
}