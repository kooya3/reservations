const { Client, Databases, ID, Query } = require('node-appwrite');
require('dotenv').config({ path: '.env.local' });

const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT)
    .setProject(process.env.PROJECT_ID)
    .setKey(process.env.API_KEY);

const databases = new Databases(client);

const DATABASE_ID = process.env.DATABASE_ID;
const COLLECTION_ID = process.env.CATEGORIES_COLLECTION_ID || 'categories';

const CATEGORIES = [
  { id: 'food', name: 'food', label: 'Food', index: 0 },
  { id: 'salads', name: 'salads', label: 'Salads', index: 1 },
  { id: 'desserts', name: 'desserts', label: 'Desserts', index: 2 },
  { id: 'wine', name: 'wine', label: 'Wine', index: 3 },
  { id: 'beer', name: 'beer', label: 'Beer', index: 4 },
];

async function seedCategories() {
    console.log('🌱 Seeding Categories...');

    try {
        // Check if collection exists implicitly by listing documents
        // If fail, it means collection missing (run setup first)
        const existing = await databases.listDocuments(DATABASE_ID, COLLECTION_ID);
        
        // For simplicity, we just add missing ones or update existing by slug match
        // But listDocuments returns docs by ID. We can search by 'slug'.
        // Assuming we haven't created 'slug' attribute globally unique index yet, so we query.
        
        // Actually, let's just create them using ID = slug/id for easier seeding?
        // Appwrite IDs allowed chars: a-z, A-Z, 0-9, period, hyphen, underscore.
        // our IDs match this.
        
        for (const cat of CATEGORIES) {
            try {
                await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    cat.id, // Use ID as document ID for simplicity
                    {
                        name: cat.name,
                        label: cat.label,
                        slug: cat.id,
                        index: cat.index,
                        isActive: true
                    }
                );
                console.log(`✅ Added ${cat.label}`);
            } catch (error) {
                if (error.code === 409) {
                   console.log(`⚠️  ${cat.label} already exists`);
                   // Optional: Update it?
                   await databases.updateDocument(
                        DATABASE_ID, 
                        COLLECTION_ID, 
                        cat.id,
                        {
                            label: cat.label,
                            index: cat.index,
                            isActive: true
                        }
                   );
                   console.log(`   Updated ${cat.label}`);
                } else {
                    console.error(`❌ Failed to add ${cat.label}:`, error.message);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error seeding categories:', error.message);
    }
}

seedCategories();
