// TODO add LogEntry class
export interface AuditLog {
  log(entry: LogEntry): Promise<void>;
}
