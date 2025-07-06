import type { ITEMS, RECIPES } from "@/data/itemDatabase";
import { useState } from "react";

export function usePlanner(items: typeof ITEMS, recipies: typeof RECIPES) {
    const [planner, setPlanner] = useState<Array<{ item: typeof ITEMS[0]; needed: number; have: number; recipeId?: string }>>([]);

    const handleRemoveFromPlanner = (itemId: string, recipeId?: string) => {
        setPlanner(prev => prev.filter(p => !(p.item.id === itemId && p.recipeId === recipeId)));
    };
    // Update needed/have
    const handlePlannerChange = (idx: number, field: 'needed' | 'have', value: number) => {
        setPlanner(prev => {
            const updated = [...prev];
            updated[idx][field] = value;
            return updated;
        });
    };

    // Add item to planner (with recipe and quantity)
    const handleAddToPlanner = (item: typeof ITEMS[0], recipeId?: string, quantity: number = 1) => {
        setPlanner(prev => {
            const idx = prev.findIndex(p => p.item.id === item.id && p.recipeId === recipeId);
            if (idx !== -1) {
                // If already in planner, just increase needed
                const updated = [...prev];
                updated[idx].needed += quantity;
                return updated;
            }
            return [...prev, { item, needed: quantity, have: 0, recipeId }];
        });
        // If recipeId is provided, add all ingredients to planner as well
        if (recipeId) {
            const recipe = recipies.find(r => r.id === recipeId);
            if (recipe) {
                recipe.ingredients.forEach(ing => {
                    const ingItem = items.find(i => i.id === ing.resourceId);
                    if (ingItem) {
                        setPlanner(prev => {
                            const idx = prev.findIndex(p => p.item.id === ingItem.id);
                            if (idx !== -1) {
                                // If already in planner, just increase needed
                                const updated = [...prev];
                                updated[idx].needed += ing.quantity * quantity;
                                return updated;
                            }
                            return [...prev, { item: ingItem, needed: ing.quantity * quantity, have: 0 }];
                        });
                    }
                });
            }
        }
    };

    return {
        planner,
        setPlanner,
        handleRemoveFromPlanner,
        handlePlannerChange,
        handleAddToPlanner
    };
}
