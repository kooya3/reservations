const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

const databases = new Databases(client);

const MENU_ITEMS = [
    {
        name: "Classic Burger",
        description: "Juicy beef patty with lettuce, tomato, and cheese",
        price: 3500,
        category: "food", // Updated to use broad category
        imageUrl: "https://fra.cloud.appwrite.io/v1/storage/buckets/693b24920011a7fb86b1/files/693b31d600226fb3bfe2/view?project=669036bb001fb0233dd6&mode=admin",
        isAvailable: true,
        preparationTime: 15,
        popularity: 10,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: false,
        isActive: true
    },
    {
        name: "Jollof Rice & Chicken",
        description: "Spicy Nigerian Jollof Rice served with grilled chicken",
        price: 4500,
        category: "food",
        imageUrl: "",
        isAvailable: true,
        preparationTime: 25,
        popularity: 15,
        isVegetarian: false,
        isVegan: false,
        isGlutenFree: true,
        isActive: true
    },
    {
        name: "Chapman",
        description: "Classic Nigerian cocktail with fruity flavors",
        price: 2000,
        category: "drink",
        imageUrl: "",
        isAvailable: true,
        preparationTime: 5,
        popularity: 12,
        isVegetarian: true,
        isVegan: true,
        isGlutenFree: true,
        isActive: true
    }
];

async function seed() {
    try {
        console.log('🌱 Seeding Menu Items...');
        
        for (const item of MENU_ITEMS) {
            await databases.createDocument(
                process.env.DATABASE_ID,
                process.env.MENU_ITEMS_COLLECTION_ID,
                ID.unique(),
                item
            );
            console.log(`✅ Added ${item.name}`);
        }
        
        console.log('🎉 Menu seeding completed!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seed();
