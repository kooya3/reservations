const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

const databases = new Databases(client);
const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID = 'categories';

// Categories to remove (old granular ones)
const OBSOLETE_CATEGORIES = ['appetizers', 'grilled', 'seafood', 'pasta', 'coffee', 'beverages'];

async function cleanupCategories() {
    console.log('🧹 Cleaning up obsolete categories...\n');

    for (const catId of OBSOLETE_CATEGORIES) {
        try {
            await databases.deleteDocument(DATABASE_ID, COLLECTION_ID, catId);
            console.log(`✅ Deleted: ${catId}`);
        } catch (error) {
            if (error.code === 404) {
                console.log(`⚠️  ${catId} not found (already deleted)`);
            } else {
                console.error(`❌ Failed to delete ${catId}:`, error.message);
            }
        }
    }

    console.log('\n🎉 Cleanup completed!');
}

cleanupCategories();
