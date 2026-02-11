
export type MealCategory = 'Breakfast' | 'Main' | 'Snack';

export type MealTime = 'Sáng' | 'Trưa' | 'Chiều' | 'Tối';

export type DayOfWeek = 'Thứ Hai' | 'Thứ Ba' | 'Thứ Tư' | 'Thứ Năm' | 'Thứ Sáu' | 'Thứ Bảy' | 'Chủ Nhật';

export interface MealSlot {
  dish: string;
  isLocked: boolean;
}

export type WeeklyPlan = {
  [key in DayOfWeek]: {
    [key in MealTime]: MealSlot;
  };
};

export const DAYS: DayOfWeek[] = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
export const MEAL_TIMES: MealTime[] = ['Sáng', 'Trưa', 'Chiều', 'Tối'];
