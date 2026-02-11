
import React, { useState, useCallback, useEffect } from 'react';
import { WeeklyPlan, DAYS, MEAL_TIMES, DayOfWeek, MealTime, Dish } from './types';
import { Breakfast_Options, Main_Meal_Options, Evening_Snack_Options, getDishImage } from './constants';
import MealSlot from './components/MealSlot';
import { generateAIPlan } from './services/geminiService';

interface SavedPlan {
  id: string;
  name: string;
  plan: WeeklyPlan;
  date: string;
  emoji: string;
  color: string;
}

const PLAN_EMOJIS = ['🥗', '🥘', '🍜', '🍱', '🍛', '🍲', '🍝', '🍖', '🍤', '🥓'];
const PLAN_COLORS = [
  'bg-orange-100 text-orange-600',
  'bg-teal-100 text-teal-600',
  'bg-rose-100 text-rose-600',
  'bg-blue-100 text-blue-600',
  'bg-yellow-100 text-yellow-600',
  'bg-purple-100 text-purple-600',
];

const App: React.FC = () => {
  const [mealPlan, setMealPlan] = useState<WeeklyPlan>(() => {
    const initialPlan: any = {};
    DAYS.forEach(day => {
      initialPlan[day] = {};
      MEAL_TIMES.forEach(time => {
        initialPlan[day][time] = { dishes: [], isLocked: false };
      });
    });
    return initialPlan as WeeklyPlan;
  });

  const [isLoading, setIsLoading] = useState(false);
  
  // Local Storage State
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [planNameInput, setPlanNameInput] = useState('');

  // Load saved plans on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('saved_meal_plans');
      if (saved) {
        // Simple migration check: if saved data uses old 'dish' string structure, we ignore or convert it ideally.
        // For simplicity in this demo, we assume data structure is compatible or we catch errors.
        const parsed = JSON.parse(saved);
        // Validating structure could be added here
        setSavedPlans(parsed);
      }
    } catch (error) {
      console.error("Failed to load plans", error);
    }
  }, []);

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
            const randomDish = getRandomDish(time);
            newPlan[day][time] = { 
              ...newPlan[day][time], 
              dishes: [{
                id: Math.random().toString(36).substr(2, 9),
                name: randomDish,
                imageUrl: getDishImage(randomDish)
              }]
            };
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

  const handleAddDish = (day: DayOfWeek, time: MealTime, dishName: string) => {
    setMealPlan(prev => {
      const currentSlot = prev[day][time];
      // Limit to 5 dishes
      if (currentSlot.dishes.length >= 5) return prev;
      
      const newDish: Dish = {
        id: Math.random().toString(36).substr(2, 9),
        name: dishName,
        imageUrl: getDishImage(dishName)
      };

      return {
        ...prev,
        [day]: {
          ...prev[day],
          [time]: {
            ...currentSlot,
            dishes: [...currentSlot.dishes, newDish]
          }
        }
      };
    });
  };

  const handleRemoveDish = (day: DayOfWeek, time: MealTime, dishId: string) => {
    setMealPlan(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [time]: {
          ...prev[day][time],
          dishes: prev[day][time].dishes.filter(d => d.id !== dishId)
        }
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

  const handleSavePlan = () => {
    if (!planNameInput.trim()) return;
    
    const randomEmoji = PLAN_EMOJIS[Math.floor(Math.random() * PLAN_EMOJIS.length)];
    const randomColor = PLAN_COLORS[Math.floor(Math.random() * PLAN_COLORS.length)];

    const newPlan: SavedPlan = {
      id: Date.now().toString(),
      name: planNameInput.trim(),
      plan: mealPlan,
      date: new Date().toLocaleDateString('vi-VN'),
      emoji: randomEmoji,
      color: randomColor
    };

    const updatedPlans = [newPlan, ...savedPlans];
    setSavedPlans(updatedPlans);
    localStorage.setItem('saved_meal_plans', JSON.stringify(updatedPlans));
    
    setPlanNameInput('');
    setShowSaveModal(false);
  };

  const handleLoadPlan = (plan: WeeklyPlan) => {
    // Basic check to ensure loaded plan has 'dishes' array (migration support)
    const migratedPlan = { ...plan };
    DAYS.forEach(day => {
      MEAL_TIMES.forEach(time => {
        const slot: any = migratedPlan[day][time];
        if (!slot.dishes && slot.dish) {
           // Convert old string format to new array format
           migratedPlan[day][time] = {
             isLocked: slot.isLocked,
             dishes: [{
               id: 'legacy-' + Math.random(),
               name: slot.dish,
               imageUrl: slot.imageUrl || getDishImage(slot.dish)
             }]
           };
        } else if (!slot.dishes) {
            migratedPlan[day][time] = { isLocked: slot.isLocked || false, dishes: [] };
        }
      });
    });

    setMealPlan(migratedPlan);
    setShowLoadModal(false);
  };

  const handleDeletePlan = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(confirm("Bạn có chắc muốn xóa thực đơn này không?")) {
        const updatedPlans = savedPlans.filter(p => p.id !== id);
        setSavedPlans(updatedPlans);
        localStorage.setItem('saved_meal_plans', JSON.stringify(updatedPlans));
    }
  };

  useEffect(() => {
    randomizeAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-orange-50/60 pb-20 relative font-sans text-slate-800">
      {/* Decorative Background Elements */}
      <div className="fixed top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-100 to-transparent -z-10 opacity-60"></div>
      
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200 transform rotate-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 tracking-tight">Bếp Nhà Mình</h1>
              <p className="text-xs text-slate-500 font-medium tracking-wide uppercase">Thực đơn cho tuần vui vẻ</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowLoadModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-teal-300 hover:text-teal-600 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Thư Viện
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:border-orange-300 hover:text-orange-600 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Lưu
            </button>
            <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
            <button
              onClick={handleAIRecommend}
              disabled={isLoading}
              className="group flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-slate-200 active:scale-95"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300 group-hover:text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              )}
              AI Gợi Ý
            </button>
            <button
              onClick={randomizeAll}
              className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Đổi Món
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {/* Desktop Table View */}
        <div className="hidden lg:block overflow-hidden rounded-3xl border border-white bg-white/60 backdrop-blur-sm shadow-xl shadow-orange-100/50">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-orange-50/80 border-b border-orange-100">
                <th className="p-5 text-xs font-extrabold text-orange-400 uppercase tracking-widest w-32">
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    Giờ ăn
                  </span>
                </th>
                {DAYS.map(day => (
                  <th key={day} className="p-5 text-sm font-display font-bold text-slate-700 border-l border-orange-100 text-center">
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MEAL_TIMES.map((time, idx) => (
                <tr key={time} className={`border-b border-orange-50 last:border-0 ${idx % 2 === 0 ? 'bg-white/40' : 'bg-white/20'}`}>
                  <td className="p-4 align-middle">
                    <div className="flex flex-col items-center justify-center gap-1 bg-white rounded-xl py-3 px-2 shadow-sm border border-slate-100">
                      <span className="text-sm font-bold text-slate-600">{time}</span>
                    </div>
                  </td>
                  {DAYS.map(day => (
                    <td key={`${day}-${time}`} className="p-2 border-l border-orange-50 min-w-[200px]">
                      <MealSlot 
                        day={day} 
                        time={time} 
                        slot={mealPlan[day][time]} 
                        onAddDish={handleAddDish}
                        onRemoveDish={handleRemoveDish}
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
            <div key={day} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-200/50 flex flex-col">
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-5 py-4 font-display font-bold text-lg flex justify-between items-center">
                {day}
                <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse"></div>
              </div>
              <div className="p-4 grid grid-cols-1 gap-3 bg-slate-50/50 flex-1">
                {MEAL_TIMES.map(time => (
                  <MealSlot 
                    key={`${day}-${time}-mobile`}
                    day={day} 
                    time={time} 
                    slot={mealPlan[day][time]} 
                    onAddDish={handleAddDish}
                    onRemoveDish={handleRemoveDish}
                    onToggleLock={toggleLock}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Action Bar (Bottom) */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
        <div className="bg-slate-800/90 text-white pl-4 pr-1 py-1 rounded-full text-xs font-medium backdrop-blur-md shadow-xl flex items-center border border-slate-700">
             <span className="mr-3">Trạng thái:</span>
             <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-white border border-slate-400"></div>
                <span>Sửa</span>
             </div>
             <div className="flex items-center gap-2 px-3 py-1.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]"></div>
                <span>Đã khóa</span>
             </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-[fadeIn_0.3s_ease-out]">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-500 rounded-full mb-4 mx-auto">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </div>
            <h3 className="text-xl font-display font-bold text-center text-slate-900 mb-2">Lưu Thực Đơn</h3>
            <p className="text-center text-slate-500 mb-6 text-sm">Đặt một cái tên dễ nhớ cho thực đơn tuần này nhé!</p>
            
            <input
              type="text"
              value={planNameInput}
              onChange={(e) => setPlanNameInput(e.target.value)}
              placeholder="VD: Tuần ăn kiêng, Tuần tiệc tùng..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none mb-6 font-medium text-slate-800 transition-all"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleSavePlan()}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-3 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSavePlan}
                className="px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-200"
              >
                Lưu ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Modal (Redesigned as Grid of Cards) */}
      {showLoadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-50 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-[fadeIn_0.3s_ease-out] border border-white/20">
            {/* Modal Header */}
            <div className="bg-white px-8 py-6 border-b border-slate-200 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-display font-bold text-slate-800">Thư Viện Thực Đơn</h3>
                <p className="text-slate-500 text-sm mt-1">Chọn thực đơn bạn đã lưu trước đây</p>
              </div>
              <button onClick={() => setShowLoadModal(false)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors text-slate-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content - Grid */}
            <div className="overflow-y-auto p-8 bg-slate-50">
              {savedPlans.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                   <div className="w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center mb-4 text-4xl grayscale opacity-50">🍽️</div>
                   <h4 className="text-lg font-bold text-slate-600">Chưa có thực đơn nào</h4>
                   <p className="text-slate-400 mt-2 max-w-xs mx-auto">Hãy tạo một thực đơn ưng ý và nhấn nút "Lưu" để xem lại ở đây nhé.</p>
                   <button onClick={() => setShowLoadModal(false)} className="mt-6 text-teal-600 font-bold hover:underline">Quay lại tạo thực đơn</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedPlans.map((plan, index) => (
                    <div 
                      key={plan.id} 
                      onClick={() => handleLoadPlan(plan.plan)}
                      style={{ animationDelay: `${index * 0.05}s` }}
                      className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-xl hover:border-teal-400 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden animate-[slideUp_0.4s_ease-out_both]"
                    >
                      {/* Decorative Background Icon */}
                      <div className="absolute -right-6 -top-6 text-[100px] opacity-[0.03] select-none pointer-events-none group-hover:opacity-[0.08] transition-opacity">
                        {plan.emoji || '📅'}
                      </div>

                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${plan.color || 'bg-slate-100'}`}>
                          {plan.emoji || '🥘'}
                        </div>
                        <button
                          onClick={(e) => handleDeletePlan(plan.id, e)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors z-20"
                          title="Xóa thực đơn này"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="relative z-10">
                        <h4 className="font-display font-bold text-lg text-slate-800 mb-1 group-hover:text-teal-700 transition-colors truncate pr-2">
                            {plan.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          {plan.date}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <span className="text-xs font-bold text-teal-600">Nhấn để chọn</span>
                            <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="bg-white p-4 border-t border-slate-200 text-center">
                <button 
                    onClick={() => setShowLoadModal(false)}
                    className="text-slate-500 text-sm font-semibold hover:text-slate-800 transition-colors"
                >
                    Đóng cửa sổ
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
