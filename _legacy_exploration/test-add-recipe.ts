/**
 * Test Script: Add Cream Chipped Beef Recipe
 * 
 * Creates a complete recipe with ingredients and instructions.
 * Run with: npx ts-node test-add-recipe.ts
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { CoziApiClient } from './src/CoziApiClient';
import { CreateRecipeRequest } from './src/types';

async function main() {
    console.log('🍳 Creating Cream Chipped Beef Recipe\n');

    const username = process.env.COZI_USERNAME || process.env.COZI_EMAIL;
    const password = process.env.COZI_PASSWORD;

    if (!username || !password) {
        console.error('❌ Missing credentials in .env.local');
        return;
    }

    const client = new CoziApiClient({ debug: true });

    // Authenticate
    console.log('🔐 Authenticating...');
    await client.authenticate(username, password);
    console.log('✅ Authenticated\n');

    // Create the Cream Chipped Beef Recipe
    const recipe: CreateRecipeRequest = {
        name: 'Cream Chipped Beef (SOS)',
        description: 'Classic creamy chipped beef on toast - comfort food at its finest!',
        instructions: `1. Melt butter in a large skillet over medium heat.

2. Add flour and whisk continuously for 1 minute to make a roux.

3. Slowly pour in the milk while whisking to prevent lumps.

4. Continue cooking and stirring until the sauce thickens, about 5-7 minutes.

5. Add the chipped beef, breaking it apart as you stir.

6. Season with black pepper (go easy on salt - chipped beef is already salty).

7. Optional: Add a splash of Worcestershire sauce for extra flavor.

8. Simmer for 3-4 minutes until heated through and creamy.

9. Serve immediately over buttered toast points.

Pro tip: Toast the bread until golden and crispy to hold up to the creamy sauce!`,
        ingredients: [
            { name: '4 tablespoons butter', amount: '4', unit: 'tablespoons' },
            { name: '4 tablespoons all-purpose flour', amount: '4', unit: 'tablespoons' },
            { name: '2 cups whole milk', amount: '2', unit: 'cups' },
            { name: '8 oz dried chipped beef, rinsed and chopped', amount: '8', unit: 'oz' },
            { name: 'Black pepper to taste' },
            { name: 'Worcestershire sauce (optional)', amount: '1', unit: 'splash' },
            { name: '4-6 slices thick-cut bread, toasted', amount: '4-6', unit: 'slices' }
        ],
        tags: {
            'has-keyword': ['comfort food', 'breakfast', 'classic', 'quick'],
            'has-ai-protein': ['Beef'],
            'has-ai-cuisine': ['American'],
            'has-ai-meal': ['Breakfast', 'Dinner']
        },
        servings: '4',
        cookTimeText: '20 minutes',
        recipeSource: 'Typed Into Cozi',
        sourceRaw: 'Family Recipe',
        isPublished: false
    };

    console.log('📝 Creating recipe: ' + recipe.name);

    try {
        const createdRecipe = await client.recipes.createRecipe(recipe);
        console.log('\n✅ Recipe created successfully!');
        console.log(`   Recipe ID: ${createdRecipe.recipeId}`);
        console.log(`   Name: ${createdRecipe.name}`);
        console.log(`   Ingredients: ${recipe.ingredients.length}`);

        // Verify by fetching all recipes
        console.log('\n📋 Fetching all recipes to verify...');
        const allRecipes = await client.recipes.getRecipes();
        const found = allRecipes.find((r: any) => r.name === recipe.name);

        if (found) {
            console.log('✅ Recipe verified in recipe list!');
        } else {
            console.log('⚠️ Recipe not found in list (might need refresh)');
        }

        // Now add ingredients to shopping list
        console.log('\n🛒 Adding ingredients to shopping list...');

        // Get all lists and find a shopping list
        const lists = await client.lists.getLists();
        const shoppingList = lists.find((l: any) => l.listType === 'shopping');

        if (!shoppingList) {
            console.log('❌ No shopping list found!');
        } else {
            console.log(`   Using list: "${shoppingList.title}"`);

            // Add a section header for this recipe
            await client.lists.addSection(shoppingList.listId, recipe.name);
            console.log(`   ✅ Added section: ${recipe.name}`);

            // Add each ingredient
            for (const ingredient of recipe.ingredients) {
                await client.lists.addItem(shoppingList.listId, { text: ingredient.name });
                console.log(`   ✅ Added: ${ingredient.name}`);
            }

            console.log(`\n✅ Added ${recipe.ingredients.length} ingredients to "${shoppingList.title}"`);
        }

    } catch (error: any) {
        console.error('❌ Failed to create recipe:', error.message || error);
        if (error.details) {
            console.error('Details:', JSON.stringify(error.details, null, 2));
        }
    }

    console.log('\n🎉 Done!');
}

main().catch(console.error);
