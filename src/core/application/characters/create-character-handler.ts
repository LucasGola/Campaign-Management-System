import { CharactersRepo } from '../../domain/ports/characters-repo';
import { SheetsRepo } from '../../domain/ports/sheets-repo';
import { Character } from '../../domain/entities/character';
import { CharacterSheetVersion } from '../../domain/entities/character-sheet-version';

export class CreateCharacterHandler {
  constructor(
    private charactersRepo: CharactersRepo,
    private sheetsRepo: SheetsRepo
  ) {}

  async execute(input: {
    ownerId: string;
    systemId: string;
    name: string;
    baseData?: Record<string, any>;
    sheetData?: Record<string, any>;
  }) {
    const character = new Character(
      crypto.randomUUID(),
      {
        ownerId: input.ownerId,
        name: input.name,
        systemId: input.systemId,
        baseData: input.baseData ?? {},
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    const saved = await this.charactersRepo.save(character);

    if (input.sheetData) {
      const version = new CharacterSheetVersion(
        crypto.randomUUID(),
        {
          characterId: saved.id,
          systemId: input.systemId,
          sheetData: input.sheetData,
          createdBy: input.ownerId,
          createdAt: new Date(),
          changeSummary: 'Initial sheet',
        }
      );

      await this.sheetsRepo.createVersion(version);
    }

    return saved;
  }
}
