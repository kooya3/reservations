"use server";

import { Query } from "node-appwrite";
import { databases, DATABASE_ID } from "../appwrite.config";
import { parseStringify } from "../utils";
import { MenuItem, MenuCategory } from "@/types/pos.types";

// Collection IDs - these would need to be created in Appwrite
export const MENU_COLLECTION_ID = process.env.MENU_COLLECTION_ID || "menu_items";
export const ORDER_COLLECTION_ID = process.env.ORDER_COLLECTION_ID || "orders";
export const TABLE_COLLECTION_ID = process.env.TABLE_COLLECTION_ID || "tables";

// Sample menu data for initialization
const SAMPLE_MENU_ITEMS = [
  {
    name: "Grilled Salmon",
    description: "Fresh Atlantic salmon grilled to perfection, served with lemon butter sauce and seasonal vegetables",
    price: 4500,
    category: MenuCategory.SEAFOOD,
    isAvailable: true,
    preparationTime: 25,
    ingredients: ["salmon", "lemon", "butter", "herbs", "seasonal vegetables"],
    allergens: ["fish", "dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    calories: 380,
    variants: [
      { name: "Regular", priceModifier: 0, isDefault: true },
      { name: "Large Portion", priceModifier: 1000, isDefault: false }
    ],
    customizations: [
      {
        name: "Cooking Style",
        options: [
          { name: "Medium Rare", price: 0, isDefault: true },
          { name: "Medium", price: 0, isDefault: false },
          { name: "Well Done", price: 0, isDefault: false }
        ],
        isRequired: true,
        maxSelections: 1
      }
    ]
  },
  {
    name: "Beef Tenderloin",
    description: "Premium beef tenderloin grilled to your preference, served with truffle mashed potatoes",
    price: 6800,
    category: MenuCategory.GRILLED,
    isAvailable: true,
    preparationTime: 30,
    ingredients: ["beef tenderloin", "truffle", "potatoes", "herbs"],
    allergens: ["dairy"],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    calories: 520
  },
  {
    name: "Caesar Salad",
    description: "Crisp romaine lettuce, parmesan cheese, croutons with our signature Caesar dressing",
    price: 2200,
    category: MenuCategory.SALADS,
    isAvailable: true,
    preparationTime: 10,
    ingredients: ["romaine lettuce", "parmesan", "croutons", "caesar dressing"],
    allergens: ["dairy", "gluten", "eggs"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    calories: 180,
    customizations: [
      {
        name: "Add Protein",
        options: [
          { name: "Grilled Chicken", price: 800, isDefault: false },
          { name: "Grilled Shrimp", price: 1200, isDefault: false },
          { name: "No Protein", price: 0, isDefault: true }
        ],
        isRequired: false,
        maxSelections: 1
      }
    ]
  },
  {
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 1800,
    category: MenuCategory.DESSERTS,
    isAvailable: true,
    preparationTime: 15,
    ingredients: ["dark chocolate", "flour", "eggs", "vanilla ice cream"],
    allergens: ["gluten", "dairy", "eggs"],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    calories: 420
  },
  {
    name: "House Wine (Red)",
    description: "Our carefully selected house red wine, full-bodied with rich flavors",
    price: 3500,
    category: MenuCategory.WINE,
    isAvailable: true,
    preparationTime: 2,
    ingredients: ["red wine"],
    allergens: ["sulfites"],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    calories: 85,
    variants: [
      { name: "Glass", priceModifier: 0, isDefault: true },
      { name: "Bottle", priceModifier: 8500, isDefault: false }
    ]
  },
  {
    name: "Espresso",
    description: "Rich, bold espresso made from premium arabica beans",
    price: 450,
    category: MenuCategory.COFFEE,
    isAvailable: true,
    preparationTime: 3,
    ingredients: ["arabica coffee beans"],
    allergens: [],
    isVegetarian: true,
    isVegan: true,
    isGlutenFree: true,
    calories: 5,
    variants: [
      { name: "Single Shot", priceModifier: 0, isDefault: true },
      { name: "Double Shot", priceModifier: 200, isDefault: false }
    ]
  }
];

// Create menu item
export const createMenuItem = async (itemData: Omit<MenuItem, '$id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const menuItem = await databases.createDocument(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      'unique()',
      {
        ...itemData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    );

    console.log("✅ Menu item created successfully:", itemData.name);
    return parseStringify(menuItem);

  } catch (error) {
    console.error("❌ Error creating menu item:", error);
    throw error;
  }
};

// Get all menu items
export const getMenuItems = async (category?: MenuCategory) => {
  try {
    const queries = [Query.orderDesc('$createdAt')];
    
    if (category) {
      queries.push(Query.equal('category', category));
    }

    const menuItems = await databases.listDocuments(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      queries
    );

    console.log(`📋 Retrieved ${menuItems.documents.length} menu items`);
    return parseStringify(menuItems.documents);

  } catch (error) {
    console.error("❌ Error fetching menu items:", error);
    
    // Return sample data if database is not yet set up
    console.log("📋 Using sample menu data for development");
    return SAMPLE_MENU_ITEMS.filter(item => !category || item.category === category);
  }
};

// Get menu items by category (for POS interface)
export const getMenuByCategory = async () => {
  try {
    const allItems = await getMenuItems();
    
    // Group items by category
    const menuByCategory = Object.values(MenuCategory).reduce((acc, category) => {
      acc[category] = allItems.filter((item: MenuItem) => item.category === category);
      return acc;
    }, {} as Record<MenuCategory, MenuItem[]>);

    console.log("📋 Menu items grouped by category");
    return parseStringify(menuByCategory);

  } catch (error) {
    console.error("❌ Error grouping menu by category:", error);
    throw error;
  }
};

// Update menu item
export const updateMenuItem = async (itemId: string, updates: Partial<MenuItem>) => {
  try {
    const updatedItem = await databases.updateDocument(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      itemId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    );

    console.log("✅ Menu item updated successfully:", itemId);
    return parseStringify(updatedItem);

  } catch (error) {
    console.error("❌ Error updating menu item:", error);
    throw error;
  }
};

// Toggle menu item availability
export const toggleMenuItemAvailability = async (itemId: string, isAvailable: boolean) => {
  try {
    const updatedItem = await updateMenuItem(itemId, { 
      isAvailable,
      updatedAt: new Date()
    });

    console.log(`✅ Menu item ${isAvailable ? 'enabled' : 'disabled'}:`, itemId);
    return updatedItem;

  } catch (error) {
    console.error("❌ Error toggling menu item availability:", error);
    throw error;
  }
};

// Delete menu item
export const deleteMenuItem = async (itemId: string) => {
  try {
    await databases.deleteDocument(
      DATABASE_ID!,
      MENU_COLLECTION_ID,
      itemId
    );

    console.log("✅ Menu item deleted successfully:", itemId);
    return true;

  } catch (error) {
    console.error("❌ Error deleting menu item:", error);
    throw error;
  }
};

// Get popular menu items (based on order frequency)
export const getPopularMenuItems = async (limit: number = 10) => {
  try {
    // This would require aggregation of order data
    // For now, return top items by category
    const allItems = await getMenuItems();
    
    // Simulate popularity based on price range and category
    const popularItems = allItems
      .sort((a: MenuItem, b: MenuItem) => {
        // Higher price items in main categories tend to be signature dishes
        const aScore = (a.category === MenuCategory.MAIN_COURSE || a.category === MenuCategory.SEAFOOD) ? a.price : a.price * 0.7;
        const bScore = (b.category === MenuCategory.MAIN_COURSE || b.category === MenuCategory.SEAFOOD) ? b.price : b.price * 0.7;
        return bScore - aScore;
      })
      .slice(0, limit);

    console.log(`🔥 Retrieved ${popularItems.length} popular menu items`);
    return parseStringify(popularItems);

  } catch (error) {
    console.error("❌ Error fetching popular menu items:", error);
    throw error;
  }
};

// Search menu items
export const searchMenuItems = async (searchTerm: string) => {
  try {
    const allItems = await getMenuItems();
    
    const searchResults = allItems.filter((item: MenuItem) => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ingredients.some(ingredient => 
        ingredient.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    console.log(`🔍 Found ${searchResults.length} items matching "${searchTerm}"`);
    return parseStringify(searchResults);

  } catch (error) {
    console.error("❌ Error searching menu items:", error);
    throw error;
  }
};

// Get menu items with dietary filters
export const getMenuItemsByDiet = async (filters: {
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  allergens?: string[];
}) => {
  try {
    const allItems = await getMenuItems();
    
    const filteredItems = allItems.filter((item: MenuItem) => {
      if (filters.isVegetarian && !item.isVegetarian) return false;
      if (filters.isVegan && !item.isVegan) return false;
      if (filters.isGlutenFree && !item.isGlutenFree) return false;
      
      if (filters.allergens && filters.allergens.length > 0) {
        const hasAllergen = filters.allergens.some(allergen =>
          item.allergens.includes(allergen)
        );
        if (hasAllergen) return false;
      }
      
      return true;
    });

    console.log(`🥗 Found ${filteredItems.length} items matching dietary requirements`);
    return parseStringify(filteredItems);

  } catch (error) {
    console.error("❌ Error filtering menu items by diet:", error);
    throw error;
  }
};

// Initialize sample menu data (for development)
export const initializeSampleMenu = async () => {
  try {
    console.log("🚀 Initializing sample menu data...");
    
    const promises = SAMPLE_MENU_ITEMS.map(item => 
      createMenuItem({
        ...item,
        $id: '', // Will be auto-generated
        createdAt: new Date(),
        updatedAt: new Date()
      } as any)
    );
    
    await Promise.all(promises);
    
    console.log("✅ Sample menu data initialized successfully");
    return true;

  } catch (error) {
    console.error("❌ Error initializing sample menu:", error);
    return false;
  }
};