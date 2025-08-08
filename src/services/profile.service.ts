import { IProfilePersonal, IProfileResponse, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import { IProfileHobbyInterest } from '../interfaces/hobby.interface';
import { ProfileRepository } from '../repositories/profile.repository';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  validateResponse = (response:any, successMessage:string) => {
    console.log("Response from repository:", response);
      if(response) {
        if(response?.error_code === null || (!response?.hasOwnProperty('error_code') && response?.status === 'success'))
          return {
            success: true,
            message: successMessage,
            data: response
          };
        else {
          return {
            success: false,
            message: response?.error_message,
            ...response
          };
        }
      } else { //assuming the call went through successfully but there is no matching record
        return {
            success: true,
            message: successMessage,
            data: null
          };
      }

  } 

  async getPersonalProfile(profileData: IProfilePersonal): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.getPersonalProfile(profileData);

      return this.validateResponse(response, 'Personal profile fetched successfully');
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

  async createPersonalProfile(profileData: IProfilePersonal): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.createPersonalProfile(profileData);

      if(response?.error_code === null)
          return {
            success: true,
            message: 'Personal profile created successfully',
            data: {
              profile_id: response?.profile_id,
              profile: profileData
            }
          };
        else {
          return {
            success: false,
            message: response?.error_message,
            ...response
          };
        }

      
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


  async getProfileAddress(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileAddress(profileData);

      return this.validateResponse(response, 'Profile address fetched successfully');
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
      const response = await this.profileRepository.createProfileAddress(addressData);

      return {
        success: true,
        message: 'Profile address created successfully',
        ...(response as any)
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

  // 
  async getProfileEducation(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileEducation(profileData);

      return this.validateResponse(response, 'Profile education fetched successfully');
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

  async createProfileEducation(educationData: IProfileEducation): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.createProfileEducation(educationData);

      return {
        success: true,
        message: 'Profile education created successfully',
        ...(response as any)
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

  // 
  async getProfileEmployment(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileEmployment(profileData);

      return this.validateResponse(response, 'Profile employment fetched successfully');
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

  async createProfileEmployment(employmentData: IProfileEmployment): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.createProfileEmployment(employmentData);

      return {
        success: true,
        message: 'Profile employment created successfully',
        ...(response as any)
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

  
  // 
  async getProfileProperty(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileProperty(profileData);

      return this.validateResponse(response, 'Profile property fetched successfully');
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
  
  async createProfileProperty(propertyData: IProfileProperty): Promise<any> {
    try {
      const property:any = await this.profileRepository.createProfileProperty(propertyData);

      return {
        success: true,
        message: 'Profile property created successfully',
        data: property,
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

  // 
  async getFamilyReference(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getFamilyReference(profileData);

      return this.validateResponse(response, 'Profile family reference fetched successfully');
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

  async createFamilyReference(referenceData: IProfileFamilyReference): Promise<any> {
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

  // 
  async getProfileLifestyle(profileData: IProfilePersonal): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileLifestyle(profileData);

      return this.validateResponse(response, 'Profile lifestyle fetched successfully');
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

  async createProfileLifestyle(lifestyleData: IProfileLifestyle): Promise<any> {
    try {
      const reference = await this.profileRepository.createProfileLifestyle(lifestyleData);

      return {
        success: true,
        message: 'Profile lifestyle created successfully',
        data: reference,
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

  async createProfilePhoto(photoData: IProfilePhoto): Promise<any> {
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

  async getProfileHobbies(profileData: IProfileHobbyInterest): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.getProfileHobbies(profileData);
      return this.validateResponse(response, 'Hobbies fetched successfully');
    } catch (error: any) {
      throw error;
    }
  }

  async addProfileHobby(hobbyData: IProfileHobbyInterest): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.addProfileHobby(hobbyData);
      return this.validateResponse(response, 'Hobby added successfully');
    } catch (error: any) {
      throw error;
    }
  }

  async removeProfileHobby(hobbyData: IProfileHobbyInterest): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.removeProfileHobby(hobbyData);
      return this.validateResponse(response, 'Hobby removed successfully');
    } catch (error: any) {
      throw error;
    }
  }

  async addProfileFamily(family: any): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.addProfileFamily(family);
      return this.validateResponse(response, 'Family record added successfully');
    } catch (error: any) {
      throw error;
    }
  }

  async updateProfileFamily(profile_id: number, family: any): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.updateProfileFamily(profile_id, family);
      return this.validateResponse(response, 'Family record updated successfully');
    } catch (error: any) {
      throw error;
    }
  }

  async deleteProfileFamily(profile_id: number, family_id: number): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.deleteProfileFamily(profile_id, family_id);
      return this.validateResponse(response, 'Family record deleted successfully');
    } catch (error: any) {
      throw error;
    }
  }
}