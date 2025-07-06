import type { ITEMS } from "@/data/itemDatabase";
import { useState } from "react";
import { Input } from "@/components/ui/input";

// InventoryAdder component for adding items to inventory
export function InventoryAdder({ items, onAdd, onShowPopup }: { items: typeof ITEMS, onAdd: (item: typeof ITEMS[0], qty: number) => void, onShowPopup: (msg: string) => void }) {
    const [selected, setSelected] = useState('');
    const [qty, setQty] = useState(1);
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
                <Input
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
                    if (item) {
                        onAdd(item, qty);
                        onShowPopup(`${item.name} (x${qty}) added to Inventory`);
                        setSelected('');
                        setQty(1);
                    }
                }}>Add</button>
            </div>
        </div>
    );
}