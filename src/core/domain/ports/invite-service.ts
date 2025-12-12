import { InviteLink } from '../entities/invite-link';
import { CampaignMember } from '../entities/campaign-member';

export interface InviteService {
  createInvite(campaignId: string, opts: {
    createdBy: string;
    roleOnJoin: 'player' | 'gm';
    expiresAt?: Date;
    maxUses?: number;
  }): Promise<InviteLink>;

  consumeInvite(token: string, userId: string): Promise<CampaignMember>;
}
