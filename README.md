# Bitcraft Companion App

A modern, open-source companion app for Bitcraft Online, built with React, TypeScript, and Vite. This app helps Bitcraft players plan, track, and optimize their crafting, inventory, and resource management.

## Features

- **Recipe Database:**
  - Browse all Bitcraft items and recipes (scraped from bitcraftdex.com)
  - Search and filter by item name or tier
  - Expand/collapse items for quick navigation
  - View all recipes that produce an item, with full ingredient breakdowns
  - Add items/recipes directly to your Craft Planner or Inventory

- **Craft Planner:**
  - Plan your crafting goals by adding items and recipes
  - Edit needed and have values, with inventory integration
  - Add custom ingredients to any planned item
  - Remove items or custom ingredients as needed
  - Download/upload your planner as JSON for backup or sharing

- **Inventory Management:**
  - Add, edit, or remove items in your inventory
  - Inventory is referenced in the Craft Planner for accurate tracking
  - Search and filter inventory items

- **Modern UI:**
  - Clean, collapsible panels and modals
  - Bitcraft-inspired dark theme with gold/teal accents
  - Responsive and accessible design

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Run the app locally:**
   ```bash
   npm run dev
   ```
3. **Build for production:**
   ```bash
   npm run build
   ```

## Deployment

You can easily deploy this app for free using [Vercel](https://vercel.com/), [Netlify](https://netlify.com/), or [GitHub Pages](https://pages.github.com/). See the Deployment section in this repo or ask for step-by-step help.

## Contributing / Developer Guide

- All item and recipe data is loaded from JSON files in `src/data/raw/`.
- Main data models are in `src/data/models.ts`.
- Main app logic and UI is in `src/App.tsx`.
- The code is modular and easy to extend:
  - Add new features as React components
  - Improve data models for more advanced planning
  - Refactor UI for new Bitcraft features or user feedback
- Please open issues or pull requests for improvements!

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.

## Support & Donations

If you find this app helpful and want to support development, donations are welcome! Donate ETH here: 0xe9046ff51e3639a98ee18c49b4ad63c8434d97f0

---

*Not affiliated with Clockwork Labs or Bitcraft Online. This is a fan-made, open-source project for the Bitcraft community.*
