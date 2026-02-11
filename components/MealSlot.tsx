
import React, { useState } from 'react';
import { MealTime, DayOfWeek, MealSlot as MealSlotType } from '../types';
import { getOptionsByCategory } from '../constants';

interface Props {
  day: DayOfWeek;
  time: MealTime;
  slot: MealSlotType;
  onAddDish: (day: DayOfWeek, time: MealTime, dish: string) => void;
  onRemoveDish: (day: DayOfWeek, time: MealTime, dishId: string) => void;
  onToggleLock: (day: DayOfWeek, time: MealTime) => void;
}

const MealSlot: React.FC<Props> = ({ day, time, slot, onAddDish, onRemoveDish, onToggleLock }) => {
  const options = getOptionsByCategory(time);
  const [isAdding, setIsAdding] = useState(false);
  const maxDishes = 5;

  // Use the first dish's image as the background theme
  const backgroundImage = slot.dishes.length > 0 ? slot.dishes[0].imageUrl : undefined;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (e.target.value) {
      onAddDish(day, time, e.target.value);
      e.target.value = ""; // Reset select
      setIsAdding(false);
    }
  };

  return (
    <div className={`
      relative p-2 rounded-xl border-2 transition-all duration-300 group flex flex-col h-full gap-2 min-h-[110px]
      ${slot.isLocked 
        ? 'bg-orange-50/80 border-orange-200 shadow-inner' 
        : 'bg-white/80 border-transparent shadow-sm hover:shadow-md hover:border-teal-200'
      }
    `}>
      {/* Dynamic Background Image */}
      {backgroundImage && (
        <div className="absolute inset-0 rounded-[10px] overflow-hidden pointer-events-none z-0">
           <div 
             className="w-full h-full bg-cover bg-center transition-all duration-500 opacity-20 group-hover:opacity-30 blur-[2px] group-hover:blur-[0.5px]"
             style={{ backgroundImage: `url(${backgroundImage})` }}
           />
           {/* Overlay to ensure text readability */}
           <div className="absolute inset-0 bg-white/50 group-hover:bg-white/30 transition-colors" />
        </div>
      )}

      {/* Header: Time & Controls */}
      <div className="flex justify-between items-center z-10 relative">
        <span className={`text-[10px] font-extrabold uppercase tracking-widest ${
          slot.isLocked ? 'text-orange-500' : 'text-slate-400 group-hover:text-teal-600'
        }`}>
          {time}
        </span>
        <div className="flex items-center gap-1">
          {slot.dishes.length < maxDishes && !slot.isLocked && (
            <button
               onClick={() => setIsAdding(!isAdding)}
               className="p-1 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
               title="Thêm món"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
          <button 
            onClick={() => onToggleLock(day, time)}
            className={`
              p-1.5 rounded-full transition-all duration-200 backdrop-blur-sm
              ${slot.isLocked 
                ? 'text-orange-500 bg-white/80 shadow-sm scale-105' 
                : 'text-slate-300 hover:text-teal-600 hover:bg-teal-50/80 opacity-0 group-hover:opacity-100'
              }
            `}
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
      </div>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col justify-start z-10 gap-1.5">
        
        {/* Empty State */}
        {slot.dishes.length === 0 && !isAdding && (
             <div 
               onClick={() => setIsAdding(true)}
               className="flex-1 flex items-center justify-center text-xs text-slate-400 italic cursor-pointer hover:text-teal-600 transition-colors border border-dashed border-slate-300 rounded-lg hover:border-teal-300 hover:bg-white/50 p-2 min-h-[50px]"
             >
               + Chọn món
             </div>
        )}

        {/* Selected Dishes List */}
        <div className="flex flex-col gap-1.5">
          {slot.dishes.map((dish) => (
            <div 
              key={dish.id} 
              className="group/item flex items-center justify-between bg-white/70 hover:bg-white/95 backdrop-blur-md rounded-lg p-1.5 shadow-sm border border-slate-100 transition-all hover:scale-[1.02] hover:shadow-md hover:border-orange-100"
            >
               <div className="flex items-center gap-2 overflow-hidden">
                  {/* Thumbnail */}
                  <div className="w-6 h-6 rounded bg-slate-200 overflow-hidden flex-shrink-0">
                    {dish.imageUrl ? (
                        <img src={dish.imageUrl} alt={dish.name} className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px]">🥘</div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 truncate">{dish.name}</span>
               </div>
               
               {/* Remove Button */}
               {!slot.isLocked && (
                 <button
                   onClick={() => onRemoveDish(day, time, dish.id)}
                   className="text-slate-300 hover:text-red-500 p-0.5 rounded-full hover:bg-red-50 transition-colors opacity-0 group-hover/item:opacity-100"
                   title="Xóa món này"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                   </svg>
                 </button>
               )}
            </div>
          ))}
        </div>

        {/* Add Dish Dropdown */}
        {isAdding && (
          <div className="animate-fadeIn mt-1">
             <select
                autoFocus
                onBlur={() => { if(slot.dishes.length > 0) setIsAdding(false); }}
                onChange={handleSelectChange}
                className="w-full text-xs p-1.5 rounded-lg border border-teal-300 focus:ring-2 focus:ring-teal-200 outline-none bg-white shadow-lg"
                defaultValue=""
             >
                <option value="" disabled>-- Chọn thêm món --</option>
                {options.map(opt => (
                   <option key={opt} value={opt}>{opt}</option>
                ))}
             </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealSlot;
