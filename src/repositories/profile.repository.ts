import { IProfilePersonal, IProfileAddress, IProfileEducation, IProfileEmployment, IProfileProperty, IProfileFamilyReference, IProfileLifestyle, IProfilePhoto } from '../interfaces/profile.interface';
import pool from '../config/database';

export class ProfileRepository {
    async createPersonalProfile(profileData: IProfilePersonal): Promise<number> {
      try {
        // Log the values being passed to help debug
        console.log('Profile Data:', profileData);
        
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
        console.log('Parameters:', params);
  
        const [result] = await pool.execute(
          'CALL usp_profile_personal_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
  
        const profileId = (result as any[])[0][0].profile_id;
        return profileId;
      } catch (error) {
        console.error('Error in createPersonalProfile:', error);
        throw error;
      }
    }

    async createProfileAddress(addressData: IProfileAddress): Promise<void> {
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
          addressData.phone,
          addressData.landmark1 || null,
          addressData.landmark2 || null,
          addressData.account_id
        ];

        await pool.execute(
          'CALL usp_profile_address_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
      } catch (error) {
        console.error('Error in createProfileAddress:', error);
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

        await pool.execute(
          'CALL usp_profile_education_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
      } catch (error) {
        console.error('Error in createProfileEducation:', error);
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
          employmentData.last_salary_drawn,
          employmentData.account_id
        ];

        await pool.execute(
          'CALL usp_profile_employment_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
      } catch (error) {
        console.error('Error in createProfileEmployment:', error);
        throw error;
      }
    }

    async createProfileProperty(propertyData: IProfileProperty): Promise<number> {
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
          'CALL usp_profile_property_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        const propertyId = (result as any[])[0][0].property_id;
        return propertyId;
      } catch (error) {
        console.error('Error in createProfileProperty:', error);
        throw error;
      }
    }

    async createFamilyReference(referenceData: IProfileFamilyReference): Promise<number> {
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
          'CALL usp_profile_family_reference_create_v2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        const referenceId = (result as any[])[0][0].reference_id;
        return referenceId;
      } catch (error) {
        console.error('Error in createFamilyReference:', error);
        throw error;
      }
    }

    async createProfileLifestyle(lifestyleData: IProfileLifestyle): Promise<void> {
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

        await pool.execute(
          'CALL usp_profile_lifestyle_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );
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

    async updateProfileEducation(
      profile_education_id: number,
      educationData: IProfileEducation,
      ip_address: string,
      browser_profile: string
    ): Promise<number> {
      try {
        const params = [
          profile_education_id,
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
          educationData.user_created, // Using as user_modified
          ip_address,
          browser_profile
        ];

        const [result] = await pool.execute(
          'CALL usp_profile_education_update_v2(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          params
        );

        const updatedId = (result as any[])[0][0].updated_profile_education_id;
        return updatedId;
      } catch (error) {
        console.error('Error in updateProfileEducation:', error);
        throw error;
      }
    }

    async deleteProfileEducation(
      profile_education_id: number,
      profile_id: number,
      user_deleted: string,
      ip_address: string,
      browser_profile: string
    ): Promise<number> {
      try {
        const params = [
          profile_education_id,
          profile_id,
          user_deleted,
          ip_address,
          browser_profile
        ];

        const [result] = await pool.execute(
          'CALL usp_profile_education_delete_v2(?, ?, ?, ?, ?)',
          params
        );

        const deletedId = (result as any[])[0][0].deleted_profile_education_id;
        return deletedId;
      } catch (error) {
        console.error('Error in deleteProfileEducation:', error);
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

    async getProfileDetails(profileId: number): Promise<any> {
      try {
        const [rows] = await pool.execute(
          'CALL usp_get_profile_details(?)',
          [profileId]
        );
    
        // Stored procedures return array of results where first element is the result set
        // And first element of that array is our data row
        if (Array.isArray(rows) && rows.length > 0 && Array.isArray(rows[0]) && rows[0].length > 0) {
          return rows[0][0];
        }
    
        throw new Error('Profile not found');
      } catch (error: any) {
        if (error.message === 'Profile not found') {
          throw error;
        }
        throw new Error(`Database error: ${error.message}`);
      }
    }
  }