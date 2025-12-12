import { CampaignsRepo } from '../../domain/ports/campaigns-repo';
import { Campaign } from '../../domain/entities/campaign';

export class CreateCampaignHandler {
  constructor(private campaignsRepo: CampaignsRepo) {}

  async execute(input: {
    ownerId: string;
    systemId: string;
    title: string;
    description?: string;
    public?: boolean;
    settings?: Record<string, any>;
  }) {
    const campaign = new Campaign(
      crypto.randomUUID(),
      {
        ownerId: input.ownerId,
        systemId: input.systemId,
        title: input.title,
        description: input.description,
        public: input.public ?? false,
        settings: input.settings ?? {},
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    return this.campaignsRepo.create(campaign);
  }
}
