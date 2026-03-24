import { NextRequest, NextResponse } from 'next/server';
import { databases, DATABASE_ID, MENU_ITEMS_COLLECTION_ID, CATEGORIES_COLLECTION_ID } from '@/lib/appwrite.config';
import { ID, Query } from 'appwrite';
import { parseStringify } from '@/lib/utils';

interface MenuImportData {
  categories?: Array<{
    name: string;
    slug?: string;
    description?: string;
  }>;
  products?: Array<{
    name: string;
    price: number;
    category: string;
    description?: string;
    isAvailable?: boolean;
    imageUrl?: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, products }: MenuImportData = body;

    if (!categories || !products) {
      return NextResponse.json(
        { error: 'Invalid format: requires categories and products arrays' },
        { status: 400 }
      );
    }

    const results = {
      categoriesCreated: 0,
      productsCreated: 0,
      categoriesSkipped: 0,
      productsSkipped: 0,
      errors: [] as string[],
      warnings: [] as string[]
    };

    if (!DATABASE_ID || !CATEGORIES_COLLECTION_ID || !MENU_ITEMS_COLLECTION_ID) {
      return NextResponse.json(
        { error: 'Database configuration missing' },
        { status: 500 }
      );
    }

    // Step 1: Create categories first
    const categoryMap = new Map<string, string>();
    
    for (const cat of categories) {
      try {
        const slug = cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-');
        
        // Check if category already exists
        const existing = await databases.listDocuments(
          DATABASE_ID,
          CATEGORIES_COLLECTION_ID,
          [Query.equal('slug', slug)]
        );

        if (existing.documents.length > 0) {
          results.categoriesSkipped++;
          results.warnings.push(`Category "${cat.name}" already exists, skipping`);
          categoryMap.set(cat.name, existing.documents[0].$id);
          continue;
        }

        // Create new category
        const newCategory = await databases.createDocument(
          DATABASE_ID,
          CATEGORIES_COLLECTION_ID,
          ID.unique(),
          {
            name: cat.name,
            slug,
            description: cat.description || '',
            createdAt: new Date().toISOString()
          }
        );
        
        categoryMap.set(cat.name, newCategory.$id);
        results.categoriesCreated++;
      } catch (err: any) {
        results.errors.push(`Failed to create category "${cat.name}": ${err.message}`);
      }
    }

    // Step 2: Create products
    for (const product of products) {
      try {
        const categoryId = categoryMap.get(product.category);
        
        if (!categoryId) {
          results.productsSkipped++;
          results.errors.push(`Product "${product.name}": Category "${product.category}" not found`);
          continue;
        }

        // Check if product already exists (by name + category)
        const existing = await databases.listDocuments(
          DATABASE_ID,
          MENU_ITEMS_COLLECTION_ID,
          [
            Query.equal('name', product.name),
            Query.equal('categoryId', categoryId)
          ]
        );

        if (existing.documents.length > 0) {
          results.productsSkipped++;
          results.warnings.push(`Product "${product.name}" already exists in "${product.category}", skipping`);
          continue;
        }

        // Create new product
        // Prices are VAT-inclusive, so calculate base price and VAT
        const vatRate = 0.16;
        const displayedPrice = product.price;
        const basePrice = displayedPrice / (1 + vatRate);
        const vatAmount = basePrice * vatRate;

        await databases.createDocument(
          DATABASE_ID,
          MENU_ITEMS_COLLECTION_ID,
          ID.unique(),
          {
            name: product.name,
            price: displayedPrice, // Store VAT-inclusive price
            basePrice: basePrice, // Ex-VAT price
            vatAmount: vatAmount, // VAT amount
            categoryId,
            description: product.description || '',
            isAvailable: product.isAvailable !== false,
            imageUrl: product.imageUrl || '',
            createdAt: new Date().toISOString()
          }
        );
        
        results.productsCreated++;
      } catch (err: any) {
        results.errors.push(`Failed to create product "${product.name}": ${err.message}`);
      }
    }

    return NextResponse.json({
      success: results.errors.length === 0,
      results
    });
  } catch (error: any) {
    console.error('Menu import error:', error);
    return NextResponse.json(
      { error: 'Failed to import menu: ' + error.message },
      { status: 500 }
    );
  }
}

// Validate JSON structure
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { categories, products } = body;

    const validation = {
      valid: true,
      errors: [] as string[],
      warnings: [] as string[],
      summary: { categories: 0, products: 0 }
    };

    // Validate categories
    if (!categories || !Array.isArray(categories)) {
      validation.valid = false;
      validation.errors.push('Missing or invalid "categories" array');
    } else {
      validation.summary.categories = categories.length;
      for (const cat of categories) {
        if (!cat.name) {
          validation.valid = false;
          validation.errors.push('Category missing required field: name');
        }
      }
    }

    // Validate products
    if (!products || !Array.isArray(products)) {
      validation.valid = false;
      validation.errors.push('Missing or invalid "products" array');
    } else {
      validation.summary.products = products.length;
      for (const product of products) {
        if (!product.name) {
          validation.valid = false;
          validation.errors.push('Product missing required field: name');
        }
        if (typeof product.price !== 'number' || product.price <= 0) {
          validation.valid = false;
          validation.errors.push(`Product "${product.name}" has invalid price`);
        }
        if (!product.category) {
          validation.valid = false;
          validation.errors.push(`Product "${product.name}" missing required field: category`);
        }
      }
    }

    // Check for potential issues
    const categoryNames = new Set(categories?.map((c: any) => c.name) || []);
    for (const product of products || []) {
      if (!categoryNames.has(product.category)) {
        validation.warnings.push(`Product "${product.name}" references unknown category "${product.category}"`);
      }
    }

    return NextResponse.json(validation);
  } catch (error: any) {
    return NextResponse.json(
      { valid: false, errors: ['Invalid JSON format'] },
      { status: 400 }
    );
  }
}