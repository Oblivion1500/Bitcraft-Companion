import { InventoryAdder } from '@/components/adders/inventory';
import type { ITEMS } from '@/data/itemDatabase';
import { useInventory } from '@/hooks/inventory';

interface InventoryProps {
    items: typeof ITEMS;
    showPopup: (message: string) => void;
}


export function InventoryTab(props: InventoryProps) {
    const { inventory, handleAddToInventory, handleInventoryChange, handleRemoveFromInventory } = useInventory();

    return (
        <section>
            <h2>Inventory</h2>
            <InventoryAdder items={props.items} onAdd={handleAddToInventory} onShowPopup={props.showPopup} />
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
    )
}