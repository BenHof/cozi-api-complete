import { BaseService } from './BaseService';
import { CoziIterableToken } from '../types';

export class NotificationService extends BaseService {
  /**
   * Get push notification token for Iterable integration
   * @param personId - The person ID to get token for
   */
  async getToken(personId: string): Promise<CoziIterableToken> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziIterableToken>(
      this.withApiKey(`/api/ext/2307/${accountId}/iterable/${personId}/token`)
    );
    return response.data;
  }

  /**
   * Register push notification token
   * @param personId - The person ID to register token for
   * @param deviceToken - The device push token
   * @param platform - Platform identifier (e.g., 'ios', 'android', 'web')
   */
  async registerToken(personId: string, deviceToken: string, platform: string): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.post(
      this.withApiKey(`/api/ext/2307/${accountId}/iterable/${personId}/token`),
      { token: deviceToken, platform }
    );
  }
}
