export type Goal = 'lose' | 'maintain' | 'gain';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  goal: Goal;
  dietary_restrictions: string[];
  daily_calorie_target: number;
  weight_kg?: number;
  height_cm?: number;
  age?: number;
  gender?: string;
  motto?: string;
  is_admin?: boolean;
  created_at: string;
}

export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
  portion_size?: string;
}

export interface Meal {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  photo_url?: string;
  food_items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  total_fiber: number;
  created_at: string;
}

export interface DailyStats {
  id: string;
  user_id: string;
  date: string;
  steps: number;
  exercise_minutes: number;
  calories_burned: number;
  created_at?: string;
}

export type GoalType = 'weight' | 'nutrition' | 'fitness' | 'habit';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface UserGoal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: GoalType;
  target_value?: number;
  current_value: number;
  unit?: string;
  start_date: string;
  target_date?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}
