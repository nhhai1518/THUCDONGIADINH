
export const Breakfast_Options = [
  "Hủ tiếu", "Phở", "Bún bò Huế", "Bún riêu", "Bún cá", "Mì", 
  "Bánh mì thịt", "Bánh mì xíu mại", "Bánh mì trứng ốp la", 
  "Cơm tấm", "Xôi mặn", "Bánh bao", "Bún thịt nướng"
];

export const Main_Meal_Options = [
  "Cá rô kho", "Cá lóc kho", "Cá trê kho", "Cá tra kho", "Thịt kho", 
  "Lươn kho", "Lươn nấu mẻ", "Bò nấu mẻ", "Bò nhúng giấm", 
  "Canh chua cá rô", "Canh chua cá trê", "Canh bí", "Canh đu đủ", 
  "Vịt nấu chao", "Gà nấu mẻ", "Bò hấp", "Thịt luộc", "Trứng luộc", 
  "Cá rô nướng muối", "Tôm nướng", "Gà nướng", "Vịt nướng", 
  "Lươn nướng", "Cá trê chiên", "Cá lóc chiên", "Cá điêu hồng chiên", "Rau luộc"
];

export const Evening_Snack_Options = [
  "Bánh flan", "Sữa chua", "Nước cam", "Sô đa cam", "Chuối", 
  "Đu đủ", "Bơ", "Xoài", "Mận", "Thanh long", "Bánh ngọt"
];

export const getOptionsByCategory = (time: string): string[] => {
  if (time === 'Sáng') return Breakfast_Options;
  if (time === 'Tối') return Evening_Snack_Options;
  return Main_Meal_Options; // Lunch and Dinner
};
