import { Character } from '../entities/character';

export interface CharactersRepo {
  save(character: Character): Promise<Character>;
  findById(id: string): Promise<Character | null>;
  listByOwner(ownerId: string): Promise<Character[]>;
  linkToCampaign(characterId: string, campaignId: string): Promise<void>;
  unlinkFromCampaign(characterId: string, campaignId: string): Promise<void>;
}
