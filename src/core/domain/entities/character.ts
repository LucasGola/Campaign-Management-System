export interface CharacterProps {
  ownerId: string;
  name: string;
  systemId: string;
  baseData?: Record<string, any>;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Character {
  constructor(readonly id: string, readonly props: CharacterProps) {}

  canBeViewedBy(userId: string): boolean {
    return this.props.ownerId === userId;
  }
}
