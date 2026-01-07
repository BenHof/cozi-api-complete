/**
 * Session Management Example
 *
 * This example demonstrates how to manage sessions by storing
 * and restoring authentication tokens to avoid re-authenticating.
 */

import { CoziApiClient } from '../src';
import * as fs from 'fs';
import * as path from 'path';

const SESSION_FILE = path.join(__dirname, '.cozi-session.json');

interface StoredSession {
  accessToken: string;
  accountId: string;
  expiresAt: number;
}

async function main() {
  const client = new CoziApiClient({ debug: true });

  try {
    // Try to load existing session
    let session = loadSession();

    if (session && session.expiresAt > Date.now()) {
      console.log('Using stored session...');
      client.setSessionToken(session.accessToken, session.accountId);
    } else {
      console.log('No valid session found. Authenticating...');
      const auth = await client.authenticate(
        process.env.COZI_USERNAME || 'your@email.com',
        process.env.COZI_PASSWORD || 'your-password'
      );

      // Calculate expiration time
      const expiresAt = Date.now() + auth.expiresIn * 1000;

      // Store session for later use
      session = {
        accessToken: auth.accessToken,
        accountId: auth.accountId,
        expiresAt,
      };
      saveSession(session);
      console.log('✓ Authenticated and session saved');
    }

    // Now use the API
    const lists = await client.getLists();
    console.log(`\n✓ Successfully retrieved ${lists.length} lists`);

    console.log('\nSession is valid until:', new Date(session.expiresAt).toLocaleString());
  } catch (error) {
    console.error('❌ Error:', error);
    // Clear invalid session
    clearSession();
    process.exit(1);
  }
}

function loadSession(): StoredSession | null {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      const data = fs.readFileSync(SESSION_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Failed to load session:', error);
  }
  return null;
}

function saveSession(session: StoredSession): void {
  try {
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2));
    console.log('Session saved to:', SESSION_FILE);
  } catch (error) {
    console.error('Failed to save session:', error);
  }
}

function clearSession(): void {
  try {
    if (fs.existsSync(SESSION_FILE)) {
      fs.unlinkSync(SESSION_FILE);
      console.log('Session cleared');
    }
  } catch (error) {
    console.error('Failed to clear session:', error);
  }
}

// Run the example
main();
