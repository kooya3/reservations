const { Client, Databases, ID } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

const databases = new Databases(client);

const TABLES = [
    { number: 1, capacity: 4, location: "Main Hall", status: "available", isActive: true },
    { number: 2, capacity: 2, location: "Window", status: "available", isActive: true },
    { number: 3, capacity: 6, location: "Main Hall", status: "available", isActive: true },
    { number: 4, capacity: 4, location: "Main Hall", status: "available", isActive: true },
    { number: 5, capacity: 8, location: "VIP Section", status: "reserved", isActive: true },
    { number: 6, capacity: 2, location: "Patio", status: "available", isActive: true }
];

async function seed() {
    try {
        console.log('🌱 Seeding Tables...');
        
        for (const table of TABLES) {
            try {
                await databases.createDocument(
                    process.env.DATABASE_ID,
                    process.env.TABLES_COLLECTION_ID,
                    ID.unique(),
                    table
                );
                console.log(`✅ Added Table ${table.number}`);
            } catch (err) {
                 console.log(`⚠️ Adding Table ${table.number} failed: ${err.message}`);
            }
        }
        
        console.log('🎉 Tables seeding completed!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
    }
}

seed();
