import { IProfilePersonal, IProfileResponse, IProfileAddress, IProfileEducation, IProfileEmployment } from '../interfaces/profile.interface';
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

  async createProfileEducation(educationData: IProfileEducation): Promise<IProfileResponse> {
    try {
      await this.profileRepository.createProfileEducation(educationData);

      return {
        success: true,
        message: 'Profile education created successfully'
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

  async createProfileEmployment(employmentData: IProfileEmployment): Promise<IProfileResponse> {
    try {
      await this.profileRepository.createProfileEmployment(employmentData);

      return {
        success: true,
        message: 'Profile employment created successfully'
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