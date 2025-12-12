import { Campaign } from '../entities/campaign';
import { CampaignMember } from '../entities/campaign-member';

export interface CampaignsRepo {
  create(campaign: Campaign): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  listByOwner(ownerId: string): Promise<Campaign[]>;
  addMember(campaignId: string, member: CampaignMember): Promise<void>;
  removeMember(campaignId: string, userId: string): Promise<void>;
}
