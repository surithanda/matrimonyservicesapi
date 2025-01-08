import { IProfilePersonal, IProfileResponse, IProfileAddress } from '../interfaces/profile.interface';
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
          profile_id: profileId,
          profile: profileData
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

  async createProfileAddress(addressData: IProfileAddress): Promise<IProfileResponse> {
    try {
      await this.profileRepository.createProfileAddress(addressData);

      return {
        success: true,
        message: 'Profile address created successfully'
      };
    } catch (error: any) {
      if (error.message.includes('Profile doesnot exist')) {
        return {
          success: false,
          message: 'Profile does not exist'
        };
      }
      throw error;
    }
  }
} 