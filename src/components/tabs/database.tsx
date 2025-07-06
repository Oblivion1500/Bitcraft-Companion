import type { ITEMS, RECIPES } from "@/data/itemDatabase";
import { useInventory } from "@/hooks/inventory";
import { usePlanner } from "@/hooks/planner";
import { useState } from "react";

interface DatabaseProps {
    items: typeof ITEMS;
    recipies: typeof RECIPES;
    showPopup: (message: string) => void;
}

export function DatabaseTab(props: DatabaseProps) {
    const [tierFilter, setTierFilter] = useState<number | null>(null);
    const [addQuantity, setAddQuantity] = useState(1);
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    // --- Collapsible state for Recipe Database ---
    const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

    // Filter items by tier and search
    const filteredItems = props.items.filter(item => {
        const matchesTier = tierFilter === null || item.tier === tierFilter;
        const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTier && matchesSearch;
    });

    const { handleAddToPlanner } = usePlanner(props.items, props.recipies);
    const { handleAddToInventory } = useInventory();

    return (
        <section>
            <h2>Recipe Database</h2>
            <div style={{ marginBottom: 16 }}>
                <label>Filter by Tier: </label>
                <select value={tierFilter ?? ''} onChange={e => setTierFilter(e.target.value ? Number(e.target.value) : null)}>
                    <option value=''>All</option>
                    {[...new Set(props.items.map(i => i.tier))].sort((a, b) => a - b).map(tier => (
                        <option key={tier} value={tier}>{tier}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    style={{ marginLeft: 16, padding: 4, width: 200 }}
                />
            </div>
            <ul className="item-list">
                {filteredItems.map(item => (
                    <li key={item.id} className="item-row" style={{ cursor: 'pointer', flexDirection: 'column', alignItems: 'stretch' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}>
                            <span>
                                {item.name} <span style={{ color: '#888', marginLeft: 8 }}>Tier {item.tier}</span>
                            </span>
                            <span style={{ fontSize: 18, color: '#e3b873', marginLeft: 12 }}>{expandedItemId === item.id ? '▲' : '▼'}</span>
                        </div>
                        {expandedItemId === item.id && (
                            <div className="item-details-modal" style={{ marginTop: 12 }}>
                                <h3>{item.name}</h3>
                                <p>Tier: {item.tier}</p>
                                {item.rarity && <p>Rarity: {item.rarity}</p>}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                    <button onClick={() => {
                                        handleAddToPlanner(item, undefined, addQuantity);
                                        props.showPopup(`${item.name} (x${addQuantity}) added to Craft Planner`);
                                    }}>Add to Craft Planner</button>
                                    <button onClick={() => {
                                        handleAddToInventory(item, addQuantity);
                                        props.showPopup(`${item.name} (x${addQuantity}) added to Inventory`);
                                    }}>Add to Inventory</button>
                                    <input type="number" min={1} value={addQuantity} style={{ width: 50 }} onChange={e => setAddQuantity(Number(e.target.value))} />
                                </div>
                                {/* Show recipes that produce this item */}
                                <div style={{ marginTop: 12 }}>
                                    <h4>Recipes that produce this item:</h4>
                                    <div style={{ marginBottom: 8 }}>
                                        <label>Select recipe:&nbsp;</label>
                                        <select
                                            value={selectedRecipeId || ''}
                                            onChange={e => setSelectedRecipeId(e.target.value)}
                                        >
                                            <option value="">-- Choose a recipe --</option>
                                            {/* Show all recipes that output this item first */}
                                            {props.recipies.filter(r => r.output.resourceId === item.id).map(recipe => (
                                                <option key={recipe.id} value={recipe.id}>{recipe.name} (Profession: {recipe.profession})</option>
                                            ))}
                                            {/* Then show all other recipes for custom selection */}
                                            <optgroup label="All Recipes">
                                                {props.recipies.filter(r => r.output.resourceId !== item.id).map(recipe => (
                                                    <option key={recipe.id} value={recipe.id}>{recipe.name} (Profession: {recipe.profession})</option>
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                    {selectedRecipeId && (() => {
                                        const recipe = props.recipies.find(r => r.id === selectedRecipeId);
                                        if (!recipe) return null;
                                        return (
                                            <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                                                {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                                                {recipe.name && recipe.name.trim() && recipe.name !== item.name && recipe.name !== undefined ? <strong>{recipe.name}</strong> : null}
                                                {recipe.name && recipe.name.trim() && recipe.name !== item.name && recipe.name !== undefined ? ' ' : ''}(Profession: {recipe.profession})
                                                <div>Ingredients:
                                                    <ul>
                                                        {recipe.ingredients.map(ing => {
                                                            const ingItem = props.items.find(i => i.id === ing.resourceId);
                                                            return (
                                                                <li key={ing.resourceId}>
                                                                    <span
                                                                        style={{ color: '#007bff', textDecoration: 'underline', cursor: 'pointer' }}
                                                                        onClick={() => setExpandedItemId(ingItem ? ingItem.id : null)}
                                                                    >
                                                                        {ingItem ? ingItem.name : ing.resourceId}
                                                                    </span> x{ing.quantity}
                                                                </li>
                                                            );
                                                        })}
                                                    </ul>
                                                </div>
                                                <button style={{ marginTop: 4 }} onClick={() => {
                                                    handleAddToPlanner(item, recipe.id, addQuantity);
                                                    props.showPopup(`${item.name} (x${addQuantity}) added to Craft Planner`);
                                                }}>Add to Craft Planner</button>
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    )
}