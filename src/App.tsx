import { useState, useRef } from 'react';
import { ITEMS, RECIPES } from '@/data/itemDatabase';
import './App.css';
import { PlannerTab } from './components/tabs/planner';
import { InventoryTab } from './components/tabs/inventory';
import { DatabaseTab } from './components/tabs/database';

function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'inventory' | 'database'>('planner');

  // --- Popup notification state ---
  const [popup, setPopup] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });
  const popupTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to show popup
  const showPopup = (message: string) => {
    setPopup({ message, visible: true });
    if (popupTimeout.current) clearTimeout(popupTimeout.current);
    popupTimeout.current = setTimeout(() => {
      setPopup({ message: '', visible: false });
    }, 2000);
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
        {activeTab === 'planner' && <PlannerTab items={ITEMS} recipies={RECIPES} />}
        {activeTab === 'inventory' && <InventoryTab items={ITEMS} showPopup={showPopup} />}
        {activeTab === 'database' && <DatabaseTab items={ITEMS} recipies={RECIPES} showPopup={showPopup} />}
      </main>
      {/* Popup notification - fixed to top right, always visible regardless of scroll */}
      {popup.visible && (
        <div style={{
          position: 'fixed',
          top: 24,
          right: 24,
          background: 'var(--bc-accent2, #222)',
          color: 'var(--bc-text, #fff)',
          padding: '12px 24px',
          borderRadius: 8,
          boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
          zIndex: 9999,
          fontWeight: 600,
          fontSize: 16,
          opacity: 0.98,
          transition: 'opacity 0.3s',
          pointerEvents: 'none',
          minWidth: 220,
          textAlign: 'center',
        }}>
          {popup.message}
        </div>
      )}
    </div>
  );
}



export default App;
