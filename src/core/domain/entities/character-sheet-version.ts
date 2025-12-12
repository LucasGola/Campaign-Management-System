export interface CharacterSheetVersionProps {
  characterId: string;
  systemId: string;
  sheetData: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  changeSummary?: string;
}

export class CharacterSheetVersion {
  constructor(readonly id: string, readonly props: CharacterSheetVersionProps) {}
}
