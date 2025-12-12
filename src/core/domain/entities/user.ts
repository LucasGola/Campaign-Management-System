export interface UserProps {
  email: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt: Date;
}

export class User {
  constructor(readonly id: string, readonly props: UserProps) {}
}
