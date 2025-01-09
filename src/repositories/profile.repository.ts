import { IProfilePersonal, IProfileAddress } from '../interfaces/profile.interface';
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
  }