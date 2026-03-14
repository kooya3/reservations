"use server";

import { Query } from "node-appwrite";
import { databases, DATABASE_ID } from "../appwrite.config";
import { parseStringify } from "../utils";

// POS Collections
const MENU_COLLECTION_ID = "menu_items";

// Sample menu data for fallback
const SAMPLE_MENU = [
  {
    $id: "1",
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon grilled to perfection, served with lemon butter sauce and seasonal vegetables",
    price: 4500,
    category: "seafood",
    preparationTime: 25,
    ingredients: ["salmon", "lemon", "butter", "herbs", "seasonal vegetables"],
    allergens: ["fish", "dairy"],
    calories: 380,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "2",
    name: "Beef Tenderloin", 
    description: "Premium beef tenderloin grilled to your preference, served with truffle mashed potatoes",
    price: 6800,
    category: "grilled",
    preparationTime: 30,
    ingredients: ["beef tenderloin", "truffle", "potatoes", "herbs"],
    allergens: ["dairy"],
    calories: 520,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "3",
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, parmesan cheese, croutons with our signature Caesar dressing",
    price: 2200,
    category: "salads",
    preparationTime: 10,
    ingredients: ["romaine lettuce", "parmesan", "croutons", "caesar dressing"],
    allergens: ["dairy", "gluten", "eggs"],
    calories: 180,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "4",
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 1800,
    category: "desserts",
    preparationTime: 15,
    ingredients: ["dark chocolate", "flour", "eggs", "vanilla ice cream"],
    allergens: ["gluten", "dairy", "eggs"],
    calories: 420,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "5",
    name: "House Wine (Red)",
    description: "Our carefully selected house red wine, full-bodied with rich flavors",
    price: 3500,
    category: "wine",
    preparationTime: 2,
    ingredients: ["red wine"],
    allergens: ["sulfites"],
    calories: 85,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  },
  {
    $id: "6",
    name: "Espresso",
    description: "Rich, bold espresso made from premium arabica beans",
    price: 450,
    category: "coffee",
    preparationTime: 3,
    ingredients: ["arabica coffee beans"],
    allergens: [],
    calories: 5,
    $createdAt: new Date().toISOString(),
    $updatedAt: new Date().toISOString()
  }
];

// Get all menu items
export const getPOSMenuItems = async (category?: string) => {
  try {
    console.log("🍽️ Fetching POS menu items...", category ? `Category: ${category}` : "All items");
    
    const queries = [Query.orderDesc('$createdAt')];
    
    if (category) {
      queries.push(Query.equal('category', category));
    }

    const menuItems = await databases.listDocuments(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      queries
    );

    console.log(`✅ Retrieved ${menuItems.documents.length} menu items`);
    return parseStringify(menuItems.documents);

  } catch (error) {
    console.error("❌ Error fetching menu items:", error);
    
    // Return sample data as fallback
    console.log("📋 Using sample menu data");
    const filteredItems = category 
      ? SAMPLE_MENU.filter(item => item.category === category)
      : SAMPLE_MENU;
    
    return parseStringify(filteredItems);
  }
};

// Get menu items grouped by category
export const getPOSMenuByCategory = async () => {
  try {
    console.log("📋 Fetching menu items grouped by category...");
    
    const allItems = await getPOSMenuItems();
    
    // Group items by category
    const categories = [
      "appetizers", "soups", "salads", "main_course", "seafood", 
      "grilled", "pasta", "desserts", "beverages", "cocktails", 
      "wine", "beer", "coffee"
    ];
    
    const menuByCategory: Record<string, any[]> = {};
    
    categories.forEach(category => {
      menuByCategory[category] = allItems.filter((item: any) => item.category === category);
    });

    console.log("✅ Menu items grouped by category");
    return parseStringify(menuByCategory);

  } catch (error) {
    console.error("❌ Error grouping menu by category:", error);
    
    // Return sample data grouped by category
    const sampleGrouped: Record<string, any[]> = {
      appetizers: [],
      soups: [],
      salads: SAMPLE_MENU.filter(item => item.category === "salads"),
      main_course: [],
      seafood: SAMPLE_MENU.filter(item => item.category === "seafood"),
      grilled: SAMPLE_MENU.filter(item => item.category === "grilled"),
      pasta: [],
      desserts: SAMPLE_MENU.filter(item => item.category === "desserts"),
      beverages: [],
      cocktails: [],
      wine: SAMPLE_MENU.filter(item => item.category === "wine"),
      beer: [],
      coffee: SAMPLE_MENU.filter(item => item.category === "coffee")
    };
    
    return parseStringify(sampleGrouped);
  }
};

// Create menu item
export const createPOSMenuItem = async (itemData: any) => {
  try {
    console.log("➕ Creating menu item:", itemData.name);
    
    const menuItem = await databases.createDocument(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      'unique()',
      {
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        category: itemData.category,
        imageUrl: itemData.imageUrl || "",
        preparationTime: itemData.preparationTime,
        ingredients: itemData.ingredients || [],
        allergens: itemData.allergens || [],
        calories: itemData.calories || 0,
        costPrice: itemData.costPrice || 0,
        popularity: itemData.popularity || 0
      }
    );

    console.log("✅ Menu item created:", itemData.name);
    return parseStringify(menuItem);

  } catch (error) {
    console.error("❌ Error creating menu item:", error);
    throw error;
  }
};

// Update menu item
export const updatePOSMenuItem = async (itemId: string, updates: any) => {
  try {
    console.log("📝 Updating menu item:", itemId);
    
    const updatedItem = await databases.updateDocument(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      itemId,
      updates
    );

    console.log("✅ Menu item updated:", itemId);
    return parseStringify(updatedItem);

  } catch (error) {
    console.error("❌ Error updating menu item:", error);
    throw error;
  }
};

// Search menu items
export const searchPOSMenuItems = async (searchTerm: string) => {
  try {
    console.log("🔍 Searching menu items:", searchTerm);
    
    const allItems = await getPOSMenuItems();
    
    const searchResults = allItems.filter((item: any) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.ingredients && item.ingredients.some((ingredient: string) => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );

    console.log(`🔍 Found ${searchResults.length} items matching "${searchTerm}"`);
    return parseStringify(searchResults);

  } catch (error) {
    console.error("❌ Error searching menu items:", error);
    return [];
  }
};

// Get popular menu items
export const getPopularMenuItems = async (limit: number = 10) => {
  try {
    console.log("🔥 Fetching popular menu items...");
    
    const allItems = await getPOSMenuItems();
    
    // Sort by popularity (using price as proxy for now)
    const popularItems = allItems
      .sort((a: any, b: any) => (b.popularity || b.price) - (a.popularity || a.price))
      .slice(0, limit);

    console.log(`🔥 Retrieved ${popularItems.length} popular items`);
    return parseStringify(popularItems);

  } catch (error) {
    console.error("❌ Error fetching popular menu items:", error);
    return parseStringify(SAMPLE_MENU.slice(0, limit));
  }
};