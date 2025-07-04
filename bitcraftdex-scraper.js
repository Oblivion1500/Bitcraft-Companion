// BitcraftDex Scraper Script
// Usage: Run with Node.js to generate items and recipes JSON for import into your app.
// Requires: npm install axios cheerio

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const BASE_URL = 'https://bitcraftdex.com/item/';

async function fetchAllItems() {
  const res = await axios.get(BASE_URL);
  const $ = cheerio.load(res.data);
  const items = [];
  $('table tr').each((i, el) => {
    const cols = $(el).find('td');
    if (cols.length >= 4) {
      const name = $(cols[0]).text().trim();
      const rarity = $(cols[1]).text().trim();
      const tier = parseInt($(cols[2]).text().trim(), 10);
      const viewLink = $(cols[3]).find('a').attr('href');
      const icon = $(cols[0]).find('img').attr('src')?.split('/').pop()?.replace('.png', '');
      if (name && !isNaN(tier)) {
        items.push({ name, rarity, tier, viewLink, icon });
      }
    }
  });
  return items;
}

async function fetchRecipeForItem(itemUrl) {
  if (!itemUrl) return null;
  const res = await axios.get(itemUrl);
  const $ = cheerio.load(res.data);
  // Try to find recipe info (adjust selector as needed)
  const recipeSection = $('h2:contains("Recipe")').next('table');
  if (!recipeSection.length) return null;
  const ingredients = [];
  recipeSection.find('tr').each((i, el) => {
    const cols = $(el).find('td');
    if (cols.length >= 2) {
      const name = $(cols[0]).text().trim();
      const quantity = parseInt($(cols[1]).text().trim(), 10) || 1;
      ingredients.push({ name, quantity });
    }
  });
  return ingredients.length ? ingredients : null;
}

async function main() {
  const items = await fetchAllItems();
  const itemMap = {};
  const recipes = [];
  for (const item of items) {
    const recipeIngredients = await fetchRecipeForItem(item.viewLink);
    const id = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_');
    itemMap[id] = {
      id,
      name: item.name,
      tier: item.tier,
      rarity: item.rarity,
      icon: item.icon,
      recipeIds: [],
    };
    if (recipeIngredients) {
      const recipeId = id + '_recipe';
      recipes.push({
        id: recipeId,
        name: item.name + ' Recipe',
        profession: '', // TODO: Parse profession if available
        ingredients: recipeIngredients.map(ing => ({ resourceId: ing.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'), quantity: ing.quantity })),
        output: { resourceId: id, quantity: 1 },
      });
      itemMap[id].recipeIds.push(recipeId);
    }
  }
  fs.writeFileSync('bitcraft_items.json', JSON.stringify(Object.values(itemMap), null, 2));
  fs.writeFileSync('bitcraft_recipes.json', JSON.stringify(recipes, null, 2));
  console.log('Exported', Object.keys(itemMap).length, 'items and', recipes.length, 'recipes.');
}

main();
