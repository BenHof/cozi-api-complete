import { BaseService } from './BaseService';
import { CoziRecipe, CreateRecipeRequest } from '../types';
import { CoziRecipeSchema } from '../schemas';
import { z } from 'zod';

export class RecipeService extends BaseService {
  /**
   * Get all recipes
   */
  async getRecipes(): Promise<CoziRecipe[]> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziRecipe[]>(
      // v2103
      `/api/ext/2103/${accountId}/food/recipe/`
    );
    return z.array(CoziRecipeSchema).parse(response.data);
  }

  /**
   * Get curated recipes
   */
  async getCuratedRecipes(): Promise<CoziRecipe[]> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziRecipe[]>(
      `/api/ext/2103/${accountId}/food/curated/recipe/`
    );
    return z.array(CoziRecipeSchema).parse(response.data);
  }

  /**
   * Create recipe
   */
  async createRecipe(recipe: CreateRecipeRequest): Promise<CoziRecipe> {
    const accountId = this.requireAccountId();
    const response = await this.client.post<CoziRecipe>(
      this.withApiKey(`/api/ext/2103/${accountId}/food/recipe/`),
      recipe
    );
    return CoziRecipeSchema.parse(response.data);
  }

  /**
   * Delete recipe
   */
  async deleteRecipe(recipeId: string): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.delete(this.withApiKey(`/api/ext/2103/${accountId}/food/recipe/${recipeId}`));
  }

  // TODO: Implement photo upload if we can handle multipart/form-data easily with axios here
  // Reference: POST /api/ext/2103/{accountId}/food/recipe/{recipeId}/photo
}
