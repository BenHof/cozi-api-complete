import { BaseService } from './BaseService';
import { CoziPerson, CreatePersonRequest, UpdatePersonRequest } from '../types';

export class FamilyService extends BaseService {
  /**
   * Get family members
   */
  async getFamilyMembers(): Promise<CoziPerson[]> {
    const accountId = this.requireAccountId();
    const response = await this.client.get<CoziPerson[]>(
      this.withApiKey(`/api/ext/2004/${accountId}/account/person/`)
    );
    return response.data;
  }

  /**
   * Add family member
   */
  async addMember(person: CreatePersonRequest): Promise<CoziPerson> {
    const accountId = this.requireAccountId();
    const response = await this.client.post<CoziPerson>(
      this.withApiKey(`/api/ext/2004/${accountId}/account/person/`),
      person
    );
    return response.data;
  }

  /**
   * Update family member
   */
  async updateMember(personId: string, person: UpdatePersonRequest): Promise<CoziPerson> {
    const accountId = this.requireAccountId();
    const response = await this.client.put<CoziPerson>(
      this.withApiKey(`/api/ext/2004/${accountId}/account/person/${personId}`),
      person
    );
    return response.data;
  }

  /**
   * Remove family member
   */
  async removeMember(personId: string): Promise<void> {
    const accountId = this.requireAccountId();
    await this.client.delete(
      this.withApiKey(`/api/ext/2004/${accountId}/account/person/${personId}`)
    );
  }
}
