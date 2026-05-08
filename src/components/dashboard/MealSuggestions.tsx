'use client';

import { useEffect, useState } from 'react';
import { Profile } from '@/lib/types';
import { ChefHat, Flame, Clock, Star, Sparkles, ArrowRight, RefreshCw, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpoonacularRecipe {
  id: number;
  title: string;
  image: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  nutrition?: {
    nutrients: Array<{
      name: string;
      amount: number;
      unit: string;
    }>;
  };
  diets?: string[];
  healthScore?: number;
}

interface MealDisplay {
  id: number;
  name: string;
  calories: number;
  time: string;
  tags: string[];
  image: string;
  protein: number;
  match: number;
  sourceUrl: string;
}

const FALLBACK_SUGGESTIONS: MealDisplay[] = [
  {
    id: 1,
    name: 'Quinoa Buddha Bowl',
    calories: 450,
    time: '15 min',
    tags: ['Vegan', 'Gluten-Free', 'High Fiber'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=400&auto=format&fit=crop',
    protein: 18,
    match: 95,
    sourceUrl: '',
  },
  {
    id: 2,
    name: 'Grilled Salmon & Asparagus',
    calories: 520,
    time: '20 min',
    tags: ['Keto', 'High Protein', 'Gluten-Free'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=400&auto=format&fit=crop',
    protein: 42,
    match: 88,
    sourceUrl: '',
  },
  {
    id: 3,
    name: 'Avocado Toast with Egg',
    calories: 380,
    time: '10 min',
    tags: ['Vegetarian', 'Healthy Fats'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=400&auto=format&fit=crop',
    protein: 14,
    match: 82,
    sourceUrl: '',
  },
  {
    id: 4,
    name: 'Mediterranean Chickpea Salad',
    calories: 320,
    time: '8 min',
    tags: ['Vegan', 'High Fiber', 'Low Cal'],
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=400&auto=format&fit=crop',
    protein: 12,
    match: 78,
    sourceUrl: '',
  },
];

function mapDietaryRestrictions(restrictions: string[]): { diet: string; intolerances: string } {
  const dietMap: Record<string, string> = {
    'Vegetarian': 'vegetarian',
    'Vegan': 'vegan',
    'Keto': 'ketogenic',
    'Paleo': 'paleo',
    'Low-Carb': 'low carb',
  };
  
  const intoleranceMap: Record<string, string> = {
    'Gluten-Free': 'gluten',
    'Dairy-Free': 'dairy',
    'Nut-Free': 'tree nut,peanut',
    'Soy-Free': 'soy',
    'Egg-Free': 'egg',
  };

  const diets: string[] = [];
  const intolerances: string[] = [];

  restrictions.forEach(r => {
    if (dietMap[r]) diets.push(dietMap[r]);
    if (intoleranceMap[r]) intolerances.push(intoleranceMap[r]);
  });

  return {
    diet: diets[0] || '',
    intolerances: intolerances.join(','),
  };
}

function transformRecipe(recipe: SpoonacularRecipe, profile: Profile): MealDisplay {
  const calories = recipe.nutrition?.nutrients.find(n => n.name === 'Calories')?.amount || 0;
  const protein = recipe.nutrition?.nutrients.find(n => n.name === 'Protein')?.amount || 0;
  
  let matchScore = recipe.healthScore || 70;
  
  if (profile.goal === 'lose' && calories < profile.daily_calorie_target / 3) {
    matchScore += 10;
  } else if (profile.goal === 'gain' && protein > 25) {
    matchScore += 10;
  }
  
  matchScore = Math.min(99, Math.max(50, matchScore));

  const tags = recipe.diets?.slice(0, 3).map(d => 
    d.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  ) || [];

  return {
    id: recipe.id,
    name: recipe.title,
    calories: Math.round(calories),
    time: `${recipe.readyInMinutes} min`,
    tags,
    image: recipe.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=400&auto=format&fit=crop',
    protein: Math.round(protein),
    match: Math.round(matchScore),
    sourceUrl: recipe.sourceUrl,
  };
}

export function MealSuggestions({ profile }: { profile: Profile }) {
  const [meals, setMeals] = useState<MealDisplay[]>(FALLBACK_SUGGESTIONS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

    const fetchMeals = async () => {
      try {
        const { diet, intolerances } = mapDietaryRestrictions(profile.dietary_restrictions || []);
        
        const params = new URLSearchParams({ number: '6' });
        if (diet) params.append('diet', diet);
        if (intolerances) params.append('intolerances', intolerances);
        if (profile.daily_calorie_target) {
          params.append('maxCalories', String(Math.round(profile.daily_calorie_target / 3)));
        }

        const response = await fetch(`/api/recipes?${params.toString()}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn('Meal suggestions unavailable:', errorData.message || 'API error');
          return; // Stay with fallback suggestions
        }
        
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const transformed = data.results.map((r: SpoonacularRecipe) => transformRecipe(r, profile));
          transformed.sort((a: MealDisplay, b: MealDisplay) => b.match - a.match);
          setMeals(transformed);
        }
      } catch (error) {
        console.warn('Failed to fetch meals, using fallbacks');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

  useEffect(() => {
    fetchMeals();
  }, [profile.dietary_restrictions, profile.daily_calorie_target, profile.goal]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMeals();
  };

  const handleViewRecipe = (url: string) => {
    if (url) {
      window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url } }, "*");
    }
  };

  const displayList = meals.length > 0 ? meals : FALLBACK_SUGGESTIONS;
  const bestMatch = displayList[0];

  return (
    <section className="space-y-6 px-5 pb-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative glass-card rounded-[28px] p-5 overflow-hidden"
      >
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-primary/30 blur-[60px] rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-cyan-400/20 blur-[60px] rounded-full" />
        
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold">Best for You Right Now</h3>
            <p className="text-[10px] text-muted-foreground">Based on your goals</p>
          </div>
          <div className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs font-bold text-primary">{bestMatch.match}%</span>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative w-28 h-28 rounded-2xl overflow-hidden flex-shrink-0">
            {loading ? (
              <div className="w-full h-full bg-secondary animate-pulse" />
            ) : (
              <img src={bestMatch.image} alt={bestMatch.name} className="w-full h-full object-cover" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-2 left-2 right-2">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-white/80" strokeWidth={1.5} />
                <span className="text-[10px] text-white/80 font-medium">{bestMatch.time}</span>
              </div>
            </div>
          </div>
          
          <div className="flex-grow min-w-0 py-1">
            <h4 className="font-bold text-base mb-2 leading-tight line-clamp-2">{loading ? 'Loading...' : bestMatch.name}</h4>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500" strokeWidth={1.5} />
                <span className="text-xs font-semibold">{bestMatch.calories} kcal</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <span className="text-xs text-muted-foreground">{bestMatch.protein}g protein</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {bestMatch.tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase tracking-wide">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleViewRecipe(bestMatch.sourceUrl)}
          disabled={!bestMatch.sourceUrl}
          className="w-full mt-4 h-11 rounded-2xl gradient-primary flex items-center justify-center gap-2 text-white font-semibold text-sm shadow-lg glow-sm disabled:opacity-50"
        >
          View Recipe
          <ExternalLink className="w-4 h-4" strokeWidth={2} />
        </motion.button>
      </motion.div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-muted-foreground" strokeWidth={1.5} />
          <h3 className="text-base font-bold">More Suggestions</h3>
        </div>
        <button 
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-primary disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={2} />
          Refresh
        </button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide -mx-5 px-5">
        {displayList.slice(1).map((meal, i) => (
          <motion.div 
            key={meal.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleViewRecipe(meal.sourceUrl)}
            className="min-w-[200px] glass-card rounded-[24px] overflow-hidden flex-shrink-0 group cursor-pointer"
          >
            <div className="h-32 relative overflow-hidden">
              {loading ? (
                <div className="w-full h-full bg-secondary animate-pulse" />
              ) : (
                <img 
                  src={meal.image} 
                  alt={meal.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full glass">
                  <Flame className="w-3 h-3 text-orange-400" strokeWidth={1.5} />
                  <span className="text-[10px] font-bold text-white">{meal.calories}</span>
                </div>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">{meal.name}</h4>
              </div>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" strokeWidth={1.5} />
                  <span className="text-[10px] font-medium">{meal.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[10px] font-bold text-primary">{meal.match}%</span>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {meal.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-[8px] font-semibold px-1.5 py-0.5 rounded-md bg-secondary text-muted-foreground uppercase">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
