import React, { useState } from 'react';
import { PROFESSIONS, SKILLS } from './data/initialData';
import { ITEMS, RECIPES } from './data/itemDatabase';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'inventory' | 'database'>('planner');
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [selectedItem, setSelectedItem] = useState<typeof ITEMS[0] | null>(null);
  const [planner, setPlanner] = useState<Array<{ item: typeof ITEMS[0]; needed: number; have: number; recipeId?: string }>>([]);
  const [addQuantity, setAddQuantity] = useState(1);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // --- Custom ingredient state for planner items ---
  const [customIngredients, setCustomIngredients] = useState<Record<string, Array<{ id: string; name: string; qty: number }>>>({});

  // --- Inventory state ---
  const [inventory, setInventory] = useState<Array<{ item: typeof ITEMS[0]; quantity: number }>>([]);

  // --- Collapsible state for Recipe Database ---
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  // Filter items by tier and search
  const filteredItems = ITEMS.filter(item => {
    const matchesTier = tierFilter === null || item.tier === tierFilter;
    const matchesSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTier && matchesSearch;
  });

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
      const recipe = RECIPES.find(r => r.id === recipeId);
      if (recipe) {
        recipe.ingredients.forEach(ing => {
          const ingItem = ITEMS.find(i => i.id === ing.resourceId);
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

  // Remove item from planner
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

  // Add item to inventory (from database)
  const handleAddToInventory = (item: typeof ITEMS[0], quantity: number = 1) => {
    setInventory(prev => {
      const idx = prev.findIndex(i => i.item.id === item.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantity += quantity;
        return updated;
      }
      return [...prev, { item, quantity }];
    });
  };

  // Update inventory quantity
  const handleInventoryChange = (idx: number, value: number) => {
    setInventory(prev => {
      const updated = [...prev];
      updated[idx].quantity = value;
      return updated;
    });
  };

  // Remove item from inventory
  const handleRemoveFromInventory = (itemId: string) => {
    setInventory(prev => prev.filter(i => i.item.id !== itemId));
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Bitcraft Companion Dashboard</h1>
        <nav className="dashboard-tabs">
          <button
            className={activeTab === 'planner' ? 'active' : ''}
            onClick={() => setActiveTab('planner')}
          >
            Craft Planner
          </button>
          <button
            className={activeTab === 'inventory' ? 'active' : ''}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory
          </button>
          <button
            className={activeTab === 'database' ? 'active' : ''}
            onClick={() => setActiveTab('database')}
          >
            Recipe Database
          </button>
        </nav>
      </header>
      <main>
        {activeTab === 'planner' && (
          <section>
            <h2>Craft Planner</h2>
            <ul>
              {planner.map((entry, idx) => (
                <li key={entry.item.id + (entry.recipeId || '')} style={{ marginBottom: 24 }}>
                  <strong>{entry.item.name}</strong> (Tier {entry.item.tier})
                  {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                  {entry.recipeId && (() => {
                    const recipeName = RECIPES.find(r => r.id === entry.recipeId)?.name;
                    return recipeName && recipeName.trim() && recipeName !== entry.item.name && recipeName !== undefined ? (
                      <span style={{ color: '#888', marginLeft: 8 }}>
                        [Recipe: {recipeName}]
                      </span>
                    ) : null;
                  })()}
                  <div style={{ display: 'inline-block', marginLeft: 16 }}>
                    Needed: <input type="number" min={0} value={entry.needed} style={{ width: 50 }} onChange={e => handlePlannerChange(idx, 'needed', Number(e.target.value))} />
                    &nbsp;Have: <span style={{ width: 50, display: 'inline-block' }}>{
                      inventory.find(i => i.item.id === entry.item.id)?.quantity || 0
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
                        items={ITEMS}
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
                    {RECIPES.filter(r => r.output.resourceId === entry.item.id).length === 0 && (!customIngredients[entry.item.id] || customIngredients[entry.item.id].length === 0) ? (
                      <div style={{ color: '#888' }}>No recipes found for this item.</div>
                    ) : (
                      <ul>
                        {RECIPES.filter(r => r.output.resourceId === entry.item.id).map(recipe => (
                          <li key={recipe.id} style={{ marginBottom: 8 }}>
                            {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                            {recipe.name && recipe.name.trim() && recipe.name !== entry.item.name && recipe.name !== undefined ? <strong>{recipe.name}</strong> : null}
                            {recipe.name && recipe.name.trim() && recipe.name !== entry.item.name && recipe.name !== undefined ? ' ' : ''}(Profession: {recipe.profession})
                            <div>Ingredients:
                              <ul>
                                {recipe.ingredients.map(ing => {
                                  const ingItem = ITEMS.find(i => i.id === ing.resourceId);
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
                    } catch (err) {
                      alert('Invalid planner JSON file.');
                    }
                  };
                  reader.readAsText(file);
                }}
              />
            </div>
          </section>
        )}
        {activeTab === 'inventory' && (
          <section>
            <h2>Inventory</h2>
            <InventoryAdder items={ITEMS} onAdd={handleAddToInventory} />
            <ul>
              {inventory.map((entry, idx) => (
                <li key={entry.item.id} style={{ marginBottom: 12 }}>
                  <strong>{entry.item.name}</strong> (Tier {entry.item.tier})
                  <div style={{ display: 'inline-block', marginLeft: 16 }}>
                    Quantity: <input type="number" min={0} value={entry.quantity} style={{ width: 50 }} onChange={e => handleInventoryChange(idx, Number(e.target.value))} />
                    <button style={{ marginLeft: 8 }} onClick={() => handleRemoveFromInventory(entry.item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}
        {activeTab === 'database' && (
          <section>
            <h2>Recipe Database</h2>
            <div style={{ marginBottom: 16 }}>
              <label>Filter by Tier: </label>
              <select value={tierFilter ?? ''} onChange={e => setTierFilter(e.target.value ? Number(e.target.value) : null)}>
                <option value=''>All</option>
                {[...new Set(ITEMS.map(i => i.tier))].sort((a, b) => a - b).map(tier => (
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
                        <button onClick={() => handleAddToPlanner(item, undefined, addQuantity)}>Add to Craft Planner</button>
                        <button onClick={() => handleAddToInventory(item, addQuantity)}>Add to Inventory</button>
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
                            {RECIPES.filter(r => r.output.resourceId === item.id).map(recipe => (
                              <option key={recipe.id} value={recipe.id}>{recipe.name} (Profession: {recipe.profession})</option>
                            ))}
                            {/* Then show all other recipes for custom selection */}
                            <optgroup label="All Recipes">
                              {RECIPES.filter(r => r.output.resourceId !== item.id).map(recipe => (
                                <option key={recipe.id} value={recipe.id}>{recipe.name} (Profession: {recipe.profession})</option>
                              ))}
                            </optgroup>
                          </select>
                        </div>
                        {selectedRecipeId && (() => {
                          const recipe = RECIPES.find(r => r.id === selectedRecipeId);
                          if (!recipe) return null;
                          return (
                            <div style={{ border: '1px solid #ccc', borderRadius: 4, padding: 8, marginBottom: 8 }}>
                              {/* Only show recipe name if different from item name and not empty, and not immediately after the item name */}
                              {recipe.name && recipe.name.trim() && recipe.name !== item.name && recipe.name !== undefined ? <strong>{recipe.name}</strong> : null}
                              {recipe.name && recipe.name.trim() && recipe.name !== item.name && recipe.name !== undefined ? ' ' : ''}(Profession: {recipe.profession})
                              <div>Ingredients:
                                <ul>
                                  {recipe.ingredients.map(ing => {
                                    const ingItem = ITEMS.find(i => i.id === ing.resourceId);
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
                              <button style={{ marginTop: 4 }} onClick={() => handleAddToPlanner(item, recipe.id, addQuantity)}>Add to Craft Planner</button>
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
        )}
      </main>
    </div>
  );
}

function CustomIngredientAdder({ items, onAdd }: { items: typeof ITEMS, onAdd: (item: typeof ITEMS[0], qty: number) => void }) {
  const [selected, setSelected] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<number | ''>('');
  const filteredItems = items.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tier === '' || item.tier === tier;
    return matchesSearch && matchesTier;
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search ingredient..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 160 }}
        />
        <select value={tier} onChange={e => setTier(e.target.value ? Number(e.target.value) : '')}>
          <option value=''>All Tiers</option>
          {[...new Set(items.map(i => i.tier))].sort((a, b) => a - b).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">-- Select Item --</option>
          {filteredItems.map(item => (
            <option key={item.id} value={item.id}>{item.name} (Tier {item.tier})</option>
          ))}
        </select>
        <input type="number" min={1} value={qty} style={{ width: 60 }} onChange={e => setQty(Number(e.target.value))} />
        <button disabled={!selected} onClick={() => {
          const item = items.find(i => i.id === selected);
          if (item) onAdd(item, qty);
        }}>
          Add
        </button>
      </div>
    </div>
  );
}

function InventoryAdder({ items, onAdd }: { items: typeof ITEMS, onAdd: (item: typeof ITEMS[0], qty: number) => void }) {
  const [selected, setSelected] = useState<string>('');
  const [qty, setQty] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [tier, setTier] = useState<number | ''>('');
  const filteredItems = items.filter(item => {
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tier === '' || item.tier === tier;
    return matchesSearch && matchesTier;
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <input
          type="text"
          placeholder="Search item..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: 160 }}
        />
        <select value={tier} onChange={e => setTier(e.target.value ? Number(e.target.value) : '')}>
          <option value=''>All Tiers</option>
          {[...new Set(items.map(i => i.tier))].sort((a, b) => a - b).map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          <option value="">-- Select Item --</option>
          {filteredItems.map(item => (
            <option key={item.id} value={item.id}>{item.name} (Tier {item.tier})</option>
          ))}
        </select>
        <input type="number" min={1} value={qty} style={{ width: 60 }} onChange={e => setQty(Number(e.target.value))} />
        <button disabled={!selected} onClick={() => {
          const item = items.find(i => i.id === selected);
          if (item) onAdd(item, qty);
        }}>
          Add to Inventory
        </button>
      </div>
    </div>
  );
}

export default App;
