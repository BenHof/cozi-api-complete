/**
 * Basic Usage Example for Cozi API Client
 *
 * This example demonstrates how to authenticate, retrieve lists,
 * and perform basic operations with the Cozi API.
 */

import { CoziApiClient } from '../src';

async function main() {
  // Create a new client instance with debug logging enabled
  const client = new CoziApiClient({
    debug: true,
    timeout: 30000,
    userAgent: 'cozi-example-app',
  });

  try {
    // Step 1: Authenticate
    console.log('Authenticating...');
    const auth = await client.authenticate(
      process.env.COZI_USERNAME || 'your@email.com',
      process.env.COZI_PASSWORD || 'your-password'
    );
    console.log('✓ Authenticated successfully');
    console.log(`  Account ID: ${auth.accountId}`);
    console.log(`  Token expires in: ${auth.expiresIn} seconds`);

    // Step 2: Get all lists
    console.log('\nFetching all lists...');
    const lists = await client.getLists();
    console.log(`✓ Found ${lists.length} lists:\n`);

    // Display lists and their items
    for (const list of lists) {
      console.log(`📋 ${list.title} (${list.listType})`);
      console.log(`   Items: ${list.items.length}`);

      if (list.items.length > 0) {
        console.log('   Contents:');
        for (const item of list.items.slice(0, 5)) {
          const status = item.status === 'complete' ? '✓' : '○';
          console.log(`     ${status} ${item.text}`);
        }
        if (list.items.length > 5) {
          console.log(`     ... and ${list.items.length - 5} more items`);
        }
      }
      console.log();
    }

    // Step 3: Find or create a shopping list
    let shoppingList = lists.find((l) => l.listType === 'shopping');

    if (!shoppingList) {
      console.log('No shopping list found. Creating one...');
      const listId = await client.addList({
        title: 'Example Shopping List',
        type: 'shopping',
      });
      console.log(`✓ Created shopping list: ${listId}`);

      // Fetch the newly created list
      shoppingList = await client.getList(listId);
    } else {
      console.log(`Using existing shopping list: "${shoppingList.title}"`);
    }

    // Step 4: Add an item to the shopping list
    console.log('\nAdding item to shopping list...');
    await client.addItem({
      listId: shoppingList.listId,
      text: 'Example Item - Milk',
    });
    console.log('✓ Added "Example Item - Milk"');

    // Step 5: Fetch the updated list
    const updatedList = await client.getList(shoppingList.listId);
    const newItem = updatedList.items.find((i) => i.text === 'Example Item - Milk');

    if (newItem) {
      console.log(`\nFound new item: ${newItem.text} (${newItem.itemId})`);

      // Step 6: Mark the item as complete
      console.log('Marking item as complete...');
      await client.markItem({
        listId: shoppingList.listId,
        itemId: newItem.itemId,
        completed: true,
      });
      console.log('✓ Item marked as complete');

      // Step 7: Edit the item
      console.log('Editing item text...');
      await client.editItem({
        listId: shoppingList.listId,
        itemId: newItem.itemId,
        text: 'Example Item - Whole Milk (edited)',
      });
      console.log('✓ Item text updated');

      // Step 8: Remove the item
      console.log('Removing item...');
      await client.removeItem({
        listId: shoppingList.listId,
        itemId: newItem.itemId,
      });
      console.log('✓ Item removed');
    }

    console.log('\n✓ Example completed successfully!');
  } catch (error) {
    console.error('\n❌ Error occurred:', error);
    process.exit(1);
  }
}

// Run the example
main();
