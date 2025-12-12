export interface AuditLog {
  log(entry: {
    entity: string;
    entityId: string;
    action: string;
    performedBy: string;
    diff?: Record<string, any>;
    createdAt: Date;
  }): Promise<void>;
}
