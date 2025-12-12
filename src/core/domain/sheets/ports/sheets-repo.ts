// TODO add CharacterSheetVersion class
export interface SheetsRepo {
  createVersion(version: CharacterSheetVersion): Promise<CharacterSheetVersion>;
  getLatest(characterId: string): Promise<CharacterSheetVersion | null>;
  listVersions(characterId: string): Promise<CharacterSheetVersion[]>;
}
