import { IProfilePersonal, IProfileResponse } from '../interfaces/profile.interface';
import { ProfileRepository } from '../repositories/profile.repository';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async createPersonalProfile(profileData: IProfilePersonal): Promise<IProfileResponse> {
    try {
      const profileId = await this.profileRepository.createPersonalProfile(profileData);

      return {
        success: true,
        message: 'Personal profile created successfully',
        data: {
          profile_id: profileId
        }
      };
    } catch (error: any) {
      if (error.message.includes('Invalid Account ID')) {
        return {
          success: false,
          message: 'Invalid Account ID'
        };
      }
      throw error;
    }
  }
} 