// TODO add Campaign class
export interface CampaignsRepo {
  create(c: Campaign): Promise<Campaign>;
  findById(id: string): Promise<Campaign | null>;
  listByOwner(ownerId: string): Promise<Campaign[]>;
  addMember(campaignId: string, member: CampaignMember): Promise<void>;
  removeMember(campaignId: string, userId: string): Promise<void>;
}
