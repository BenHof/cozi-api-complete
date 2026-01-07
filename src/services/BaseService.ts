import { AxiosInstance } from 'axios';

export abstract class BaseService {
  constructor(
    protected client: AxiosInstance,
    protected getAccountId: () => string | null
  ) {}

  /**
   * Helper to ensure accountId exists before making requests
   */
  protected requireAccountId(): string {
    const accountId = this.getAccountId();
    if (!accountId) {
      throw new Error('Not authenticated - accountId is missing');
    }
    return accountId;
  }

  /**
   * Helper to append API Key if needed
   */
  protected withApiKey(url: string): string {
    if (url.includes('?')) {
      return `${url}&apikey=coziwc|v249_production`;
    }
    return `${url}?apikey=coziwc|v249_production`;
  }
}
