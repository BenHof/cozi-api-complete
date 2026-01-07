import { BaseService } from './BaseService';
import {
  CoziList,
  CreateListRequest,
  AddListItemRequest,
  UpdateListItemRequest,
  CoziListItem
} from '../types';
import { CoziListSchema, CoziListItemSchema } from '../schemas';
import { z } from 'zod';

export class ListService extends BaseService {
  /**
   * Get all lists
   */
  async getLists(): Promise<CoziList[]> {
    const accountId = this.requireAccountId();
    // v2004
    const response = await this.client.get<CoziList[]>(`/api/ext/2004/${accountId}/list/`);
    return z.array(CoziListSchema).parse(response.data);
  }

  /**
   * Get a specific list
   */
  async getList(listId: string): Promise<CoziList> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziList>(`/api/ext/2004/${accountId}/list/${listId}`);
    return CoziListSchema.parse(response.data);
  }

  /**
   * Create a new list
   */
  async createList(request: CreateListRequest): Promise<string> {
    const accountId = this.requireAccountId();
    const response = await this.client.post<{ id: string }>(
      this.withApiKey(`/api/ext/2004/${accountId}/list/`),
      request
    );
    const schema = z.object({ id: z.string() });
    const data = schema.parse(response.data);
    return data.id;
  }

  /**
   * Delete a list
   */
  async deleteList(listId: string): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.delete(this.withApiKey(`/api/ext/2004/${accountId}/list/${listId}`));
  }

  /**
   * Add item to list
   */
  async addItem(listId: string, request: AddListItemRequest): Promise<CoziListItem> {
    const accountId = this.requireAccountId();
    const response = await this.client.post<CoziListItem>(
      this.withApiKey(`/api/ext/2004/${accountId}/list/${listId}/item/`),
      request
    );
    return CoziListItemSchema.parse(response.data);
  }

  /**
   * Edit item
   */
  async updateItem(listId: string, itemId: string, request: UpdateListItemRequest): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.put(
      this.withApiKey(`/api/ext/2004/${accountId}/list/${listId}/item/${itemId}`),
      request
    );
  }

  /**
   * Delete item
   */
  async deleteItem(listId: string, itemId: string): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.delete(
      this.withApiKey(`/api/ext/2004/${accountId}/list/${listId}/item/${itemId}`)
    );
  }

  /**
   * Reorder list
   */
  async reorderList(listId: string, itemIds: string[]): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.post(this.withApiKey(`/api/ext/2004/${accountId}/list/${listId}/reorder`), {
      itemIds
    });
  }

  // ============ Section Helpers ============

  /**
   * Add a section header to a list
   * Sections are items with itemType: 'header'
   */
  async addSection(listId: string, sectionName: string): Promise<CoziListItem> {
    return this.addItem(listId, { text: sectionName, itemType: 'header' });
  }

  /**
   * Get all sections (headers) from a list
   */
  async getSections(listId: string): Promise<CoziListItem[]> {
    const list = await this.getList(listId);
    return (list.items || []).filter(item => item.itemType === 'header');
  }

  /**
   * Get items under a section (items between this header and the next)
   * Returns items from after the section header until the next header or end of list
   */
  async getItemsInSection(listId: string, sectionItemId: string): Promise<CoziListItem[]> {
    const list = await this.getList(listId);
    const items = list.items || [];

    // Find the section header
    const sectionIndex = items.findIndex(item => item.id === sectionItemId);
    if (sectionIndex === -1) return [];

    // Get items after the section until next header
    const result: CoziListItem[] = [];
    for (let i = sectionIndex + 1; i < items.length; i++) {
      const item = items[i];
      if (item.itemType === 'header') break; // Stop at next section
      result.push(item);
    }
    return result;
  }
}
