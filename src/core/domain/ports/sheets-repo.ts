import { CharacterSheetVersion } from '../entities/character-sheet-version';

export interface SheetsRepo {
  createVersion(v: CharacterSheetVersion): Promise<CharacterSheetVersion>;
  getLatest(characterId: string): Promise<CharacterSheetVersion | null>;
  listVersions(characterId: string): Promise<CharacterSheetVersion[]>;
}
