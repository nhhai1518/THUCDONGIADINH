
import React, { useState, useCallback, useEffect } from 'react';
import { WeeklyPlan, DAYS, MEAL_TIMES, DayOfWeek, MealTime } from './types';
import { Breakfast_Options, Main_Meal_Options, Evening_Snack_Options } from './constants';
import MealSlot from './components/MealSlot';
import { generateAIPlan } from './services/geminiService';

const App: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<WeeklyPlan>(() => {
    const initialPlan: any = {};
    DAYS.forEach(day => {
      initialPlan[day] = {};
      MEAL_TIMES.forEach(time => {
        initialPlan[day][time] = { dish: '', isLocked: false };
      });
    });
    return initialPlan as WeeklyPlan;
  });

  const [isLoading, setIsLoading] = useState(false);

  const getRandomDish = (time: MealTime) => {
    let options: string[] = [];
    if (time === 'Sáng') options = Breakfast_Options;
    else if (time === 'Tối') options = Evening_Snack_Options;
    else options = Main_Meal_Options;
    return options[Math.floor(Math.random() * options.length)];
  };

  const randomizeAll = useCallback(() => {
    setMealPlan(prev => {
      const newPlan = { ...prev };
      DAYS.forEach(day => {
        MEAL_TIMES.forEach(time => {
          if (!newPlan[day][time].isLocked) {
            newPlan[day][time] = { ...newPlan[day][time], dish: getRandomDish(time) };
          }
        });
      });
      return newPlan;
    });
  }, []);

  const handleAIRecommend = async () => {
    setIsLoading(true);
    try {
      const newPlan = await generateAIPlan(mealPlan);
      setMealPlan(newPlan);
    } catch (error) {
      console.error("AI Error:", error);
      alert("Không thể kết nối với AI. Đang sử dụng ngẫu nhiên thay thế.");
      randomizeAll();
    } finally {
      setIsLoading(false);
    }
  };

  const updateMeal = (day: DayOfWeek, time: MealTime, dish: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: { ...prev[day][time], dish }
      }
    }));
  };

  const toggleLock = (day: DayOfWeek, time: MealTime) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: { ...prev[day][time], isLocked: !prev[day][time].isLocked }
      }
    }));
  };

  useEffect(() => {
    randomizeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Thực Đơn Gia Đình</h1>
              <p className="text-xs text-slate-500 font-medium">Lên kế hoạch dinh dưỡng mỗi tuần</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleAIRecommend}
              disabled={isLoading}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 shadow-md shadow-emerald-200"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              AI Đề Xuất
            </button>
            <button
              onClick={randomizeAll}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Xáo Trộn
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Bữa Ăn</th>
                {DAYS.map(day => (
                  <th key={day} className="p-4 text-sm font-bold text-slate-700 border-l border-slate-200">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TIMES.map(time => (
                <tr key={time} className="border-b border-slate-100 last:border-0">
                  <td className="p-4 bg-slate-50/40 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-600">{time}</span>
                    </div>
                  </td>
                  {DAYS.map(day => (
                    <td key={`${day}-${time}`} className="p-2 border-l border-slate-100 min-w-[160px]">
                      <MealSlot 
                        day={day} 
                        time={time} 
                        slot={mealPlan[day][time]} 
                        onUpdate={updateMeal}
                        onToggleLock={toggleLock}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {DAYS.map(day => (
            <div key={day} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col">
              <div className="bg-slate-800 text-white px-4 py-3 font-bold text-sm">
                {day}
              </div>
              <div className="p-4 grid grid-cols-1 gap-3">
                {MEAL_TIMES.map(time => (
                  <MealSlot 
                    key={`${day}-${time}-mobile`}
                    day={day} 
                    time={time} 
                    slot={mealPlan[day][time]} 
                    onUpdate={updateMeal}
                    onToggleLock={toggleLock}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Instructions */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white px-4 py-2 rounded-full text-xs font-medium backdrop-blur-sm shadow-xl flex items-center gap-3">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          Có thể thay đổi món trực tiếp
        </span>
        <div className="w-[1px] h-3 bg-white/20"></div>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-orange-500"></div>
          Khóa món để giữ lại khi xáo trộn
        </span>
      </div>
    </div>
  );
};

export default App;
