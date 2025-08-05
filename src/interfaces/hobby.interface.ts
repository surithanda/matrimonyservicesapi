export interface IProfileHobbyInterest {
  profile_id: number;
  hobby: number;
  category?: 'hobby' | 'interest' | null;
  created_user?: string;
  account_code?: string;
}