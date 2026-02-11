
import React from 'react';
import { MealTime, DayOfWeek, MealSlot as MealSlotType } from '../types';
import { getOptionsByCategory } from '../constants';

interface Props {
  day: DayOfWeek;
  time: MealTime;
  slot: MealSlotType;
  onUpdate: (day: DayOfWeek, time: MealTime, dish: string) => void;
  onToggleLock: (day: DayOfWeek, time: MealTime) => void;
}

const MealSlot: React.FC<Props> = ({ day, time, slot, onUpdate, onToggleLock }) => {
  const options = getOptionsByCategory(time);

  return (
    <div className={`p-3 rounded-lg border transition-all duration-200 group flex flex-col h-full gap-2 ${
      slot.isLocked ? 'bg-orange-50 border-orange-200' : 'bg-white border-slate-200 hover:border-emerald-300'
    }`}>
      <div className="flex justify-between items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{time}</span>
        <button 
          onClick={() => onToggleLock(day, time)}
          className={`p-1 rounded-md transition-colors ${
            slot.isLocked ? 'text-orange-500 bg-orange-100' : 'text-slate-300 hover:text-emerald-500 hover:bg-emerald-50'
          }`}
          title={slot.isLocked ? "Mở khóa" : "Khóa món này"}
        >
          {slot.isLocked ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          )}
        </button>
      </div>

      <select
        value={slot.dish}
        onChange={(e) => onUpdate(day, time, e.target.value)}
        className={`w-full text-sm font-medium bg-transparent focus:outline-none cursor-pointer ${
          slot.isLocked ? 'text-orange-900' : 'text-slate-700 hover:text-emerald-600'
        }`}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
};

export default MealSlot;
