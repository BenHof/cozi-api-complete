/**
 * Additional tests for 100% coverage
 * Covers edge cases, error paths, and remaining methods
 */

import { AxiosInstance } from 'axios';
import { CalendarService } from '../services/CalendarService';
import { FamilyService } from '../services/FamilyService';
import { ListService } from '../services/ListService';
import { RecipeService } from '../services/RecipeService';
import { AccountService } from '../services/AccountService';

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

// ============ CalendarService Full Coverage ============
describe('CalendarService - Full Coverage', () => {
  let service: CalendarService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new CalendarService(mockClient, getAccountId);
  });

  describe('createAppointment', () => {
    it('should create appointment with correct year/month URL', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.createAppointment([
        {
          itemType: 'appointment',
          create: { startDay: '2026-03-15', details: { subject: 'Meeting' } }
        }
      ]);

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/3'),
        expect.any(Array)
      );
    });

    it('should use startDay from appointment if create.startDay not present', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.createAppointment([
        {
          itemType: 'appointment',
          startDay: '2026-06-20'
        }
      ]);

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/6'),
        expect.any(Array)
      );
    });

    it('should return early for empty appointments array', async () => {
      await service.createAppointment([]);
      expect(mockClient.post).not.toHaveBeenCalled();
    });

    it('should throw error if no startDay provided', async () => {
      await expect(service.createAppointment([{ itemType: 'appointment' }])).rejects.toThrow(
        'Appointment must have a startDay'
      );
    });
  });

  describe('updateAppointment', () => {
    it('should update appointment with correct year/month URL', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.updateAppointment({
        itemType: 'appointment',
        id: 'apt-123',
        edit: { startDay: '2026-07-10' }
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/7'),
        expect.any(Array)
      );
    });

    it('should use startDay if edit.startDay not present', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.updateAppointment({
        itemType: 'appointment',
        id: 'apt-123',
        startDay: '2026-08-25'
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/8'),
        expect.any(Array)
      );
    });

    it('should use selectedDay as fallback', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.updateAppointment({
        itemType: 'appointment',
        id: 'apt-123',
        selectedDay: '2026-09-15'
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/9'),
        expect.any(Array)
      );
    });

    it('should throw error if no date provided', async () => {
      await expect(
        service.updateAppointment({ itemType: 'appointment', id: 'apt-123' })
      ).rejects.toThrow('Update requires startDay');
    });
  });

  describe('deleteAppointment', () => {
    it('should delete appointment with correct year/month URL', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.deleteAppointment({
        itemType: 'appointment',
        id: 'apt-123',
        delete: { id: 'apt-123', version: 1 },
        selectedDay: '2026-10-05'
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/10'),
        expect.any(Array)
      );
    });

    it('should use startDay if selectedDay not present', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.deleteAppointment({
        itemType: 'appointment',
        id: 'apt-123',
        startDay: '2026-11-20'
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/calendar/2026/11'),
        expect.any(Array)
      );
    });

    it('should throw error if no date context provided', async () => {
      await expect(
        service.deleteAppointment({ itemType: 'appointment', id: 'apt-123' })
      ).rejects.toThrow('Delete requires date context');
    });
  });
});

// ============ FamilyService Full Coverage ============
describe('FamilyService - Full Coverage', () => {
  let service: FamilyService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new FamilyService(mockClient, getAccountId);
  });

  describe('addMember', () => {
    it('should add family member', async () => {
      const mockPerson = { accountPersonId: 'p1', name: 'Child', accountPersonType: 'attendee' };
      (mockClient.post as jest.Mock).mockResolvedValue({ data: mockPerson });

      const result = await service.addMember({
        name: 'Child',
        accountPersonType: 'attendee',
        isAdult: false,
        colorIndex: 3
      });

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/account/person/'),
        expect.objectContaining({ name: 'Child' })
      );
      expect(result.name).toBe('Child');
    });
  });

  describe('updateMember', () => {
    it('should update family member', async () => {
      const mockPerson = { accountPersonId: 'p1', name: 'Updated Name' };
      (mockClient.put as jest.Mock).mockResolvedValue({ data: mockPerson });

      const result = await service.updateMember('p1', { name: 'Updated Name' });

      expect(mockClient.put).toHaveBeenCalledWith(
        expect.stringContaining('/account/person/p1'),
        expect.objectContaining({ name: 'Updated Name' })
      );
      expect(result.name).toBe('Updated Name');
    });
  });

  describe('removeMember', () => {
    it('should remove family member', async () => {
      (mockClient.delete as jest.Mock).mockResolvedValue({});

      await service.removeMember('p1');

      expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining('/account/person/p1'));
    });
  });
});

// ============ ListService Full Coverage ============
describe('ListService - Full Coverage', () => {
  let service: ListService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new ListService(mockClient, getAccountId);
  });

  describe('getList', () => {
    it('should get a specific list', async () => {
      const mockList = {
        listId: 'list-1',
        title: 'Groceries',
        listType: 'shopping',
        items: [],
        version: 1
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getList('list-1');

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/list/list-1'));
      expect(result.title).toBe('Groceries');
    });
  });

  describe('createList', () => {
    it('should create a new list', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({ data: { id: 'new-list-1' } });

      const result = await service.createList({ name: 'New List', type: 'shopping' });

      expect(mockClient.post).toHaveBeenCalledWith(expect.stringContaining('/list/'), {
        name: 'New List',
        type: 'shopping'
      });
      expect(result).toBe('new-list-1');
    });
  });

  describe('deleteList', () => {
    it('should delete a list', async () => {
      (mockClient.delete as jest.Mock).mockResolvedValue({});

      await service.deleteList('list-1');

      expect(mockClient.delete).toHaveBeenCalledWith(expect.stringContaining('/list/list-1'));
    });
  });

  describe('updateItem', () => {
    it('should update a list item', async () => {
      (mockClient.put as jest.Mock).mockResolvedValue({});

      await service.updateItem('list-1', 'item-1', { text: 'Updated', version: 2 });

      expect(mockClient.put).toHaveBeenCalledWith(
        expect.stringContaining('/list/list-1/item/item-1'),
        { text: 'Updated', version: 2 }
      );
    });
  });

  describe('deleteItem', () => {
    it('should delete a list item', async () => {
      (mockClient.delete as jest.Mock).mockResolvedValue({});

      await service.deleteItem('list-1', 'item-1');

      expect(mockClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('/list/list-1/item/item-1')
      );
    });
  });

  describe('reorderList', () => {
    it('should reorder list items', async () => {
      (mockClient.post as jest.Mock).mockResolvedValue({});

      await service.reorderList('list-1', ['item-2', 'item-1', 'item-3']);

      expect(mockClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/list/list-1/reorder'),
        { itemIds: ['item-2', 'item-1', 'item-3'] }
      );
    });
  });

  describe('getItemsInSection - edge cases', () => {
    it('should return empty array if section not found', async () => {
      const mockList = {
        listId: 'list-1',
        title: 'Mock',
        listType: 'todo',
        version: 1,
        items: [{ id: '1', text: 'Item 1', completed: false, version: 1 }]
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', 'nonexistent');

      expect(result).toEqual([]);
    });

    it('should handle itemId field (legacy)', async () => {
      const mockList = {
        listId: 'list-1',
        items: [
          { itemId: 'sec-1', text: 'Section', itemType: 'header', completed: false, version: 1 },
          { itemId: 'item-1', text: 'Item 1', completed: false, version: 1 }
        ],
        title: 'Mock',
        listType: 'todo',
        version: 1
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', 'sec-1');

      expect(result).toHaveLength(1);
    });

    it('should handle list with null items', async () => {
      const mockList = { listId: 'list-1', items: null, title: 'Mock', listType: 'todo', version: 1 };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', 'sec-1');

      expect(result).toEqual([]);
    });

    it('should handle list with undefined items', async () => {
      const mockList = { listId: 'list-1', title: 'Mock', listType: 'todo', version: 1 };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', 'sec-1');

      expect(result).toEqual([]);
    });

    it('should get all items after last section until end of list', async () => {
      const mockList = {
        listId: 'list-1',
        items: [
          { id: 'sec-1', text: 'Section 1', itemType: 'header', completed: false, version: 1 },
          { id: 'item-1', text: 'Item 1', completed: false, version: 1 },
          { id: 'item-2', text: 'Item 2', completed: false, version: 1 }
          // No more sections - should get both items
        ],
        title: 'Mock',
        listType: 'todo',
        version: 1
      };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getItemsInSection('list-1', 'sec-1');

      expect(result).toHaveLength(2);
    });
  });

  describe('getSections - edge cases', () => {
    it('should handle list with null items', async () => {
      const mockList = { listId: 'list-1', items: null, title: 'Mock', listType: 'todo', version: 1 };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getSections('list-1');

      expect(result).toEqual([]);
    });

    it('should handle list with undefined items', async () => {
      const mockList = { listId: 'list-1', title: 'Mock', listType: 'todo', version: 1 };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockList });

      const result = await service.getSections('list-1');

      expect(result).toEqual([]);
    });
  });
});

// ============ RecipeService Full Coverage ============
describe('RecipeService - Full Coverage', () => {
  let service: RecipeService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new RecipeService(mockClient, getAccountId);
  });

  describe('getCuratedRecipes', () => {
    it('should fetch curated recipes', async () => {
      const mockRecipes = [
        { recipeId: 'c1', name: 'Curated Recipe', ingredients: [], photos: [] }
      ];
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockRecipes });

      const result = await service.getCuratedRecipes();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/food/curated/recipe/'));
      expect(result).toHaveLength(1);
    });
  });
});

// ============ AccountService Full Coverage ============
describe('AccountService - Full Coverage', () => {
  let service: AccountService;
  let mockClient: AxiosInstance;

  beforeEach(() => {
    mockClient = createMockClient();
    service = new AccountService(mockClient, getAccountId);
  });

  describe('getSubscription', () => {
    it('should fetch subscription info', async () => {
      const mockSub = { status: 'active', plan: 'gold' };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockSub });

      const result = await service.getSubscription();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/subscription/'));
      expect(result.status).toBe('active');
    });
  });

  describe('getConfig', () => {
    it('should fetch config', async () => {
      const mockConfig = { features: ['Feature1'] };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockConfig });

      const result = await service.getConfig();

      expect(mockClient.get).toHaveBeenCalledWith(expect.stringContaining('/config/'));
    });
  });

  describe('getUserSettings', () => {
    it('should fetch user settings', async () => {
      const mockSettings = { theme: 'dark' };
      (mockClient.get as jest.Mock).mockResolvedValue({ data: mockSettings });

      const result = await service.getUserSettings();

      expect(mockClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/account/user/settings')
      );
    });
  });
});
