
export const Breakfast_Options = [
  "Hủ tiếu Nam Vang", "Phở Bò", "Bún bò Huế", "Bún riêu cua", "Bún cá", "Mì Quảng", 
  "Bánh mì thịt nướng", "Bánh mì xíu mại", "Bánh mì ốp la", 
  "Cơm tấm sườn bì", "Xôi mặn", "Bánh bao trứng cút", "Bún thịt nướng"
];

export const Main_Meal_Options = [
  "Cá rô kho tộ", "Cá lóc kho tiêu", "Thịt kho tàu", 
  "Lươn xào sả ớt", "Canh chua cá lóc", "Bò kho", "Bò nhúng giấm", 
  "Canh bí đỏ thịt bằm", "Canh đu đủ giò heo", 
  "Vịt nấu chao", "Gà chiên nước mắm", "Bò lúc lắc", "Thịt luộc cà pháo", "Trứng chiên thịt", 
  "Tôm nướng muối ớt", "Gà nướng lu", "Sườn non ram mặn", 
  "Cá diêu hồng chiên xù", "Rau muống xào tỏi", "Đậu hũ nhồi thịt"
];

export const Evening_Snack_Options = [
  "Bánh flan", "Sữa chua nếp cẩm", "Nước ép cam", "Sinh tố bơ", "Chè thái", 
  "Trái cây dĩa", "Rau câu dừa", "Xoài lắc", "Bánh tráng trộn", "Sữa đậu nành"
];

export const getOptionsByCategory = (time: string): string[] => {
  if (time === 'Sáng') return Breakfast_Options;
  if (time === 'Tối') return Evening_Snack_Options;
  return Main_Meal_Options; // Lunch and Dinner
};

// Use Pollinations AI for accurate food images based on text description
export const getDishImage = (dishName: string) => {
  if (!dishName) return '';
  
  // Encode the dish name for the URL
  const encodedName = encodeURIComponent(`delicious vietnamese food ${dishName} close up high quality`);
  
  // Using Pollinations.ai which generates images on the fly based on prompts.
  // Adding 'nologo=true' and fixing dimensions.
  // Random seed added to URL to ensure React sees it as stable unless we change it, 
  // but here we want it stable per dish name so we don't use a random seed.
  // Pollinations caches based on prompt.
  return `https://image.pollinations.ai/prompt/${encodedName}?width=400&height=300&nologo=true&seed=${dishName.length}`;
};
