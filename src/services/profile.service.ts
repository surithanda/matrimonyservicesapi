import { IProfilePersonal, IProfileResponse, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
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

  async createProfileProperty(propertyData: IProfileProperty): Promise<IProfileResponse> {
    try {
      const propertyId = await this.profileRepository.createProfileProperty(propertyData);

      return {
        success: true,
        message: 'Profile property created successfully',
        data: {
          profile_id: propertyId,
        }
      };
    } catch (error: any) {
      if (error.message.includes('Profile does not exist')) {
        return {
          success: false,
          message: 'Profile does not exist'
        };
      }
      throw error;
    }
  }

  async createFamilyReference(referenceData: IProfileFamilyReference): Promise<IProfileResponse> {
    try {
      const referenceId = await this.profileRepository.createFamilyReference(referenceData);

      return {
        success: true,
        message: 'Family reference created successfully',
        data: {
          reference_id: referenceId,
        }
      };
    } catch (error: any) {
      if (error.message.includes('Profile does not exist')) {
        return {
          success: false,
          message: 'Profile does not exist'
        };
      }
      throw error;
    }
  }

  async createProfileLifestyle(lifestyleData: IProfileLifestyle): Promise<IProfileResponse> {
    try {
      await this.profileRepository.createProfileLifestyle(lifestyleData);

      return {
        success: true,
        message: 'Profile lifestyle created successfully',
      };
    } catch (error: any) {
      if (error.message.includes('Invalid profile_id')) {
        return {
          success: false,
          message: 'Invalid profile_id. It must be a valid existing profile_id.'
        };
      }
      throw error;
    }
  }

  async createProfilePhoto(photoData: IProfilePhoto): Promise<IProfileResponse> {
    try {
      const photoId = await this.profileRepository.createProfilePhoto(photoData);

      return {
        success: true,
        message: 'Profile photo created successfully',
        data: {
          photo_id: photoId,
        }
      };
    } catch (error: any) {
      if (error.message.includes('Profile does not exist')) {
        return {
          success: false,
          message: 'Profile does not exist'
        };
      }
      throw error;
    }
  }

  async updateProfileEducation(
    profile_education_id: number,
    educationData: IProfileEducation,
    ip_address: string,
    browser_profile: string
  ): Promise<IProfileResponse> {
    try {
      const updatedId = await this.profileRepository.updateProfileEducation(
        profile_education_id,
        educationData,
        ip_address,
        browser_profile
      );

      return {
        success: true,
        message: 'Profile education updated successfully',
        data: {
          profile_education_id: updatedId
        }
      };
    } catch (error: any) {
      if (error.message.includes('Profile does not exist')) {
        return {
          success: false,
          message: 'Profile does not exist for the given profile_id'
        };
      }
      if (error.message.includes('Profile education record does not exist')) {
        return {
          success: false,
          message: 'Profile education record does not exist for the given profile_education_id'
        };
      }
      throw error;
    }
  }

  async deleteProfileEducation(
    profile_education_id: number,
    profile_id: number,
    user_deleted: string,
    ip_address: string,
    browser_profile: string
  ): Promise<IProfileResponse> {
    try {
      const deletedId = await this.profileRepository.deleteProfileEducation(
        profile_education_id,
        profile_id,
        user_deleted,
        ip_address,
        browser_profile
      );

      return {
        success: true,
        message: 'Profile education deleted successfully',
        data: {
          profile_education_id: deletedId
        }
      };
    } catch (error: any) {
      if (error.message.includes('Profile does not exist')) {
        return {
          success: false,
          message: 'Profile does not exist for the given profile_id'
        };
      }
      if (error.message.includes('Profile education record does not exist')) {
        return {
          success: false,
          message: 'Profile education record does not exist for the given profile_education_id'
        };
      }
      throw error;
    }
  }

  async getProfileDetails(profileId: number): Promise<IProfileResponse> {
    try {
      const profileDetails = await this.profileRepository.getProfileDetails(profileId);
      
      return {
        success: true,
        message: 'Profile details retrieved successfully',
        data: profileDetails
      };
    } catch (error: any) {
      if (error.message === 'Profile not found') {
        return {
          success: false,
          message: 'Profile not found'
        };
      }
      throw error;
    }
  }
}