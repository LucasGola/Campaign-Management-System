export interface InviteLinkProps {
  campaignId: string;
  token: string;
  createdBy: string;
  roleOnJoin: 'player' | 'gm';
  expiresAt?: Date;
  maxUses?: number;
  usesCount: number;
  createdAt: Date;
}

export class InviteLink {
  constructor(readonly id: string, readonly props: InviteLinkProps) {}

  isExpired(): boolean {
    return !!this.props.expiresAt && this.props.expiresAt < new Date();
  }

  canBeUsed(): boolean {
    if (this.isExpired()) return false;
    if (this.props.maxUses && this.props.usesCount >= this.props.maxUses) return false;
    return true;
  }
}
