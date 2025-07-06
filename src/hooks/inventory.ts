import type { ITEMS } from "@/data/itemDatabase";
import { useState } from "react";

export function useInventory() {
    // --- Inventory state ---
    const [inventory, setInventory] = useState<Array<{ item: typeof ITEMS[0]; quantity: number }>>([]);

    // --- Inventory state ---
    const handleAddToInventory = (item: typeof ITEMS[0], quantity: number = 1) => {
        setInventory(prev => {
            if (!prev) return [{ item, quantity }];
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
            if (!prev) return [];
            const updated = [...prev];
            updated[idx].quantity = value;
            return updated;
        });
    };

    // Remove item from inventory
    const handleRemoveFromInventory = (itemId: string) => {
        setInventory(prev => prev?.filter(i => i.item.id !== itemId));
    };

    return {
        inventory,
        setInventory,
        handleAddToInventory,
        handleInventoryChange,
        handleRemoveFromInventory
    };
}