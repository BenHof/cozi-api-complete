#!/usr/bin/env node
import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { CoziApiClient } from './CoziApiClient';

const program = new Command();
const CONFIG_PATH = path.join(os.homedir(), '.cozi-credentials.json');

// Helper to load client with stored credentials
const getClient = async (): Promise<CoziApiClient> => {
  const client = new CoziApiClient();

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
      if (config.token && config.accountId) {
        client.setSessionToken(config.token, config.accountId);
      }
    } catch (_e) {
      // Ignore invalid config
    }
  }
  return client;
};

// Helper to save credentials
const saveCredentials = (token: string, accountId: string) => {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify({ token, accountId }, null, 2));
  console.log(chalk.green('✓ Credentials saved to ' + CONFIG_PATH));
};

program.name('cozi').description('Combined CLI for Cozi Family Organizer').version('0.1.0');

program
  .command('login')
  .description('Authenticate with Cozi')
  .action(async () => {
    const answers = await inquirer.prompt([
      { type: 'input', name: 'email', message: 'Email:' },
      { type: 'password', name: 'password', message: 'Password:' }
    ]);

    try {
      const client = new CoziApiClient();
      const auth = await client.authenticate(answers.email, answers.password);
      saveCredentials(auth.accessToken, auth.accountId);
      console.log(chalk.green(`✓ Logged in as account ${auth.accountId}`));
    } catch (error: any) {
      console.error(chalk.red('Login failed:'), error.message);
    }
  });

program
  .command('logout')
  .description('Clear stored credentials')
  .action(() => {
    if (fs.existsSync(CONFIG_PATH)) {
      fs.unlinkSync(CONFIG_PATH);
      console.log(chalk.green('✓ Logged out'));
    } else {
      console.log(chalk.yellow('Not logged in'));
    }
  });

program
  .command('lists')
  .description('Show all shopping/todo lists')
  .action(async () => {
    try {
      const client = await getClient();
      const lists = await client.lists.getLists();

      console.log(chalk.bold('\n📝 Your Lists:'));
      lists.forEach((list) => {
        console.log(
          `- ${chalk.cyan(list.title)} (${list.items.length} items) [ID: ${list.listId}]`
        );
      });
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

program
  .command('calendar')
  .description('Show upcoming appointments')
  .option('-d, --days <number>', 'Number of days to show', '7')
  .action(async (_options) => {
    try {
      const client = await getClient();
      const now = new Date();
      // Simple implementation: get current month
      const cal = await client.calendar.getCalendar(now.getFullYear(), now.getMonth() + 1);

      console.log(
        chalk.bold(`\n📅 Calendar (${now.toLocaleString('default', { month: 'long' })})`)
      );

      // Sort appointments - filter for items with itemType='appointment' or just use items
      const sorted = cal.items
        .filter((i) => i.itemType === 'appointment')
        .sort((a, b) => {
          const dateA = new Date((a.startDay || '') + 'T' + (a.startTime || '00:00'));
          const dateB = new Date((b.startDay || '') + 'T' + (b.startTime || '00:00'));
          return dateA.getTime() - dateB.getTime();
        });

      if (sorted.length === 0) {
        console.log(chalk.yellow('No upcoming appointments found this month.'));
        return;
      }

      sorted.forEach((appt) => {
        const timeStr = appt.startTime ? chalk.gray(appt.startTime) : chalk.gray('All Day');
        const subject = chalk.white(appt.subject || '(No Subject)');
        const day = chalk.blue((appt.startDay || '').split('-').slice(1).join('/')); // MM/DD
        console.log(`${day} ${timeStr} - ${subject}`);
      });
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

program
  .command('whoami')
  .description('Check login status')
  .action(async () => {
    const client = await getClient();
    try {
      // Trying a lightweight call to verify token
      const sub = await client.account.getSubscription();
      console.log(chalk.green('Logged in!'));
      console.log(`Plan: ${sub.tier || 'Free'}`);
    } catch (_error) {
      console.log(chalk.red('Not logged in or token expired. Run "cozi login"'));
    }
  });

// ============ RECIPES ============

program
  .command('recipes')
  .description('List all saved recipes')
  .action(async () => {
    try {
      const client = await getClient();
      const recipes = await client.recipes.getRecipes();

      console.log(chalk.bold('\n🍳 Your Recipes:'));
      if (recipes.length === 0) {
        console.log(chalk.yellow('No recipes saved yet.'));
        return;
      }
      recipes.forEach((r) => {
        const ingredientCount = r.ingredients?.length || 0;
        console.log(`- ${chalk.cyan(r.name)} (${ingredientCount} ingredients) [ID: ${r.recipeId}]`);
      });
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

program
  .command('recipe <id>')
  .description('Show details for a specific recipe')
  .action(async (id: string) => {
    try {
      const client = await getClient();
      const recipes = await client.recipes.getRecipes();
      const recipe = recipes.find((r) => r.recipeId === id);

      if (!recipe) {
        console.log(chalk.red(`Recipe with ID "${id}" not found.`));
        return;
      }

      console.log(chalk.bold(`\n🍳 ${recipe.name}`));
      if (recipe.description) console.log(chalk.gray(recipe.description));
      console.log('');

      if (recipe.prepTimeText || recipe.cookTimeText) {
        console.log(chalk.bold('⏱ Time:'));
        if (recipe.prepTimeText) console.log(`  Prep: ${recipe.prepTimeText}`);
        if (recipe.cookTimeText) console.log(`  Cook: ${recipe.cookTimeText}`);
        console.log('');
      }

      if (recipe.ingredients && recipe.ingredients.length > 0) {
        console.log(chalk.bold('📦 Ingredients:'));
        recipe.ingredients.forEach((ing) => {
          const amount = ing.amount ? `${ing.amount} ` : '';
          const unit = ing.unit ? `${ing.unit} ` : '';
          console.log(`  - ${amount}${unit}${ing.name}`);
        });
        console.log('');
      }

      if (recipe.instructions) {
        console.log(chalk.bold('📝 Instructions:'));
        console.log(recipe.instructions);
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// ============ FAMILY ============

program
  .command('family')
  .description('List all family members')
  .action(async () => {
    try {
      const client = await getClient();
      const members = await client.family.getFamilyMembers();

      console.log(chalk.bold('\n👨‍👩‍👧‍👦 Family Members:'));
      if (members.length === 0) {
        console.log(chalk.yellow('No family members found.'));
        return;
      }
      members.forEach((m) => {
        const type = m.accountPersonType === 'user' ? chalk.green('(User)') : chalk.gray('(Attendee)');
        const adult = m.isAdult ? '' : chalk.magenta(' [Child]');
        console.log(`- ${chalk.cyan(m.name)} ${type}${adult}`);
      });
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// ============ QUICK ADD ITEM ============

program
  .command('add-item <listId> <text>')
  .description('Add an item to a list')
  .action(async (listId: string, text: string) => {
    try {
      const client = await getClient();
      const item = await client.lists.addItem(listId, { text });
      console.log(chalk.green(`✓ Added "${text}" to list (ID: ${item.id})`));
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

// ============ ACCOUNT INFO ============

program
  .command('account')
  .description('Show account information')
  .action(async () => {
    try {
      const client = await getClient();
      const account = await client.account.getAccountInfo();
      const sub = await client.account.getSubscription();

      console.log(chalk.bold('\n👤 Account Info:'));
      console.log(`  Name: ${chalk.cyan(account.name)}`);
      console.log(`  ID: ${account.accountId}`);
      console.log(`  Timezone: ${account.timezone}`);
      console.log(`  Region: ${account.regionDesignator}`);
      console.log(`  Plan: ${chalk.green(sub.tier || 'Free')}`);
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
    }
  });

program.parse();
