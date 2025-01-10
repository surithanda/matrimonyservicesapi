export interface IProfilePersonal {
  account_id: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  prefix?: string;
  suffix?: string;
  gender: number;
  birth_date: Date;
  phone_mobile: string;
  phone_home?: string;
  phone_emergency?: string;
  email_id: string;
  marital_status: number;
  religion: number;
  nationality: number;
  caste: number;
  height_inches?: number;
  height_cms?: number;
  weight?: number;
  weight_units?: string;
  complexion?: number;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
  whatsapp_number?: string;
  profession?: number;
  disability?: number;
  created_user: string;
}

export interface IProfileResponse {
  success: boolean;
  message: string;
  data?: {
    profile_id: number;
    profile: IProfilePersonal;
  };
}

export interface IProfileAddress {
  profile_id: number;
  address_type: number;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  phone: string;
  landmark1?: string;
  landmark2?: string;
  account_id: number;
}

export interface IProfileEducation {
  profile_id: number;
  education_level: number;
  year_completed: number;
  institution_name: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  field_of_study: number;
  user_created: string;
} 