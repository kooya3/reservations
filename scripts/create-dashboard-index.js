/**
 * Script to create Appwrite index for waiterId field
 * This enables O(log n) queries for server dashboard
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

async function createWaiterIdIndex() {
    try {
        console.log('Creating waiterId index for efficient dashboard queries...\n');

        // Create index on waiterId field
        const index = await databases.createIndex(
            DATABASE_ID,
            ORDERS_COLLECTION_ID,
            'waiterId_index',           // Index key
            'key',                       // Index type
            ['waiterId'],                // Attributes to index
            ['ASC']                      // Sort order
        );

        console.log('✅ Index created successfully!');
        console.log('Index details:', {
            key: index.key,
            type: index.type,
            attributes: index.attributes,
            orders: index.orders
        });

        console.log('\n📊 Performance improvement:');
        console.log('  - Without index: O(n) - scans all orders');
        console.log('  - With index: O(log n) - binary search');
        console.log('  - For 10,000 orders: ~13 comparisons vs 10,000\n');

    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  Index already exists - skipping creation');
        } else {
            console.error('❌ Error creating index:', error.message);
            throw error;
        }
    }
}

// Run the script
createWaiterIdIndex()
    .then(() => {
        console.log('\n✨ Dashboard index setup complete!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    });
