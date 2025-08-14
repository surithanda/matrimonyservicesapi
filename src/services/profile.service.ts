import { IProfilePersonal, IProfileResponse, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import { IProfileHobbyInterest } from '../interfaces/hobby.interface';
import { ProfileRepository } from '../repositories/profile.repository';

export class ProfileService {
  private profileRepository: ProfileRepository;

  constructor() {
    this.profileRepository = new ProfileRepository();
  }

  async getProfilesByAccountId(accountId: number): Promise<{
    success: boolean;
    message: string;
    data?: any[];
  }> {
    try {
      if (!accountId) {
        return {
          success: false,
          message: 'Account ID is required'
        };
      }

      const profiles = await this.profileRepository.getProfilesByAccountId(accountId);
      
      return {
        success: true,
        message: 'Profiles retrieved successfully',
        data: profiles
      };
    } catch (error) {
      console.error('Error in getProfilesByAccountId:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve profiles'
      };
    }
  }

  async trackProfileView(profileId: number, viewedProfileId: number, account: number): Promise<{ success: boolean; message: string }> {
    try {
      if (!profileId || !viewedProfileId) {
        return {
          success: false,
          message: 'Both profile ID and viewed profile ID are required'
        };
      }

      const result = await this.profileRepository.trackProfileView(
        profileId,
        viewedProfileId,
        account
      );

      if (!result) {
        throw new Error('Failed to track profile view');
      }
      console.log(result);
      return {
        success: true,
        message: 'Profile view tracked successfully'
      };
    } catch (error: any) {
      console.error('Error in trackProfileView service:', error);
      return {
        success: false,
        message: error.message || 'Failed to track profile view'
      };
    }
  }

  async getFavorites({profileId, account}: {profileId: number, account: number}): Promise<IProfileResponse> {
    try {
      if (!profileId) {
        return {
          success: false,
          message: 'Profile ID is required',
          error: 'Profile ID is required to fetch favorites'
        };
      }

      const result = await this.profileRepository.getFavorites({profileId, account});
      return result.data;
      
    } catch (error: any) {
      console.error('Error in getFavorites:', error);
      return {
        success: false,
        message: 'Failed to fetch favorites',
        error: error.message
      };
    }
  }

  async createFavoriteProfile(
    profileId: number,
    favoriteProfileId: number,
    isFavorite: boolean,
    account: number
  ): Promise<IProfileResponse> {
    try {
      if (!profileId || !favoriteProfileId || typeof isFavorite === 'undefined') {
        return {
          success: false,
          message: 'Missing required parameters',
          error: 'Profile ID, favorite profile ID, and favorite status are required'
        };
      }

      // Call the repository method to handle the favorite/unfavorite logic
      const result = await this.profileRepository.createFavoriteProfile(
        profileId,
        favoriteProfileId,
        isFavorite,
        account
      );

      console.log(result);
      return this.validateResponse(
        result, 
        isFavorite ? 'Added to favorites' : 'Removed from favorites'
      );
    } catch (error: any) {
      console.error('Error in createFavoriteProfile:', error);
      return {
        success: false,
        message: 'Failed to update favorite status',
        error: error.message
      };
    }
  }

  async deleteFavorite({profileId, account}: {profileId: number, account: number}): Promise<IProfileResponse> {
    try {
      if (!profileId) {
        return {
          success: false,
          message: 'Missing required parameters',
          error: 'Profile ID is required'
        };
      }

      const result = await this.profileRepository.deleteFavorite({profileId, account});
      return {
        success: true,
        message: result.message || 'Removed from favorites',
        data: {
          profile_id: profileId,
        } as any // Temporary type assertion to fix the type error
      };
    } catch (error: any) {
      console.error('Error in deleteFavorite:', error);
      return {
        success: false,
        message: 'Failed to remove from favorites',
        error: error.message
      };
    }
  }

  async getProfileByAccountCode(accountCode: string): Promise<any> {
    try {
      const response = await this.profileRepository.getProfileByAccountCode(accountCode);
      
      if (!response) {
        return {
          success: false,
          message: 'Profile not found for the given account code'
        };
      }
      
      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: response
      };
    } catch (error) {
      console.error('Error in getProfileByAccountCode service:', error);
      throw error;
    }
  }

  validateResponse = (response:any, successMessage:string) => {
    console.log("Response from repository:", response);
      if(response) {
        if(response?.error_code === null || response?.status === 'success')
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
      const propertyId:any = await this.profileRepository.createProfileProperty(propertyData);

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

  async searchProfiles(searchParams: {
    profile_id: number;
    min_age?: number;
    max_age?: number;
    religion?: number;
    max_education?: number;
    occupation?: number;
    country?: string;
    caste_id?: number;
    marital_status?: number;
  }): Promise<any> {
    try {
      const response = await this.profileRepository.searchProfiles(searchParams);
      return {
        success: true,
        message: 'Profiles fetched successfully',
        data: response
      };
    } catch (error: any) {
      console.error('Error in searchProfiles service:', error);
      return {
        success: false,
        message: 'Failed to search profiles',
        error: error.message
      };
    }
  }

  async getUserPreferences(profileId: number, preferenceId?: number, createdUser?: string): Promise<any> {
    try {
      const response = await this.profileRepository.getUserPreferences(profileId, preferenceId, createdUser);
      
      // If no preferences exist yet, return empty preferences object with all fields
      if (response === null) {
        return {
          success: true,
          message: 'No preferences found for this profile',
          data: {
            profile_id: profileId,
            min_age: 18,  // Default minimum age
            max_age: 45,  // Default maximum age
            gender: null,
            religion: null,
            max_education: null,
            occupation: null,
            country: null,
            caste: null,
            marital_status: null,
            location_preference: null,  // For backward compatibility
            distance_preference: null,  // For backward compatibility
            created_user: createdUser || null
          }
        };
      }
      
      // Map the response to include all fields, even if they're null
      const mappedResponse = {
        ...response,
        // Ensure all fields are present in the response
        min_age: response.min_age ?? 18,
        max_age: response.max_age ?? 45,
        gender: response.gender ?? null,
        religion: response.religion ?? null,
        max_education: response.max_education ?? null,
        occupation: response.occupation ?? null,
        country: response.country ?? null,
        caste: response.caste ?? null,
        marital_status: response.marital_status ?? null,
        location_preference: response.location_preference ?? null,
        distance_preference: response.distance_preference ?? null,
        created_user: response.created_user ?? createdUser ?? null
      };
      
      return this.validateResponse(mappedResponse, 'User preferences fetched successfully');
    } catch (error: any) {
      const errorResponse: any = {
        success: false,
        message: 'Failed to fetch user preferences',
        error: error.message,
        data: {
          profile_id: profileId,
          min_age: 18,
          max_age: 45,
          gender: null,
          religion: null,
          max_education: null,
          occupation: null,
          country: null,
          caste: null,
          marital_status: null,
          location_preference: null,
          distance_preference: null,
          created_user: createdUser || null
        }
      };

      if (error.message && error.message.includes('Invalid Profile ID')) {
        errorResponse.message = 'Invalid Profile ID';
      }
      
      return errorResponse;
    }
  }

  async saveUserPreferences(preferencesData: {
    profile_id: number;
    min_age?: number | null;
    max_age?: number | null;
    gender?: string | null;
    religion?: string | null;
    caste?: string | null;
    marital_status?: string | null;
    max_education?: string | null;
    occupation?: string | null;
    country?: string | null;
    created_user?: string;
  }): Promise<IProfileResponse> {
    try {
      const response = await this.profileRepository.saveUserPreferences(preferencesData);
      
      // If we got a success response from the repository, return it
      if (response && (response as any).success !== false) {
        return {
          success: true,
          message: (response as any).message || 'User preferences saved successfully',
          data: response.data
        };
      }
      
      // If we got an error response from the repository, return it
      if (response && (response as any).success === false) {
        return response as any;
      }
      
      // Default success response if no specific response from repository
      return {
        success: true,
        message: 'User preferences saved successfully',
        data: response
      };
    } catch (error: any) {
      console.error('Error saving user preferences:', error);
      return {
        success: false,
        message: 'Failed to save user preferences',
        error: error.message
      };
    }
  }


}