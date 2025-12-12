import { SheetsRepo } from '../../domain/ports/sheets-repo';
import { CharactersRepo } from '../../domain/ports/characters-repo';
import { CharacterSheetVersion } from '../../domain/entities/character-sheet-version';

export class UpdateCharacterSheetHandler {
  constructor(
    private charactersRepo: CharactersRepo,
    private sheetsRepo: SheetsRepo
  ) {}

  async execute(input: {
    characterId: string;
    userId: string;
    patchData: Record<string, any>;
    changeSummary?: string;
  }) {
    const character = await this.charactersRepo.findById(input.characterId);
    if (!character) throw new Error('Character not found');

    const isOwner = character.props.ownerId === input.userId;
    const isGM = false; // será verificado via infra (campaignMembers)

    if (!isOwner && !isGM) {
      throw new Error('Not authorized');
    }

    const previous = await this.sheetsRepo.getLatest(input.characterId);

    const newData = {
      ...(previous?.props.sheetData ?? {}),
      ...input.patchData
    };

    const version = new CharacterSheetVersion(
      crypto.randomUUID(),
      {
        characterId: input.characterId,
        systemId: character.props.systemId,
        sheetData: newData,
        createdBy: input.userId,
        createdAt: new Date(),
        changeSummary: input.changeSummary ?? 'Update',
      }
    );

    return this.sheetsRepo.createVersion(version);
  }
}
