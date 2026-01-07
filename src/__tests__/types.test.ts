/**
 * Type definition tests
 */

import type {
  CoziCredentials,
  CoziList,
  CoziListItem,
  CoziAuthResponse,
  CreateListRequest,
  AddListItemRequest,
  CoziRecipe,
  CoziPerson,
  CoziBirthday,
  CoziHoliday,
  ListItemType
} from '../types';

describe('Type Definitions', () => {
  describe('CoziCredentials', () => {
    it('should have correct structure', () => {
      const credentials: CoziCredentials = {
        username: 'test@example.com',
        password: 'password123'
      };

      expect(credentials).toHaveProperty('username');
      expect(credentials).toHaveProperty('password');
    });
  });

  describe('CoziAuthResponse', () => {
    it('should have correct structure', () => {
      const authResponse: CoziAuthResponse = {
        accountId: 'account-123',
        accountPersonId: 'person-456',
        accessToken: 'token-789',
        expiresIn: 3600
      };

      expect(authResponse).toHaveProperty('accountId');
      expect(authResponse).toHaveProperty('accountPersonId');
      expect(authResponse).toHaveProperty('accessToken');
      expect(authResponse).toHaveProperty('expiresIn');
    });
  });

  describe('CoziList', () => {
    it('should have correct structure', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Shopping List',
        listType: 'shopping',
        items: [],
        version: 1
      };

      expect(list).toHaveProperty('listId');
      expect(list).toHaveProperty('title');
      expect(list).toHaveProperty('listType');
      expect(list).toHaveProperty('items');
      expect(list).toHaveProperty('version');
    });

    it('should support shopping list type', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Shopping List',
        listType: 'shopping',
        items: [],
        version: 1
      };

      expect(list.listType).toBe('shopping');
    });

    it('should support todo list type', () => {
      const list: CoziList = {
        listId: 'list-123',
        title: 'Todo List',
        listType: 'todo',
        items: [],
        version: 1
      };

      expect(list.listType).toBe('todo');
    });
  });

  describe('CoziListItem', () => {
    it('should have correct structure', () => {
      const item: CoziListItem = {
        id: 'item-123',
        text: 'Buy milk',
        completed: false,
        version: 1
      };

      expect(item).toHaveProperty('id');
      expect(item).toHaveProperty('text');
      expect(item).toHaveProperty('completed');
      expect(item).toHaveProperty('version');
    });

    it('should support section headers', () => {
      const item: CoziListItem = {
        id: 'item-123',
        text: 'Dairy',
        completed: false,
        version: 1,
        itemType: 'header'
      };

      expect(item.itemType).toBe('header');
    });

    it('should support null itemType for regular items', () => {
      const itemType: ListItemType = null;
      expect(itemType).toBeNull();
    });
  });

  describe('Request Types', () => {
    it('CreateListRequest should have correct structure', () => {
      const request: CreateListRequest = {
        name: 'New List',
        type: 'shopping'
      };

      expect(request).toHaveProperty('name');
      expect(request).toHaveProperty('type');
    });

    it('AddListItemRequest should have correct structure', () => {
      const request: AddListItemRequest = {
        text: 'New item'
      };

      expect(request).toHaveProperty('text');
    });

    it('AddListItemRequest should support itemType for sections', () => {
      const request: AddListItemRequest = {
        text: 'Produce',
        itemType: 'header'
      };

      expect(request.itemType).toBe('header');
    });
  });

  describe('CoziRecipe', () => {
    it('should have correct structure', () => {
      const recipe: CoziRecipe = {
        recipeId: 'recipe-123',
        name: 'Test Recipe',
        ingredients: [{ name: 'Flour' }],
        photos: []
      };

      expect(recipe).toHaveProperty('recipeId');
      expect(recipe).toHaveProperty('name');
      expect(recipe).toHaveProperty('ingredients');
    });
  });

  describe('CoziBirthday', () => {
    it('should have correct structure', () => {
      const birthday: CoziBirthday = {
        id: 'b-123',
        name: 'John Doe',
        date: '2026-05-15'
      };

      expect(birthday).toHaveProperty('id');
      expect(birthday).toHaveProperty('name');
      expect(birthday).toHaveProperty('date');
    });
  });

  describe('CoziHoliday', () => {
    it('should have correct structure', () => {
      const holiday: CoziHoliday = {
        id: 'h-123',
        name: 'New Year',
        date: '2026-01-01'
      };

      expect(holiday).toHaveProperty('id');
      expect(holiday).toHaveProperty('name');
      expect(holiday).toHaveProperty('date');
    });
  });
});
