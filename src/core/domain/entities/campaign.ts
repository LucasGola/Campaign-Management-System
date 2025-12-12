export interface CampaignProps {
  ownerId: string;
  systemId: string;
  title: string;
  description?: string;
  public: boolean;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export class Campaign {
  constructor(readonly id: string, readonly props: CampaignProps) {}
}
