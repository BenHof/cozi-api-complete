import { BaseService } from './BaseService';
import { CoziAuthResponse, CoziCredentials } from '../types';
import { CoziAuthResponseSchema } from '../schemas';
import { AxiosInstance } from 'axios';

export class AuthService extends BaseService {
  constructor(client: AxiosInstance, getAccountId: () => string | null) {
    super(client, getAccountId);
  }

  /**
   * Authenticate with Cozi
   */
  async login(credentials: CoziCredentials): Promise<CoziAuthResponse> {
    // v2207 is for auth
    const response = await this.client.post<CoziAuthResponse>(
      'https://rest.cozi.com/api/ext/2207/auth/login',
      {
        username: credentials.username,
        password: credentials.password,
        issueRefresh: true
      }
    );

    return CoziAuthResponseSchema.parse(response.data);
  }
}
