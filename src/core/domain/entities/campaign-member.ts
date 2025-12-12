export type CampaignRole = 'player' | 'gm' | 'owner';

export interface CampaignMemberProps {
  campaignId: string;
  userId: string;
  role: CampaignRole;
  joinedAt: Date;
  activeCharacterId?: string;
}

export class CampaignMember {
  constructor(readonly id: string, readonly props: CampaignMemberProps) {}
}
