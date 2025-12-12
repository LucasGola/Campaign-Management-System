// TODO add InviteOptions class
// TODO add InviteLink class
// TODO add CampaignMember class
export interface InviteService {
  createInvite(campaignId: string, opts: InviteOptions): Promise<InviteLink>;
  consumeInvite(token: string, userId: string): Promise<CampaignMember>;
}
