import { LookupResolver } from '../../services/aiSearch/lookupResolver';
import { ISearchFilters } from '../../interfaces/aiSearch.interface';

describe('LookupResolver', () => {
  let resolver: LookupResolver;

  // Mock lookup data matching real DB values
  const lookupCache = new Map<string, { id: number; name: string }[]>([
    ['gender', [
      { id: 9, name: 'Male' },
      { id: 10, name: 'Female' },
      { id: 11, name: 'Other' },
    ]],
    ['religion', [
      { id: 131, name: 'Hindu' },
      { id: 130, name: 'Islam' },
      { id: 129, name: 'Christian' },
      { id: 133, name: 'Sikh' },
    ]],
    ['caste', [
      { id: 168, name: 'Brahmin' },
      { id: 216, name: 'Rajput' },
      { id: 214, name: 'Patel' },
      { id: 219, name: 'Reddy' },
    ]],
    ['marital_status', [
      { id: 68, name: 'Single' },
      { id: 69, name: 'Married' },
      { id: 70, name: 'Divorced' },
      { id: 71, name: 'Widowed' },
    ]],
    ['education_level', [
      { id: 270, name: "Bachelor's Degree" },
      { id: 272, name: "Master's Degree" },
      { id: 273, name: 'MBA' },
      { id: 275, name: 'PhD' },
    ]],
    ['job_title', [
      { id: 284, name: 'Software Engineer' },
      { id: 300, name: 'Physician' },
      { id: 303, name: 'Teacher' },
      { id: 310, name: 'Project Manager' },
    ]],
    ['profession', [
      { id: 92, name: 'Doctor/Physician' },
      { id: 94, name: 'Engineer' },
      { id: 116, name: 'Software Developer' },
    ]],
    ['nationality', [
      { id: 165, name: 'Indian' },
      { id: 166, name: 'Canadian' },
      { id: 167, name: 'American' },
    ]],
    ['disability', [
      { id: 480, name: 'None' },
      { id: 140, name: 'Vision Impairment' },
    ]],
    ['hobby', [
      { id: 400, name: 'Reading' },
      { id: 401, name: 'Travelling' },
      { id: 402, name: 'Cooking' },
    ]],
    ['field_of_study', [
      { id: 228, name: 'Computer Science' },
      { id: 240, name: 'Medicine' },
      { id: 236, name: 'Business Administration' },
    ]],
  ]);

  const countryCache = [
    { id: 101, name: 'India' },
    { id: 102, name: 'United States' },
    { id: 103, name: 'Canada' },
    { id: 104, name: 'United Kingdom' },
  ];

  const stateCache = [
    { id: 1, name: 'Telangana' },
    { id: 2, name: 'Maharashtra' },
    { id: 3, name: 'Karnataka' },
    { id: 4, name: 'Tamil Nadu' },
  ];

  beforeEach(() => {
    resolver = new LookupResolver();
  });

  describe('resolve()', () => {
    it('should resolve gender text to ID', () => {
      const filters: ISearchFilters = { gender: 'Female' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.gender).toBe(10);
    });

    it('should resolve religion text to ID', () => {
      const filters: ISearchFilters = { religion: 'Hindu' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.religion).toBe(131);
    });

    it('should resolve caste text to ID', () => {
      const filters: ISearchFilters = { caste: 'Brahmin' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.caste).toBe(168);
    });

    it('should resolve marital_status text to ID', () => {
      const filters: ISearchFilters = { marital_status: 'Single' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.marital_status).toBe(68);
    });

    it('should resolve education_level text to ID', () => {
      const filters: ISearchFilters = { education_level: 'MBA' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.education_level).toBe(273);
    });

    it('should resolve occupation (job_title) text to ID', () => {
      const filters: ISearchFilters = { occupation: 'Software Engineer' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.occupation).toBe(284);
    });

    it('should resolve profession text to ID', () => {
      const filters: ISearchFilters = { profession: 'Engineer' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.profession).toBe(94);
    });

    it('should resolve country from country table', () => {
      const filters: ISearchFilters = { country: 'India' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.country_id).toBe(101);
    });

    it('should resolve state from state table', () => {
      const filters: ISearchFilters = { state: 'Telangana' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.state_id).toBe(1);
    });

    it('should resolve hobbies array to IDs', () => {
      const filters: ISearchFilters = { hobbies: ['Reading', 'Cooking'] };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.hobbies).toEqual([400, 402]);
    });

    it('should resolve multiple filters at once', () => {
      const filters: ISearchFilters = {
        gender: 'Female',
        religion: 'Hindu',
        education_level: 'MBA',
        country: 'India',
        state: 'Maharashtra',
      };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.gender).toBe(10);
      expect(result.religion).toBe(131);
      expect(result.education_level).toBe(273);
      expect(result.country_id).toBe(101);
      expect(result.state_id).toBe(2);
    });

    it('should return null for unresolvable values', () => {
      const filters: ISearchFilters = {
        gender: 'Nonbinary',  // not in lookup
        religion: 'Pastafarian',  // not in lookup
        country: 'Narnia',  // not in country table
      };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.gender).toBeNull();
      expect(result.religion).toBeNull();
      expect(result.country_id).toBeNull();
    });

    it('should return null for hobbies that cannot be resolved', () => {
      const filters: ISearchFilters = { hobbies: ['Skydiving', 'Reading'] };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.hobbies).toEqual([null, 400]);
    });

    it('should skip undefined/empty filter fields', () => {
      const filters: ISearchFilters = {
        gender: 'Male',
        // religion is undefined
        city: 'Hyderabad', // not a lookup field
      };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.gender).toBe(9);
      expect(result.religion).toBeUndefined();
    });
  });

  describe('fuzzy matching', () => {
    it('should match case-insensitively', () => {
      const filters: ISearchFilters = { gender: 'female' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.gender).toBe(10);
    });

    it('should match case-insensitively (UPPER)', () => {
      const filters: ISearchFilters = { religion: 'HINDU' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.religion).toBe(131);
    });

    it('should match when lookup name contains the search text', () => {
      const filters: ISearchFilters = { profession: 'Doctor' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      // "Doctor/Physician" contains "doctor"
      expect(result.profession).toBe(92);
    });

    it('should match when search text contains the lookup name', () => {
      const filters: ISearchFilters = { country: 'United States of America' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      // "united states of america" contains "united states"
      expect(result.country_id).toBe(102);
    });

    it('should match partial country names', () => {
      const filters: ISearchFilters = { country: 'Canada' };
      const result = resolver.resolve(filters, lookupCache, countryCache, stateCache);
      expect(result.country_id).toBe(103);
    });
  });
});
