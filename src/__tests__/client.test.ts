/**
 * Tests for CoziApiClient and index exports
 * For 100% coverage
 */

import { CoziApiClient } from '../CoziApiClient';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CoziApiClient - Full Coverage', () => {
  let client: CoziApiClient;
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create a mock axios instance with all methods
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    };

    mockedAxios.create = jest.fn().mockReturnValue(mockAxiosInstance);
    client = new CoziApiClient({ debug: true });
  });

  describe('authenticate', () => {
    it('should authenticate and set session token', async () => {
      const mockResponse = {
        data: {
          accountId: 'acc-123',
          accessToken: 'token-xyz',
          accountPersonId: 'person-1',
          expiresIn: 3600
        }
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await client.authenticate('test@email.com', 'password123');

      expect(result.accountId).toBe('acc-123');
      expect(result.accessToken).toBe('token-xyz');
    });

    it('should log debug message when debug is enabled', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const mockResponse = {
        data: {
          accountId: 'acc-123',
          accessToken: 'token-xyz',
          accountPersonId: 'person-1',
          expiresIn: 3600
        }
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      await client.authenticate('test@email.com', 'password123');

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Authenticating'));
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Authenticated'),
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });
  });

  describe('setSessionToken', () => {
    it('should set token with accountId', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      client.setSessionToken('test-token', 'test-account');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Session restored'),
        expect.any(Object)
      );
      consoleSpy.mockRestore();
    });

    it('should set token without accountId', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      client.setSessionToken('test-token');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Request Interceptor', () => {
    it('should add Authorization header when token is set', () => {
      // Get the request interceptor that was registered
      const requestInterceptor = mockAxiosInstance.interceptors.request.use.mock.calls[0][0];

      // Mock having a session token set by calling setSessionToken
      client.setSessionToken('my-token', 'my-account');

      // Call the interceptor with a mock config
      const config = { headers: {} } as any;
      const result = requestInterceptor(config);

      // The interceptor should add the Bearer token
      expect(result.headers.Authorization).toBe('Bearer my-token');
    });
  });

  describe('Response Interceptor', () => {
    it('should pass through successful responses', () => {
      // Get the success interceptor (first argument to response.use)
      const successInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][0];

      const mockResponse = { data: { test: 'data' }, status: 200 };
      const result = successInterceptor(mockResponse);

      expect(result).toBe(mockResponse);
    });

    it('should transform errors to CoziApiError format', async () => {
      // Get the error interceptor (second argument to response.use)
      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      const mockError = {
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        },
        message: 'Request failed'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(errorInterceptor(mockError)).rejects.toMatchObject({
        code: '401',
        message: 'Request failed',
        details: { error: 'Unauthorized' }
      });

      // Debug mode should log the error
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should handle error without response', async () => {
      const errorInterceptor = mockAxiosInstance.interceptors.response.use.mock.calls[0][1];

      const mockError = {
        message: 'Network Error'
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(errorInterceptor(mockError)).rejects.toMatchObject({
        code: 'UNKNOWN_ERROR',
        message: 'Network Error'
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Convenience Proxy Methods', () => {
    beforeEach(async () => {
      // Authenticate to set accountId
      const mockResponse = {
        data: {
          accountId: 'acc-123',
          accessToken: 'token',
          accountPersonId: 'person-1',
          expiresIn: 3600
        }
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
      await client.authenticate('test@email.com', 'pass');
    });

    it('getLists should proxy to lists.getLists', async () => {
      mockAxiosInstance.get.mockResolvedValue({ data: [] });
      await client.getLists();
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('/list/'));
    });

    it('getList should proxy to lists.getList', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        data: {
          listId: 'l1',
          title: 'My List',
          listType: 'shopping',
          items: [],
          version: 1
        }
      });
      await client.getList('l1');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith(expect.stringContaining('/list/l1'));
    });

    it('createList should proxy to lists.createList', async () => {
      mockAxiosInstance.post.mockResolvedValue({ data: { id: 'new-1' } });
      await client.createList('New List', 'shopping');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining('/list/'),
        expect.objectContaining({ name: 'New List', type: 'shopping' })
      );
    });

    it('deleteList should proxy to lists.deleteList', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});
      await client.deleteList('l1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(expect.stringContaining('/list/l1'));
    });

    it('addItem should proxy to lists.addItem', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        data: {
          id: 'item-1',
          text: 'Milk',
          completed: false,
          version: 1,
          itemType: null
        }
      });
      await client.addItem('l1', 'Milk');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        expect.stringContaining('/list/l1/item/'),
        expect.objectContaining({ text: 'Milk' })
      );
    });

    it('removeItem should proxy to lists.deleteItem', async () => {
      mockAxiosInstance.delete.mockResolvedValue({});
      await client.removeItem('l1', 'item-1');
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        expect.stringContaining('/list/l1/item/item-1')
      );
    });

    it('markItem should proxy to lists.updateItem', async () => {
      mockAxiosInstance.put.mockResolvedValue({});
      await client.markItem('l1', 'item-1', true);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith(
        expect.stringContaining('/list/l1/item/item-1'),
        expect.objectContaining({ completed: true })
      );
    });
  });
});

// Test index.ts exports
describe('Index exports', () => {
  it('should export CoziApiClient', () => {
    const { CoziApiClient } = require('../index');
    expect(CoziApiClient).toBeDefined();
  });

  it('should export types', () => {
    const exports = require('../index');
    // Just verify the module exports something
    expect(Object.keys(exports).length).toBeGreaterThan(0);
  });

  it('should export services', () => {
    const exports = require('../index');
    expect(exports.AuthService).toBeDefined();
    expect(exports.ListService).toBeDefined();
    expect(exports.CalendarService).toBeDefined();
  });
});

// Test AuthService error path
describe('AuthService - Error Handling', () => {
  it('should re-throw errors from login', async () => {
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('Auth failed')),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as any;

    const { AuthService } = require('../services/AuthService');
    const service = new AuthService(mockClient, () => 'acc-123');

    await expect(service.login({ username: 'test', password: 'wrong' })).rejects.toThrow(
      'Auth failed'
    );
  });
});

// Test BaseService withApiKey edge case
describe('BaseService - withApiKey', () => {
  it('should add apikey with ? for URLs without query params', async () => {
    // Use addItem which calls withApiKey
    const { ListService } = require('../services/ListService');
    const mockClient = {
      post: jest.fn().mockResolvedValue({
        data: {
          id: 'item-1',
          text: 'Test',
          completed: false,
          version: 1,
          itemType: null
        }
      }),
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() }
      }
    } as any;

    const service = new ListService(mockClient, () => 'acc-123');
    await service.addItem('list-1', { text: 'Test' });

    // The call should include apikey
    expect(mockClient.post).toHaveBeenCalledWith(
      expect.stringContaining('apikey='),
      expect.any(Object)
    );
  });

  it('should add apikey with & when URL already has query params', () => {
    // Access the protected method via prototype
    const { BaseService } = require('../services/BaseService');

    // Create a concrete implementation inline
    const mockClient = {} as any;
    const getAccountId = () => 'acc-123';

    // Create instance using Object.create to bypass constructor typing
    const service = Object.create(BaseService.prototype);
    service.client = mockClient;
    service.getAccountId = getAccountId;

    // Access protected method via any
    const withApiKey = (service as any).withApiKey.bind(service);

    // URL without query params - should use ?
    const result1 = withApiKey('/api/endpoint');
    expect(result1).toBe('/api/endpoint?apikey=coziwc|v249_production');

    // URL with query params - should use &
    const result2 = withApiKey('/api/endpoint?existing=param');
    expect(result2).toBe('/api/endpoint?existing=param&apikey=coziwc|v249_production');
  });
});
