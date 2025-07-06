import type { ITEMS, RECIPES } from "@/data/itemDatabase";
import { useState } from "react";
import { CustomIngredientAdder } from "../adders/custom-ingredient";
import { usePlanner } from "@/hooks/planner";
import { useInventory } from "@/hooks/inventory";

interface PlannerProps {
    items: typeof ITEMS;
    recipies: typeof RECIPES
}

export function PlannerTab(props: PlannerProps) {
    // --- Custom ingredient state for planner items ---
    const [customIngredients, setCustomIngredients] = useState<Record<string, Array<{ id: string; name: string; qty: number }>>>({});

    const { planner, setPlanner, handleRemoveFromPlanner, handlePlannerChange } = usePlanner(props.items, props.recipies);
    const { inventory } = useInventory()

    return (
        <section>
            <h2>Craft Planner</h2>
            <ul>
                {planner.map((entry, idx) => (
                    <li key={entry.item.id + (entry.recipeId || '')} style={{ marginBottom: 24 }}>
                        <strong>{entry.item.name}</strong> (Tier {entry.item.tier})
                        {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                        {entry.recipeId && (() => {
                            const recipeName = props.recipies.find(r => r.id === entry.recipeId)?.name;
                            return recipeName && recipeName.trim() && recipeName !== entry.item.name && recipeName !== undefined ? (
                                <span style={{ color: '#888', marginLeft: 8 }}>
                                    [Recipe: {recipeName}]
                                </span>
                            ) : null;
                        })()}
                        <div style={{ display: 'inline-block', marginLeft: 16 }}>
                            Needed: <input type="number" min={0} value={entry.needed} style={{ width: 50 }} onChange={e => handlePlannerChange(idx, 'needed', Number(e.target.value))} />
                            &nbsp;Have: <span style={{ width: 50, display: 'inline-block' }}>{
                                inventory?.find(i => i.item.id === entry.item.id)?.quantity || 0
                            }</span>
                            <button style={{ marginLeft: 8 }} onClick={() => handleRemoveFromPlanner(entry.item.id, entry.recipeId)}>Remove</button>
                        </div>
                        {/* Custom ingredient adder - now centered and stacked for better UX */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '12px 0 8px 0' }}>
                            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                                <span style={{ color: 'var(--bc-accent)', fontWeight: 600 }}>Add custom ingredient:</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                                <CustomIngredientAdder
                                    items={props.items}
                                    onAdd={(customItem, qty) => {
                                        setCustomIngredients(prev => {
                                            const list = prev[entry.item.id] ? [...prev[entry.item.id]] : [];
                                            const idx = list.findIndex(ci => ci.id === customItem.id);
                                            if (idx !== -1) {
                                                list[idx].qty += qty;
                                            } else {
                                                list.push({ id: customItem.id, name: customItem.name, qty });
                                            }
                                            return { ...prev, [entry.item.id]: list };
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--bc-accent2)', margin: '8px 0 16px 0' }} />
                        {/* Show recipes for this item */}
                        <div style={{ marginTop: 0, marginLeft: 32, background: '#f9f9f900', borderRadius: 4, padding: 8 }}>
                            <strong>Recipes to craft this item:</strong>
                            {props.recipies.filter(r => r.output.resourceId === entry.item.id).length === 0 && (!customIngredients[entry.item.id] || customIngredients[entry.item.id].length === 0) ? (
                                <div style={{ color: '#888' }}>No recipes found for this item.</div>
                            ) : (
                                <ul>
                                    {props.recipies.filter(r => r.output.resourceId === entry.item.id).map(recipe => (
                                        <li key={recipe.id} style={{ marginBottom: 8 }}>
                                            {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                                            {recipe.name && recipe.name.trim() && recipe.name !== entry.item.name && recipe.name !== undefined ? <strong>{recipe.name}</strong> : null}
                                            {recipe.name && recipe.name.trim() && recipe.name !== entry.item.name && recipe.name !== undefined ? ' ' : ''}(Profession: {recipe.profession})
                                            <div>Ingredients:
                                                <ul>
                                                    {recipe.ingredients.map(ing => {
                                                        const ingItem = props.items.find(i => i.id === ing.resourceId);
                                                        return (
                                                            <li key={ing.resourceId}>
                                                                {ingItem ? ingItem.name : ing.resourceId} x{ing.quantity}
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        </li>
                                    ))}
                                    {/* Show custom ingredients for this item */}
                                    {customIngredients[entry.item.id]?.length > 0 && (
                                        <li style={{ marginBottom: 8 }}>
                                            <strong>Custom Ingredients:</strong>
                                            <ul>
                                                {customIngredients[entry.item.id].map(ci => (
                                                    <li key={ci.id}>{ci.name} x{ci.qty}</li>
                                                ))}
                                            </ul>
                                        </li>
                                    )}
                                </ul>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <div style={{ marginBottom: 16 }}>
                <button onClick={() => {
                    const data = JSON.stringify({ planner, customIngredients }, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'bitcraft-craft-planner.json';
                    a.click();
                    URL.revokeObjectURL(url);
                }}>Download Planner</button>
                <input
                    type="file"
                    accept="application/json"
                    style={{ marginLeft: 12 }}
                    onChange={e => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = evt => {
                            try {
                                const json = JSON.parse(evt.target?.result as string);
                                if (json.planner && Array.isArray(json.planner)) setPlanner(json.planner);
                                if (json.customIngredients && typeof json.customIngredients === 'object') setCustomIngredients(json.customIngredients);
                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            } catch (err) {
                                alert('Invalid planner JSON file.');
                            }
                        };
                        reader.readAsText(file);
                    }}
                />
            </div>
        </section>
    )
}