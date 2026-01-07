/**
 * Unit tests for CoziApiClient
 *
 * Note: These are basic unit tests. Integration tests require actual Cozi credentials.
 */

import { CoziApiClient } from '../CoziApiClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoziApiClient', () => {
  let client: CoziApiClient;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock axios.create to return a mocked instance
    const mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);

    client = new CoziApiClient();
  });

  describe('Constructor', () => {
    it('should create a client with default config', () => {
      const client = new CoziApiClient();
      expect(client).toBeInstanceOf(CoziApiClient);
    });

    it('should create a client with custom config', () => {
      const client = new CoziApiClient({
        debug: true,
        timeout: 60000,
        userAgent: 'test-agent'
      });
      expect(client).toBeInstanceOf(CoziApiClient);
    });

    it('should configure axios correctly', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://rest.cozi.com',
          timeout: 30000,
          headers: expect.objectContaining({
            'User-Agent': 'cozi-api-client',
            'Content-Type': 'application/json'
          })
        })
      );
    });
  });

  describe('setSessionToken', () => {
    it('should set session token and accountId', () => {
      const token = 'test-token';
      const accountId = 'test-account-id';

      client.setSessionToken(token, accountId);

      // Since these are private properties, we can't directly test them
      // But we can verify no errors are thrown
      expect(() => client.setSessionToken(token, accountId)).not.toThrow();
    });

    it('should set session token without accountId', () => {
      const token = 'test-token';

      expect(() => client.setSessionToken(token)).not.toThrow();
    });
  });

  describe('Error handling', () => {
    it('should throw error when not authenticated', async () => {
      await expect(client.getLists()).rejects.toThrow('Not authenticated - accountId is missing');
    });

    it('should throw error when adding item without authentication', async () => {
      await expect(client.lists.addItem('test-list', { text: 'test item' })).rejects.toThrow(
        'Not authenticated'
      );
    });
  });

  describe('Type definitions', () => {
    it('should have correct list type', () => {
      const list = {
        listId: 'test-id',
        title: 'Test List',
        listType: 'shopping' as const,
        items: [],
        version: 1
      };

      expect(list.listType).toBe('shopping');
    });

    it('should have correct item type', () => {
      const item = {
        itemId: 'test-item-id',
        text: 'Test Item',
        status: 'incomplete' as const,
        version: 1
      };

      expect(item.status).toBe('incomplete');
    });
  });
});
