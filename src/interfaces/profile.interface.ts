export interface IProfilePersonal {
  profile_id:number,
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
  type?: string;
  created_user: string;
}

export interface IProfileResponse {
  success: boolean;
  message: string;
  data?: {
    profile_id: number;
    favorite_profile_id?: number;
    profile?: IProfilePersonal;
    [key: string]: any; // Allow additional properties
  };
  error?: string;
  error_code?: string | null;
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
  created_user: string;
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

export interface IProfileEmployment {
  profile_id: number;
  institution_name: string;
  address_line1: string;
  city: string;
  state: number;
  country: number;
  zip: string;
  start_year: number;
  end_year: number;
  job_title: number;
  other_title: string;
  last_salary_drawn: string;
  account_id: number;
  created_user: string;
}

export interface IProfileProperty {
  profile_id: number;
  property_type: number;
  ownership_type: number;
  property_address: string;
  property_value: number;
  property_description: string;
  isoktodisclose: boolean;
  created_by: string;
  ip_address: string;
  browser_profile: string;
}

export interface IProfileFamilyReference {
  profile_id: number;
  reference_type: number;
  first_name: string;
  last_name: string;
  middle_name?: string;
  alias?: string;
  gender: number;
  date_of_birth: Date;
  religion: number;
  nationality: number;
  caste: number;
  marital_status: number;
  highest_education: number;
  disability?: number;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  zip: string;
  primary_phone: string;
  secondary_phone?: string;
  can_communicate: boolean;
  email?: string;
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  whatsapp?: string;
  employment_status?: string;
  emp_company_name?: string;
  emp_city?: string;
  emp_state?: string;
  emp_country?: string;
  emp_zip?: string;
  account_id: number;
}

export interface IProfileLifestyle {
  profile_lifestyle_id: number;
  eating_habit: string;
  diet_habit: string;
  cigarettes_per_day?: string;
  drink_frequency: string;
  gambling_engage: string;
  physical_activity_level: string;
  relaxation_methods?: string;
  created_user: string;
  is_active: boolean;
  profile_id: number;
  addition_info:string;
}

export interface IProfilePhoto {
  profile_id: number;
  photo_type: number;
  description?: string;
  caption: string;
  url: string;
  user_created: string;
  ip_address: string;
  browser_profile: string;
} 