import { BaseService } from './BaseService';
import {
  CoziAccount,
  CoziSubscription,
  CoziConfig,
  CoziSubscriptionProducts,
  CoziMealsConfig
} from '../types';

export class AccountService extends BaseService {
  /**
   * Get account info
   */
  async getAccountInfo(): Promise<CoziAccount> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziAccount>(`/api/ext/2004/${accountId}/account/`);
    return response.data;
  }

  /**
   * Get subscription info
   */
  async getSubscription(): Promise<CoziSubscription> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziSubscription>(
      `/api/ext/2004/${accountId}/subscription/`
    );
    return response.data;
  }

  /**
   * Get subscription products (available plans/pricing)
   */
  async getSubscriptionProducts(): Promise<CoziSubscriptionProducts> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziSubscriptionProducts>(
      `/api/ext/2004/${accountId}/subscription/product/`
    );
    return response.data;
  }

  /**
   * Get configuration
   */
  async getConfig(): Promise<CoziConfig> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziConfig>(`/api/ext/2004/${accountId}/config/`);
    return response.data;
  }

  /**
   * Get user settings (v2106)
   */
  async getUserSettings(): Promise<any> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<any>(`/api/ext/2106/${accountId}/account/user/settings`);
    return response.data;
  }

  /**
   * Get meals configuration (curated recipe categories)
   * Extracted from the config response for convenience
   */
  async getMealsConfig(): Promise<CoziMealsConfig | null> {
    const config = await this.getConfig();
    return (config as any)['feature.Meals'] || null;
  }
}
