
import { GoogleGenAI, Type } from "@google/genai";
import { WeeklyPlan, DAYS, MEAL_TIMES } from "../types";
import { Breakfast_Options, Main_Meal_Options, Evening_Snack_Options } from "../constants";

export const generateAIPlan = async (currentPlan: WeeklyPlan): Promise<WeeklyPlan> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    Hãy giúp tôi lên thực đơn 7 ngày cho gia đình Việt Nam. 
    Các lựa chọn bữa sáng: ${Breakfast_Options.join(", ")}.
    Các lựa chọn bữa chính (Trưa/Chiều): ${Main_Meal_Options.join(", ")}.
    Các lựa chọn tráng miệng/ăn nhẹ (Tối): ${Evening_Snack_Options.join(", ")}.
    
    Quy tắc:
    1. Chỉ chọn từ danh sách đã cho.
    2. Một số món đã được 'locked' (giữ nguyên), không được thay đổi chúng.
    3. Đảm bảo sự đa dạng, không trùng món quá nhiều trong 1 ngày.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          plan: {
            type: Type.OBJECT,
            properties: DAYS.reduce((acc: any, day) => {
              acc[day] = {
                type: Type.OBJECT,
                properties: MEAL_TIMES.reduce((mAcc: any, time) => {
                  mAcc[time] = { type: Type.STRING };
                  return mAcc;
                }, {})
              };
              return acc;
            }, {})
          }
        }
      }
    }
  });

  const aiData = JSON.parse(response.text || '{}');
  const newPlan = { ...currentPlan };

  if (aiData.plan) {
    DAYS.forEach(day => {
      MEAL_TIMES.forEach(time => {
        if (!newPlan[day][time].isLocked && aiData.plan[day]?.[time]) {
          newPlan[day][time].dish = aiData.plan[day][time];
        }
      });
    });
  }

  return newPlan;
};
