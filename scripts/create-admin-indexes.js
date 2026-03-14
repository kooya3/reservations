/**
 * Script to create Appwrite indexes for admin analytics
 * Enables O(log n) queries for optimal performance
 */

const { Client, Databases } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.DATABASE_ID;
const ORDERS_COLLECTION_ID = process.env.ORDERS_COLLECTION_ID;

async function createAdminIndexes() {
    try {
        console.log('Creating admin analytics indexes...\n');

        // Index 1: createdAt for time-based queries
        try {
            await databases.createIndex(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                'createdAt_desc_index',
                'key',
                ['$createdAt'],
                ['DESC']
            );
            console.log('✅ Created createdAt index');
        } catch (error) {
            if (error.code === 409) {
                console.log('ℹ️  createdAt index already exists');
            } else {
                throw error;
            }
        }

        // Index 2: status for filtering
        try {
            await databases.createIndex(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                'status_index',
                'key',
                ['status'],
                ['ASC']
            );
            console.log('✅ Created status index');
        } catch (error) {
            if (error.code === 409) {
                console.log('ℹ️  status index already exists');
            } else {
                throw error;
            }
        }

        console.log('\n📊 Performance improvement:');
        console.log('  - Time-based queries: O(log n)');
        console.log('  - Status filtering: O(log n)');
        console.log('  - Combined queries: O(log n)');
        console.log('  - For 10,000 orders: ~13 comparisons vs 10,000\n');

    } catch (error) {
        console.error('❌ Error creating indexes:', error.message);
        throw error;
    }
}

// Run the script
createAdminIndexes()
    .then(() => {
        console.log('✨ Admin analytics indexes setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    });
