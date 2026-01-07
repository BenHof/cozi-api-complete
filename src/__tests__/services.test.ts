/**
 * Unit tests for all Services
 */

import axios, { AxiosInstance } from 'axios';
import { AuthService } from '../services/AuthService';
import { ListService } from '../services/ListService';
import { CalendarService } from '../services/CalendarService';
import { RecipeService } from '../services/RecipeService';
import { FamilyService } from '../services/FamilyService';
import { AccountService } from '../services/AccountService';
import { NotificationService } from '../services/NotificationService';

// Create mock axios instance
const createMockClient = () =>
  ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    }
  }) as unknown as AxiosInstance;

const mockAccountId = 'test-account-123';
const getAccountId = () => mockAccountId;

describe('AuthService', () => {
  let service: AuthService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new AuthService(mockClient, getAccountId);
  });

  describe('login', () => {
    it('should call login endpoint with credentials', async () => {
      const mockResponse = {
        data: {
          accountId: 'acc-123',
          accessToken: 'token-xyz',
          accountPersonId: 'person-1',
          expiresIn: 3600
        }
      };
      (mockClient.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await service.login({ username: 'test@email.com', password: 'password123' });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({
          username: 'test@email.com',
          password: 'password123'
        })
      );
      expect(result.accountId).toBe('acc-123');
    });
  });
});

describe('ListService', () => {
  let service: ListService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new ListService(mockClient, getAccountId);
  });

  describe('getLists', () => {
    it('should fetch all lists', async () => {
      const mockLists = [
        { listId: '1', title: 'Groceries', listType: 'shopping', items: [], version: 1 },
        { listId: '2', title: 'Todo', listType: 'todo', items: [], version: 1 }
      ];
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockLists });

      const result = await service.getLists();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/list/'));
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Groceries');
    });
  });

  describe('addItem', () => {
    it('should add item to list', async () => {
      const mockItem = { id: 'item-1', text: 'Milk', completed: false, version: 1 };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: mockItem });

      const result = await service.addItem('list-1', { text: 'Milk' });

      expect(mockClient.post).toHaveBeenCalledWith(expect.stringContaining('/list/list-1/item/'), {
        text: 'Milk'
      });
      expect(result.text).toBe('Milk');
    });
  });

  describe('addSection', () => {
    it('should add section header to list', async () => {
      const mockSection = {
        id: 'sec-1',
        text: 'Dairy',
        itemType: 'header',
        completed: false,
        version: 1
      };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: mockSection });

      const result = await service.addSection('list-1', 'Dairy');

      expect(mockClient.post).toHaveBeenCalledWith(expect.stringContaining('/list/list-1/item/'), {
        text: 'Dairy',
        itemType: 'header'
      });
    });
  });

  describe('getSections', () => {
    it('should filter items to return only headers', async () => {
      const mockList = {
        listId: 'list-1',
        title: 'Groceries',
        listType: 'shopping',
        version: 1,
        items: [
          { id: '1', text: 'Dairy', itemType: 'header', completed: false, version: 1 },
          { id: '2', text: 'Milk', itemType: null, completed: false, version: 1 },
          { id: '3', text: 'Produce', itemType: 'header', completed: false, version: 1 },
          { id: '4', text: 'Apples', itemType: null, completed: false, version: 1 }
        ]
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getSections('list-1');

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Dairy');
      expect(result[1].text).toBe('Produce');
    });
  });

  describe('getItemsInSection', () => {
    it('should return items between section headers', async () => {
      const mockList = {
        listId: 'list-1',
        title: 'Groceries',
        listType: 'shopping',
        version: 1,
        items: [
          { id: '1', text: 'Dairy', itemType: 'header', completed: false, version: 1 },
          { id: '2', text: 'Milk', itemType: null, completed: false, version: 1 },
          { id: '3', text: 'Cheese', itemType: null, completed: false, version: 1 },
          { id: '4', text: 'Produce', itemType: 'header', completed: false, version: 1 },
          { id: '5', text: 'Apples', itemType: null, completed: false, version: 1 }
        ]
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', '1');

      expect(result).toHaveLength(2);
      expect(result[0].text).toBe('Milk');
      expect(result[1].text).toBe('Cheese');
    });
  });
});

describe('CalendarService', () => {
  let service: CalendarService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new CalendarService(mockClient, getAccountId);
  });

  describe('getCalendar', () => {
    it('should fetch calendar for specified month', async () => {
      const mockCalendar = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        items: [],
        days: {}
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockCalendar });

      const result = await service.getCalendar(2026, 1);

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/calendar/2026/1'));
      expect(result.startDate).toBe('2026-01-01');
    });
  });

  describe('search', () => {
    it('should search calendar with query', async () => {
      const mockResults = { items: {} };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockResults });

      await service.search('meeting');

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('q=meeting'));
    });
  });

  describe('getBirthdays', () => {
    it('should extract birthdays from calendar response', async () => {
      const mockCalendar = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        items: [],
        birthdaysById: {
          b1: { id: 'b1', name: 'John', date: '2026-01-15' },
          b2: { id: 'b2', name: 'Jane', date: '2026-01-20' }
        }
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockCalendar });

      const result = await service.getBirthdays(2026, 1);

      expect(result).toHaveLength(2);
    });

    it('should return empty array if no birthdays', async () => {
      const mockCalendar = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        items: []
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockCalendar });

      const result = await service.getBirthdays(2026, 1);

      expect(result).toEqual([]);
    });
  });

  describe('getHolidays', () => {
    it('should extract holidays from calendar response', async () => {
      const mockCalendar = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        items: [],
        holidaysById: {
          h1: { id: 'h1', name: 'New Year', date: '2026-01-01' }
        }
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockCalendar });

      const result = await service.getHolidays(2026, 1);

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('New Year');
    });

    it('should return empty array if no holidaysById', async () => {
      const mockCalendar = {
        startDate: '2026-01-01',
        endDate: '2026-01-31',
        items: []
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockCalendar });

      const result = await service.getHolidays(2026, 1);

      expect(result).toEqual([]);
    });
  });
});

describe('RecipeService', () => {
  let service: RecipeService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new RecipeService(mockClient, getAccountId);
  });

  describe('getRecipes', () => {
    it('should fetch user recipes', async () => {
      const mockRecipes = [
        { recipeId: 'r1', name: 'Pasta', ingredients: [], photos: [] },
        { recipeId: 'r2', name: 'Salad', ingredients: [], photos: [] }
      ];
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });

      const result = await service.getRecipes();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/food/recipe/'));
      expect(result).toHaveLength(2);
    });
  });

  describe('createRecipe', () => {
    it('should create recipe with ingredients', async () => {
      const mockCreated = {
        recipeId: 'new-1',
        name: 'Test Recipe',
        ingredients: [],
        photos: []
      };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: mockCreated });

      const result = await service.createRecipe({
        name: 'Test Recipe',
        ingredients: [{ name: 'Flour' }]
      } as any);

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/food/recipe/'),
        expect.objectContaining({ name: 'Test Recipe' })
      );
      expect(result.recipeId).toBe('new-1');
    });
  });

  describe('deleteRecipe', () => {
    it('should delete recipe by id', async () => {
      (mockClient.delete as jest.Mock).mockResolvedValue({});

      await service.deleteRecipe('recipe-123');

      expect(mockClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('/food/recipe/recipe-123')
      );
    });
  });
});

describe('FamilyService', () => {
  let service: FamilyService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new FamilyService(mockClient, getAccountId);
  });

  describe('getFamilyMembers', () => {
    it('should fetch all family members', async () => {
      const mockMembers = [
        { accountPersonId: 'p1', name: 'Parent' },
        { accountPersonId: 'p2', name: 'Child' }
      ];
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockMembers });

      const result = await service.getFamilyMembers();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/account/person/'));
      expect(result).toHaveLength(2);
    });
  });
});

describe('AccountService', () => {
  let service: AccountService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new AccountService(mockClient, getAccountId);
  });

  describe('getAccountInfo', () => {
    it('should fetch account information', async () => {
      const mockAccount = { accountId: 'acc-1', name: 'Test Family' };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockAccount });

      const result = await service.getAccountInfo();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/account/'));
      expect(result.name).toBe('Test Family');
    });
  });

  describe('getSubscriptionProducts', () => {
    it('should fetch subscription products', async () => {
      const mockProducts = { products: [{ productName: 'gold' }] };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockProducts });

      const result = await service.getSubscriptionProducts();

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/subscription/product/')
      );
    });
  });

  describe('getMealsConfig', () => {
    it('should extract meals config from full config', async () => {
      const mockConfig = {
        features: ['MealPlanner'],
        'feature.Meals': { curated: { recipes: [] } }
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockConfig });

      const result = await service.getMealsConfig();

      expect(result).toHaveProperty('curated');
    });

    it('should return null if meals config not present', async () => {
      const mockConfig = { features: [] };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockConfig });

      const result = await service.getMealsConfig();

      expect(result).toBeNull();
    });
  });
});

describe('NotificationService', () => {
  let service: NotificationService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new NotificationService(mockClient, getAccountId);
  });

  describe('getToken', () => {
    it('should fetch push token for person', async () => {
      const mockToken = { token: 'push-token-123', expiresAt: '2026-04-01' };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockToken });

      const result = await service.getToken('person-1');

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/iterable/person-1/token')
      );
      expect(result.token).toBe('push-token-123');
    });
  });

  describe('registerToken', () => {
    it('should register device token', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.registerToken('person-1', 'device-token', 'ios');

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/iterable/person-1/token'),
        { token: 'device-token', platform: 'ios' }
      );
    });
  });
});

describe('BaseService', () => {
  it('should throw error when accountId is missing', async () => {
    const mockClient = createMockClient();
    const service = new ListService(mockClient, () => null);

    await expect(service.getLists()).rejects.toThrow('Not authenticated');
  });
});
