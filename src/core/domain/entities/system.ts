export interface SystemProps {
  name: string;
  version: string;
  metadata?: Record<string, any>;
}

export class System {
  constructor(readonly id: string, readonly props: SystemProps) {}
}
