import { IProfilePersonal, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import { IProfileHobbyInterest } from '../interfaces/hobby.interface';
import pool from '../config/database';

export class ProfileRepository {
  async getProfilesByAccountId(accountId: number): Promise<any[]> {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM matrimony_services.profile_personal WHERE account_id = ?',
        [accountId]
      );
      return rows as any[];
    } catch (error) {
      console.error('Error fetching profiles by account ID:', error);
      throw error;
    }
  }

  async trackProfileView(profileId: number, viewedProfileId: number, account: number): Promise<boolean> {
    try {
      const [result] = await pool.execute(
        'CALL eb_profile_views_create(?, ?, ?)',
        [profileId, viewedProfileId, account]
      );
      const extractedResponse = (result as any[])[0][0];
      console.log(extractedResponse)
      return extractedResponse;
    } catch (error) {
      console.error('Error tracking profile view:', error);
      throw error;
    }
  }
    async getPersonalProfile(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_personal_get(?, ?, ?)',
          params
        );
  
        const extractedResponse = (result as any[])[0][0];
        console.log(extractedResponse)
        return extractedResponse;
      } catch (error) {
        console.error('Error in getPersonalProfile:', error);
        throw error;
      }
    }
    
    async createPersonalProfile(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.account_id, 
          profileData.first_name,
          profileData.last_name,
          profileData.middle_name === undefined ? null : profileData.middle_name,
          profileData.prefix === undefined ? null : profileData.prefix,
          profileData.suffix === undefined ? null : profileData.suffix,
          profileData.gender,
          profileData.birth_date,
          profileData.phone_mobile,
          profileData.phone_home === undefined ? null : profileData.phone_home,
          profileData.phone_emergency === undefined ? null : profileData.phone_emergency,
          profileData.email_id,
          profileData.marital_status,
          profileData.religion === undefined ? null : profileData.religion,
          profileData.nationality === undefined ? null : profileData.nationality,
          profileData.caste === undefined ? null : profileData.caste,
          profileData.height_inches === undefined ? null : profileData.height_inches,
          profileData.height_cms === undefined ? null : profileData.height_cms,
          profileData.weight === undefined ? null : profileData.weight,
          profileData.weight_units === undefined ? null : profileData.weight_units,
          profileData.complexion === undefined ? null : profileData.complexion,
          profileData.linkedin === undefined ? null : profileData.linkedin,
          profileData.facebook === undefined ? null : profileData.facebook,
          profileData.instagram === undefined ? null : profileData.instagram,
          profileData.whatsapp_number === undefined ? null : profileData.whatsapp_number,
          profileData.profession === undefined ? null : profileData.profession,
          profileData.disability === undefined ? null : profileData.disability,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_personal_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
  
        const extractedResponse = (result as any[])[0][0];
        console.log(extractedResponse)
        return extractedResponse;
        // if(extractedResponse?.error_code === null)
        //   return extractedResponse?.profile_id;
        // else {
        //   return {
        //     success: false,
        //     message: 'Email already exists',
        //     {...extractedResponse}
        //   };
        // }
        
      } catch (error) {
        console.error('Error in createPersonalProfile:', error);
        throw error;
      }
    }

    formatResponse(result:any, arrayElement?:string):any {
      let returnObj;
      if(!result || !Array.isArray(result) || result.length === 0) {
        const extractedResponse = (result as any[])[0];
        console.log(extractedResponse)
        returnObj = {
          status: extractedResponse[0].status,
          error_type: extractedResponse[0].error_type,
          error_code: extractedResponse[0].error_code,
          error_message: extractedResponse[0].error_message,
          ...(arrayElement ? { [arrayElement.toString()]: extractedResponse } : {...extractedResponse})
        }
      } else {
        returnObj = {
          status: 'success',
          ...(arrayElement ? { [arrayElement.toString()]: (result as any[])[0] } : {})
        };
      }
      return returnObj;
    }

    async getProfileAddress(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_address_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'addresses')
        // const extractedResponse = (result as any[])[0];
        // const returnObj = {
        //   status: extractedResponse[0].status,
        //   error_type: extractedResponse[0].error_type,
        //   error_code: extractedResponse[0].error_code,
        //   error_message: extractedResponse[0].error_message,
        //   addresses: extractedResponse
        // }

        // console.log(extractedResponse)
        return returnObj;
      } catch (error) {
        console.error('Error in getProfileAddress:', error);
        throw error;
      }
    }

    async createProfileAddress(addressData: IProfileAddress): Promise<any> {
      try {
        const params = [
          addressData.profile_id,
          addressData.address_type,
          addressData.address_line1,
          addressData.address_line2 || null,
          addressData.city,
          addressData.state,
          addressData.country,
          addressData.zip,
          addressData.landmark1 || null,
          addressData.landmark2 || null,
          addressData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_address_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createProfileAddress:', error);
        throw error;
      }
    }

    async updateProfileAddress(addressData: any): Promise<any> {
      try {
        const params = [
          addressData.profile_address_id,
          addressData.address_type || 1,
          addressData.address_line1,
          addressData.address_line2 || null,
          addressData.city,
          addressData.state,
          addressData.country_id || addressData.country,
          addressData.zip,
          addressData.landmark1 || null,
          addressData.landmark2 || null,
          addressData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_address_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateProfileAddress:', error);
        throw error;
      }
    }

    async deleteProfileAddress(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.profile_address_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_address_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteProfileAddress:', error);
        throw error;
      }
    }

    async getProfileEducation(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_education_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'educations')
        return returnObj;
      } catch (error) {
        console.error('Error in getProfileEducation:', error);
        throw error;
      }
    }

    async createProfileEducation(educationData: IProfileEducation): Promise<void> {
      try {
        const params = [
          educationData.profile_id,
          educationData.education_level,
          educationData.year_completed,
          educationData.institution_name,
          educationData.address_line1,
          educationData.city,
          educationData.state_id,
          educationData.country_id,
          educationData.zip,
          educationData.field_of_study,
          educationData.user_created
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_education_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createProfileEducation:', error);
        throw error;
      }
    }

    // 
    async getProfileEmployment(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_employment_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'employments')
        return returnObj;
      } catch (error) {
        console.error('Error in getProfileEmployment:', error);
        throw error;
      }
    }

    async createProfileEmployment(employmentData: IProfileEmployment): Promise<void> {
      try {
        const params = [
          employmentData.profile_id,
          employmentData.institution_name,
          employmentData.address_line1,
          employmentData.city,
          employmentData.state_id,
          employmentData.country_id,
          employmentData.zip,
          employmentData.start_year,
          employmentData.end_year,
          employmentData.job_title_id,
          employmentData.other_title || '',
          employmentData.last_salary_drawn,
          // employmentData.account_id,
          employmentData.created_user
        ];

        console.log(params)
        const [result] = await pool.execute(
          'CALL eb_profile_employment_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createProfileEmployment:', error);
        throw error;
      }
    }

    // 
    async getProfileProperty(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_property_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'properties')
        return returnObj;
      } catch (error) {
        console.error('Error in getProfileProperty:', error);
        throw error;
      }
    }

    async createProfileProperty(propertyData: IProfileProperty): Promise<any> {
      try {
        const params = [
          propertyData.profile_id,
          propertyData.property_type,
          propertyData.ownership_type,
          propertyData.property_address,
          propertyData.property_value,
          propertyData.property_description,
          propertyData.isoktodisclose || false, // Default to false if not provided
          propertyData.created_by,
          // propertyData.ip_address,
          // propertyData.browser_profile
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_property_create(?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
        
        console.log('Result from stored procedure:', result);
        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createProfileProperty:', error);
        throw error;
      }
    }

    // references
    async getFamilyReference(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          profileData.type || null, // type can be null or a specific type
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_family_reference_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'family')
        return returnObj;
      } catch (error) {
        console.error('Error in getFamilyReference:', error);
        throw error;
      }
    }

    async createFamilyReference(referenceData: IProfileFamilyReference): Promise<any> {
      try {
        const params = [
          referenceData.profile_id,
          referenceData.reference_type,
          referenceData.first_name,
          referenceData.last_name,
          referenceData.middle_name,
          referenceData.alias,
          referenceData.gender,
          referenceData.date_of_birth,
          referenceData.religion,
          referenceData.nationality,
          referenceData.caste,
          referenceData.marital_status,
          referenceData.highest_education,
          referenceData.disability,
          referenceData.address_line1,
          referenceData.city,
          referenceData.state,
          referenceData.country,
          referenceData.zip,
          referenceData.primary_phone,
          referenceData.secondary_phone,
          referenceData.can_communicate,
          referenceData.email,
          referenceData.linkedin,
          referenceData.instagram,
          referenceData.facebook,
          referenceData.whatsapp,
          referenceData.employment_status,
          referenceData.emp_company_name,
          referenceData.emp_city,
          referenceData.emp_state,
          referenceData.emp_country,
          referenceData.emp_zip,
          referenceData.account_id
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_family_reference_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createFamilyReference:', error);
        throw error;
      }
    }

    // 
    async getProfileLifestyle(profileData: IProfilePersonal): Promise<any> {
      try {
        // Log the values being passed to help debug
        // console.log('Profile Data:', profileData);
        
        const params = [
          profileData.profile_id, 
          null,
          profileData.created_user
        ];
  
        // Log the parameters being passed to the stored procedure
        // console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL eb_profile_lifestyle_get(?, ?, ?)',
          params
        );
  
        const returnObj = this.formatResponse(result, 'lifestyles')
        return returnObj;
      } catch (error) {
        console.error('Error in getProfileLifestyle:', error);
        throw error;
      }
    }

    async createProfileLifestyle(lifestyleData: IProfileLifestyle): Promise<any> {
      try {
        const params = [
          lifestyleData.profile_id,
          lifestyleData.eating_habit,
          lifestyleData.diet_habit,
          lifestyleData.cigarettes_per_day,
          lifestyleData.drink_frequency,
          lifestyleData.gambling_engage,
          lifestyleData.physical_activity_level,
          lifestyleData.relaxation_methods,
          lifestyleData.addition_info || '',
          lifestyleData.created_user,
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_lifestyle_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in createProfileLifestyle:', error);
        throw error;
      }
    }

    async createProfilePhoto(photoData: IProfilePhoto): Promise<number> {
      try {
        const params = [
          photoData.profile_id,
          photoData.url,
          photoData.photo_type,
          photoData.caption,
          photoData.description,
          photoData.user_created,
          // photoData.ip_address,
          // photoData.browser_profile
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_photo_create(?, ?, ?, ?, ?, ?)',
          params
        );

        const photoId = (result as any[])[0][0].photo_id;
        return photoId;
      } catch (error) {
        console.error('Error in createProfilePhoto:', error);
        throw error;
      }
    }

    async getProfilePhotos(profileId: number): Promise<any[]> {
      try {
        const [result] = await pool.execute(
          'CALL eb_profile_photo_get(?)',
          [profileId]
        );
        // Stored procedure returns the rows in the first result set
        return (result as any[])[0] || [];
      } catch (error) {
        console.error('Error in getProfilePhotos:', error);
        throw error;
      }
    }

    async getProfileSummary(accountId: number): Promise<any> {
      try {
        const [result]:any = await pool.execute('CALL usp_get_profile_summary(?)', [accountId]);
        return result[0]; // Assuming the stored procedure returns the profile summary in the first row
      } catch (error) {
        console.error('Error fetching profile summary:', error);
        throw error;
      }
    }

    async getProfileHobbies(profileData: IProfileHobbyInterest): Promise<any> {
      try {
        const params = [profileData.profile_id, null, profileData.category, profileData.created_user];
        const [result] = await pool.execute('CALL eb_profile_hobby_interest_get(?,?,?,?)', params);
        const resultObj = this.formatResponse(result, 'hobby_interests');
        return resultObj;
      } catch (error) {
        throw error;
      }
    }

    async addProfileHobby(hobbyData: IProfileHobbyInterest): Promise<any> {
      try {
        const params = [hobbyData.profile_id, hobbyData.hobby, hobbyData.created_user];
        const [result] = await pool.execute('CALL eb_profile_hobby_interest_create(?, ?, ?)', params);
        return (result as any[])[0][0];
      } catch (error) {
        throw error;
      }
    }

    async removeProfileHobby(hobbyData: IProfileHobbyInterest): Promise<any> {
      try {
        const params = [hobbyData.profile_id, hobbyData.hobby, hobbyData.created_user];
        const [result] = await pool.execute('CALL eb_profile_hobby_interest_remove(?, ?, ?)', params);
        return (result as any[])[0][0];
      } catch (error) {
        throw error;
      }
    }

    async addProfileFamily(family: any): Promise<any> {
      try {
        // const params = [family.profile_id, null, family.created_user];
        const params = [
          family.profile_id,
          family.firstname,
          family.lastname,
          family.relationshiptoyou,
          family.contactnumber,
          family.email,
          family.address_line,
          family.city,
          family.state_id,
          family.country_id,
          family.zip,
          family.created_user,
        ];

        const [result] = await pool.execute('CALL eb_profile_family_reference_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', params);
        return (result as any[])[0][0];
        // TODO: Map family object to params as per your DB schema
        // const params = [profile_id, ...Object.values(family)];
        // Example: 'CALL eb_profile_family_create(?, ...)'

        // Replace with your actual stored procedure and params
        // const [result] = await pool.execute('CALL eb_profile_family_create(?, ...)', params);
        // return (result as any[])[0][0];
        // return { profile_id, ...family, id: 1 }; // Placeholder
      } catch (error) {
        throw error;
      }
    }

    async updateProfileFamily(profile_id: number, family: any): Promise<any> {
      try {
        // TODO: Map family object to params as per your DB schema
        const params = [profile_id, ...Object.values(family)];
        // Example: 'CALL eb_profile_family_update(?, ...)' 
        // Replace with your actual stored procedure and params
        // const [result] = await pool.execute('CALL eb_profile_family_update(?, ...)', params);
        // return (result as any[])[0][0];
        return { profile_id, ...family }; // Placeholder
      } catch (error) {
        throw error;
      }
    }

    async deleteProfileFamily(profile_id: number, family_id: number): Promise<any> {
      try {
        // TODO: Use your actual stored procedure and params
        const params = [profile_id, family_id];
        // Example: 'CALL eb_profile_family_delete(?, ?)' 
        // const [result] = await pool.execute('CALL eb_profile_family_delete(?, ?)', params);
        // return (result as any[])[0][0];
        return { profile_id, family_id }; // Placeholder
      } catch (error) {
        throw error;
      }
    }



  async getProfileByAccountCode(accountCode: string): Promise<any> {
    try {
      const [result] = await pool.execute(
        'CALL eb_profile_get_by_account_code(?)',
        [accountCode]
      );
      
      // The stored procedure returns the profile in the first row of the first result set
      const profile = (result as any[])[0][0];
      return profile || null;
    } catch (error) {
      console.error('Error in getProfileByAccountCode:', error);
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
        const params = [
          searchParams.profile_id,
          searchParams.min_age || null,
          searchParams.max_age || null,
          searchParams.religion || null,
          searchParams.max_education || null,
          searchParams.occupation || null,
          searchParams.country || null,
          searchParams.caste_id || null,
          searchParams.marital_status || null
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_search_get(?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any[])[0];
      } catch (error) {
        console.error('Error in searchProfiles:', error);
        throw error;
      }
    }

    async getUserPreferences(profileId: number, preferenceId?: number, createdUser?: string): Promise<any> {
      try {
        const params = [
          profileId,
          // preferenceId || null,
          // createdUser || null
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_search_preference_get(?)',
          params
        );

        // Handle case where no preferences exist yet
        const extractedResponse = (result as any[])[0];
        if (extractedResponse && extractedResponse.length > 0) {
          console.log(extractedResponse[0]);
          return extractedResponse[0];
        } else {
          // Return null if no preferences found (this is normal for new users)
          return null;
        }
      } catch (error: any) {
        console.error('Error in getUserPreferences:', error);
        // If the error is about table not existing, return null (no preferences yet)
        if (error.message && error.message.includes('doesn\'t exist')) {
          console.log('No preferences table found, returning null (normal for new users)');
          return null;
        }
        throw error;
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
      country?: string | null;
      max_education?: string | null;
      occupation?: string | null;
      created_user?: string;
    }): Promise<any> {
      try {
        console.log('Saving preferences with data:', preferencesData);
        
        // Map frontend fields to stored procedure parameters
        const params = [
          preferencesData.profile_id,
          preferencesData.min_age || null,
          preferencesData.max_age || null,
          preferencesData.gender || null,
          preferencesData.religion || null,
          preferencesData.max_education || null,
          preferencesData.occupation || null,
          preferencesData.country || null,
          preferencesData.caste || null,
          preferencesData.marital_status || null,          
          preferencesData.created_user || null
        ];

        console.log('Calling stored procedure with params:', params);
        
        const [result] = await pool.execute(
          'CALL eb_profile_search_preference_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        // Handle the response from the stored procedure
        const extractedResponse = (result as any[])[0];
        if (extractedResponse && extractedResponse.length > 0) {
          const response = extractedResponse[0];
          console.log('Preferences saved successfully:', response);
          return response;
        } else {
          // Return success response if no specific data returned
          const response = {
            success: true,
            profile_id: preferencesData.profile_id,
            message: 'Preferences saved successfully'
          };
          console.log('No data returned from stored procedure, returning:', response);
          return response;
        }
      } catch (error: any) {
        console.error('Error in saveUserPreferences:', error);
        throw error;
      }
    }

    async getFavorites({profileId, account}: {profileId: number, account: number}): Promise<any> {
      try {
        const [result] = await pool.execute(
          'CALL eb_profile_favorites_get(?, ?)',
          [profileId, account]
        );

        const extractedResponse = (result as any[])[0];
        return {
          success: true,
          data: extractedResponse || []
        };
      } catch (error: any) {
        console.error('Error in getFavorites:', error);
        throw error;
      }
    }

    async createFavoriteProfile(
      profileId: number,
      favoriteProfileId: number,
      isFavorite: boolean,
      account: number
    ): Promise<any> {
      try {
        const [result] = await pool.execute(
          'CALL eb_profile_favorites_create(?, ?, ?)',
          [profileId, favoriteProfileId, account]
        );

        // Handle the response from the stored procedure
        const extractedResponse = (result as any[])[0];
        if (extractedResponse && extractedResponse.length > 0) {
          return extractedResponse[0];
        } else {
          // Return success response if no specific data returned
          return {
            success: true,
            profile_id: profileId,
            favorite_profile_id: favoriteProfileId,
            message: 'Added to favorites'
          };
        }
      } catch (error: any) {
        console.error('Error in createFavoriteProfile:', error);
        throw error;
      }
    }

    async deleteFavorite({profileId, account}: {profileId: number, account: number}): Promise<any> {
      try {
        const [result] = await pool.execute(
          'CALL eb_profile_favorites_delete(?, ?)',
          [profileId, account]
        );

        return {
          success: true,
          profile_id: profileId,
          message: 'Removed from favorites'
        };
      } catch (error: any) {
        console.error('Error in deleteFavorite:', error);
        throw error;
      }
    }

    // Property Update/Delete Methods
    async updateProfileProperty(propertyData: any): Promise<any> {
      try {
        const params = [
          propertyData.property_id,
          propertyData.property_type,
          propertyData.ownership_type,
          propertyData.value || null,
          propertyData.address || null,
          propertyData.city || null,
          propertyData.state || null,
          propertyData.country || null,
          propertyData.zip || null,
          propertyData.comments || null,
          propertyData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_property_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateProfileProperty:', error);
        throw error;
      }
    }

    async deleteProfileProperty(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.property_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_property_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteProfileProperty:', error);
        throw error;
      }
    }

    // Family Reference Update/Delete Methods
    async updateFamilyReference(referenceData: any): Promise<any> {
      try {
        const params = [
          referenceData.reference_id,
          referenceData.name,
          referenceData.contact_number || null,
          referenceData.email || null,
          referenceData.address || null,
          referenceData.relationship || null,
          referenceData.comments || null,
          referenceData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_family_reference_update(?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateFamilyReference:', error);
        throw error;
      }
    }

    async deleteFamilyReference(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.reference_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_family_reference_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteFamilyReference:', error);
        throw error;
      }
    }

    // Education Update/Delete Methods
    async updateProfileEducation(educationData: any): Promise<any> {
      try {
        const params = [
          educationData.profile_id,
          educationData.education_level,
          educationData.year_completed,
          educationData.institution_name,
          educationData.address_line1,
          educationData.city,
          educationData.state_id,
          educationData.country_id,
          educationData.zip,
          educationData.field_of_study,
          educationData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_education_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateProfileEducation:', error);
        throw error;
      }
    }

    async deleteProfileEducation(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.education_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_education_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteProfileEducation:', error);
        throw error;
      }
    }

    // Employment Update/Delete Methods
    async updateProfileEmployment(employmentData: any): Promise<any> {
      try {
        const params = [
          employmentData.employment_id,
          employmentData.employment_status,
          employmentData.job_title_id || employmentData.job_title,
          employmentData.company_name,
          employmentData.annual_income || null,
          employmentData.work_location || null,
          employmentData.experience_years || null,
          employmentData.comments || null,
          employmentData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_employment_update(?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateProfileEmployment:', error);
        throw error;
      }
    }

    async deleteProfileEmployment(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.employment_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_employment_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteProfileEmployment:', error);
        throw error;
      }
    }

    // Lifestyle Update/Delete Methods
    async updateProfileLifestyle(lifestyleData: any): Promise<any> {
      try {
        const params = [
          lifestyleData.lifestyle_id,
          lifestyleData.dietary_habits || null,
          lifestyleData.drinking_habits || null,
          lifestyleData.smoking_habits || null,
          lifestyleData.exercise_habits || null,
          lifestyleData.hobbies || null,
          lifestyleData.interests || null,
          lifestyleData.comments || null,
          lifestyleData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_lifestyle_update(?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updateProfileLifestyle:', error);
        throw error;
      }
    }

    async deleteProfileLifestyle(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.lifestyle_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_lifestyle_delete(?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deleteProfileLifestyle:', error);
        throw error;
      }
    }

    // Personal Profile Update/Delete Methods
    async updatePersonalProfile(profileData: any): Promise<any> {
      try {
        const params = [
          profileData.profile_id,
          profileData.account_id,
          profileData.first_name,
          profileData.last_name,
          profileData.middle_name === undefined ? null : profileData.middle_name,
          profileData.prefix === undefined ? null : profileData.prefix,
          profileData.suffix === undefined ? null : profileData.suffix,
          profileData.gender,
          profileData.birth_date,
          profileData.phone_mobile,
          profileData.phone_home === undefined ? null : profileData.phone_home,
          profileData.phone_emergency === undefined ? null : profileData.phone_emergency,
          profileData.email_id,
          profileData.marital_status,
          profileData.religion === undefined ? null : profileData.religion,
          profileData.nationality === undefined ? null : profileData.nationality,
          profileData.caste === undefined ? null : profileData.caste,
          profileData.height_inches === undefined ? null : profileData.height_inches,
          profileData.height_cms === undefined ? null : profileData.height_cms,
          profileData.weight === undefined ? null : profileData.weight,
          profileData.weight_units === undefined ? null : profileData.weight_units,
          profileData.complexion === undefined ? null : profileData.complexion,
          profileData.linkedin === undefined ? null : profileData.linkedin,
          profileData.facebook === undefined ? null : profileData.facebook,
          profileData.instagram === undefined ? null : profileData.instagram,
          profileData.whatsapp_number === undefined ? null : profileData.whatsapp_number,
          profileData.profession === undefined ? null : profileData.profession,
          profileData.disability === undefined ? null : profileData.disability,
          profileData.modified_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_personal_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in updatePersonalProfile:', error);
        throw error;
      }
    }

    async deletePersonalProfile(deleteData: any): Promise<any> {
      try {
        const params = [
          deleteData.profile_id,
          deleteData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_personal_delete(?, ?)',
          params
        );

        return (result as any)[0][0];
      } catch (error) {
        console.error('Error in deletePersonalProfile:', error);
        throw error;
      }
    }

    async getCompleteProfile(profileData: any): Promise<any> {
      try {
        const params = [
          profileData.profile_id,
          profileData.created_user
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_get_complete_data(?, ?)',
          params
        );

        return (result as any[])[0][0];
      } catch (error) {
        console.error('Error in getCompleteProfile:', error);
        throw error;
      }
    }

    async getAllProfiles(profileData: any): Promise<any> {
      try {
        const params = [
          profileData.profile_id
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_search_get_all(?)',
          params
        );

        return (result as any[])[0];
      } catch (error) {
        console.error('Error in getAllProfiles:', error);
        throw error;
      }
    }
  }