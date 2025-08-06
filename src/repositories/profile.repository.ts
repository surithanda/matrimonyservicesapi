import { IProfilePersonal, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import { IProfileHobbyInterest } from '../interfaces/hobby.interface';
import pool from '../config/database';

export class ProfileRepository {
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
          educationData.state,
          educationData.country,
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
          employmentData.state,
          employmentData.country,
          employmentData.zip,
          employmentData.start_year,
          employmentData.end_year,
          employmentData.job_title,
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
          propertyData.isoktodisclose,
          propertyData.created_by,
          propertyData.ip_address,
          propertyData.browser_profile
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_property_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

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
  
        // const returnObj = this.formatResponse(result, 'educations')
        // return returnObj;
      } catch (error) {
        console.error('Error in getProfileLifestyle:', error);
        throw error;
      }
    }

    async createProfileLifestyle(lifestyleData: IProfileLifestyle): Promise<any> {
      try {
        const params = [
          lifestyleData.profile_lifestyle_id,
          lifestyleData.eating_habit,
          lifestyleData.diet_habit,
          lifestyleData.cigarettes_per_day,
          lifestyleData.drink_frequency,
          lifestyleData.gambling_engage,
          lifestyleData.physical_activity_level,
          lifestyleData.relaxation_methods,
          lifestyleData.created_user,
          Number(lifestyleData.is_active),
          lifestyleData.profile_id
        ];

        const [result] = await pool.execute(
          'CALL eb_profile_lifestyle_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
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
          photoData.photo_type,
          photoData.description,
          photoData.caption,
          photoData.url,
          photoData.user_created,
          photoData.ip_address,
          photoData.browser_profile
        ];

        const [result] = await pool.execute(
          'CALL usp_profile_photo_create(?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        const photoId = (result as any[])[0][0].photo_id;
        return photoId;
      } catch (error) {
        console.error('Error in createProfilePhoto:', error);
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
        const params = [profileData.profile_id, profileData.category, profileData.created_user];
        const [result] = await pool.execute('CALL eb_profile_hobby_interest_get(?,?,?)', params);
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
  }