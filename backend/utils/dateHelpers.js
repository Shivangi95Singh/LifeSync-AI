import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

// Convert a Date object into a YYYY-MM-DD string
export const toDateKey = (date) => format(date, "yyyy-MM-dd");

// Get today's date key
export const todayKey = () => toDateKey(new Date());

// Last 90 days
export const last90Days = () => {
  const end = new Date();
  const start = subDays(end, 89); // 90 days including today
  return eachDayOfInterval({ start, end }).map(toDateKey);
};


export const currentWeekDays = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const end = endOfWeek(now, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end }).map(toDateKey);
};

// Last N days
export const lastNDays = (n) => {
  const end = new Date();
  const start = subDays(end, n - 1);
  return eachDayOfInterval({ start, end }).map(toDateKey);
};








// Calculate streaks (current and longest)
export const calcStreak = (sortedDateKeys) => {
  if (!sortedDateKeys.length) return { current: 0, longest: 0 };

  const set = new Set(sortedDateKeys);
  const today = toDateKey();
  const yesterday = toDateKey(subDays(new Date(), 1));

  let current = 0;
  let cursor = new Date();

  // Adjust cursor if today not logged but yesterday is
  if (!set.has(today) && set.has(yesterday)) {
    cursor = subDays(cursor, 1);
  }
  else{
    if(!set.has(today)) cursor=subDays(cursor,1);
    // Count current streak backwards
  while (set.has(toDateKey(cursor))) {
    current += 1;
    cursor = subDays(cursor, 1);
  }
  }

  

  // Calculate longest streak
  const sortedAsc = [...sortedDateKeys].sort();
  let longest = 0;
  let run = 0;
  let prev = null;

  for (const k of sortedAsc) {
    const nd = new Date(d);
    if (prev) {
        const d=new Date(k);
        const p=new Date(prev);
      const diff = Math.round((d - p) / (1000 * 60 * 60 * 24));
       if(diff === 1 ) run +=1 ;
       else run=1;
    } else {
      run = 1;
    }
    if (run > longest) longest = run;
    prev = nd;
  }

  return { current, longest };
};
  