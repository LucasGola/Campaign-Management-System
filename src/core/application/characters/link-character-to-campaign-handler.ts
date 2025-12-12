import { CharactersRepo } from '../../domain/ports/characters-repo';
import { CampaignsRepo } from '../../domain/ports/campaigns-repo';

export class LinkCharacterToCampaignHandler {
  constructor(
    private charactersRepo: CharactersRepo,
    private campaignsRepo: CampaignsRepo
  ) {}

  async execute(input: {
    characterId: string;
    campaignId: string;
    byUserId: string;
  }) {
    const character = await this.charactersRepo.findById(input.characterId);
    if (!character) throw new Error('Character not found');

    const campaign = await this.campaignsRepo.findById(input.campaignId);
    if (!campaign) throw new Error('Campaign not found');

    // permission check → basic domain rule
    const isOwner = character.props.ownerId === input.byUserId;
    const isGM = false; // será verificado no adapter (infra) → campaign-members

    if (!isOwner && !isGM) {
      throw new Error('Not authorized to link character');
    }

    await this.charactersRepo.linkToCampaign(input.characterId, input.campaignId);

    return { success: true };
  }
}
