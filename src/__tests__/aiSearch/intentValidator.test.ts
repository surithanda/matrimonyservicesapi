import { IntentValidator } from '../../services/aiSearch/intentValidator';

describe('IntentValidator', () => {
  let validator: IntentValidator;

  beforeEach(() => {
    validator = new IntentValidator();
  });

  describe('validate()', () => {
    it('should validate a well-formed AI response', () => {
      const raw = {
        filters: {
          gender: 'Female',
          religion: 'Hindu',
          min_age: 25,
          max_age: 30,
          city: 'Hyderabad',
        },
        sort_by: 'newest',
        confidence: 0.92,
        interpretation: 'Looking for Hindu women aged 25-30 in Hyderabad',
      };

      const result = validator.validate(raw);

      expect(result.filters.gender).toBe('Female');
      expect(result.filters.religion).toBe('Hindu');
      expect(result.filters.min_age).toBe(25);
      expect(result.filters.max_age).toBe(30);
      expect(result.filters.city).toBe('Hyderabad');
      expect(result.sort_by).toBe('newest');
      expect(result.confidence).toBe(0.92);
      expect(result.interpretation).toBe('Looking for Hindu women aged 25-30 in Hyderabad');
    });

    it('should throw on null input', () => {
      expect(() => validator.validate(null)).toThrow('AI returned non-object response');
    });

    it('should throw on undefined input', () => {
      expect(() => validator.validate(undefined)).toThrow('AI returned non-object response');
    });

    it('should throw on string input', () => {
      expect(() => validator.validate('not an object')).toThrow('AI returned non-object response');
    });

    it('should handle response without filters wrapper (flat object)', () => {
      const raw = {
        gender: 'Male',
        min_age: 28,
      };

      const result = validator.validate(raw);
      // Should wrap the flat object as filters
      expect(result.filters.gender).toBe('Male');
      expect(result.filters.min_age).toBe(28);
    });

    it('should clamp confidence to [0, 1]', () => {
      const tooHigh = {
        filters: { gender: 'Male' },
        confidence: 5.0,
        interpretation: 'test',
      };
      expect(validator.validate(tooHigh).confidence).toBe(1);

      const tooLow = {
        filters: { gender: 'Male' },
        confidence: -0.5,
        interpretation: 'test',
      };
      expect(validator.validate(tooLow).confidence).toBe(0);
    });

    it('should default confidence to 0.5 when missing', () => {
      const raw = {
        filters: { gender: 'Female' },
        interpretation: 'test',
      };
      expect(validator.validate(raw).confidence).toBe(0.5);
    });

    it('should default interpretation when missing', () => {
      const raw = {
        filters: { gender: 'Male' },
        confidence: 0.8,
      };
      expect(validator.validate(raw).interpretation).toBe('No interpretation provided');
    });

    it('should truncate interpretation to 500 chars', () => {
      const raw = {
        filters: { gender: 'Male' },
        confidence: 0.8,
        interpretation: 'A'.repeat(600),
      };
      expect(validator.validate(raw).interpretation.length).toBe(500);
    });

    it('should reject invalid sort_by values', () => {
      const raw = {
        filters: { gender: 'Male' },
        sort_by: 'invalid_sort',
        confidence: 0.8,
        interpretation: 'test',
      };
      expect(validator.validate(raw).sort_by).toBeUndefined();
    });

    it('should accept valid sort_by values', () => {
      const validSorts = ['age_asc', 'age_desc', 'newest', 'salary_desc', 'height_desc'];
      for (const sort of validSorts) {
        const raw = {
          filters: { gender: 'Male' },
          sort_by: sort,
          confidence: 0.8,
          interpretation: 'test',
        };
        expect(validator.validate(raw).sort_by).toBe(sort);
      }
    });
  });

  describe('sanitizeFilters()', () => {
    it('should accept valid string filters', () => {
      const raw = {
        filters: {
          gender: 'Female',
          religion: 'Hindu',
          caste: 'Brahmin',
          marital_status: 'Single',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          education_level: 'MBA',
          occupation: 'Software Engineer',
          eating_habit: 'Vegetarian',
          drinking: 'Non-Drinker',
          smoking: 'Non-Smoker',
        },
        confidence: 0.9,
        interpretation: 'test',
      };

      const result = validator.validate(raw);
      expect(result.filters.gender).toBe('Female');
      expect(result.filters.religion).toBe('Hindu');
      expect(result.filters.caste).toBe('Brahmin');
      expect(result.filters.marital_status).toBe('Single');
      expect(result.filters.city).toBe('Mumbai');
      expect(result.filters.state).toBe('Maharashtra');
      expect(result.filters.country).toBe('India');
      expect(result.filters.education_level).toBe('MBA');
      expect(result.filters.occupation).toBe('Software Engineer');
      expect(result.filters.eating_habit).toBe('Vegetarian');
      expect(result.filters.drinking).toBe('Non-Drinker');
      expect(result.filters.smoking).toBe('Non-Smoker');
    });

    it('should reject empty strings', () => {
      const raw = {
        filters: { gender: '', religion: '   ' },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.gender).toBeUndefined();
      expect(result.filters.religion).toBeUndefined();
    });

    it('should trim strings and cap at 100 chars', () => {
      const raw = {
        filters: {
          city: '  Hyderabad  ',
          institution_name: 'A'.repeat(150),
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.city).toBe('Hyderabad');
      expect(result.filters.institution_name!.length).toBe(100);
    });

    it('should reject non-string values for string fields', () => {
      const raw = {
        filters: {
          gender: 123,
          religion: true,
          city: null,
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.gender).toBeUndefined();
      expect(result.filters.religion).toBeUndefined();
      expect(result.filters.city).toBeUndefined();
    });

    it('should accept valid numeric ranges', () => {
      const raw = {
        filters: {
          min_age: 25,
          max_age: 35,
          min_height_cms: 160,
          max_height_cms: 180,
          min_salary: 500000,
          max_salary: 2000000,
        },
        confidence: 0.9,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.min_age).toBe(25);
      expect(result.filters.max_age).toBe(35);
      expect(result.filters.min_height_cms).toBe(160);
      expect(result.filters.max_height_cms).toBe(180);
      expect(result.filters.min_salary).toBe(500000);
      expect(result.filters.max_salary).toBe(2000000);
    });

    it('should reject out-of-range numeric values', () => {
      const raw = {
        filters: {
          min_age: 10,     // below 18
          max_age: 100,    // above 80
          min_height_cms: 50,  // below 100
          max_height_cms: 300, // above 250
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.min_age).toBeUndefined();
      expect(result.filters.max_age).toBeUndefined();
      expect(result.filters.min_height_cms).toBeUndefined();
      expect(result.filters.max_height_cms).toBeUndefined();
    });

    it('should reject NaN and non-number values for numeric fields', () => {
      const raw = {
        filters: {
          min_age: 'twenty',
          max_age: NaN,
          min_salary: null,
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.min_age).toBeUndefined();
      expect(result.filters.max_age).toBeUndefined();
      expect(result.filters.min_salary).toBeUndefined();
    });

    it('should round numeric values to integers', () => {
      const raw = {
        filters: { min_age: 25.7, max_age: 30.2 },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.min_age).toBe(26);
      expect(result.filters.max_age).toBe(30);
    });

    it('should accept valid hobbies array', () => {
      const raw = {
        filters: {
          hobbies: ['Reading', 'Travelling', 'Cooking'],
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.hobbies).toEqual(['Reading', 'Travelling', 'Cooking']);
    });

    it('should filter out invalid hobbies entries', () => {
      const raw = {
        filters: {
          hobbies: ['Reading', 123, '', null, 'Cooking'],
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.hobbies).toEqual(['Reading', 'Cooking']);
    });

    it('should cap hobbies at 10 entries', () => {
      const raw = {
        filters: {
          hobbies: Array.from({ length: 15 }, (_, i) => `Hobby${i}`),
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.hobbies!.length).toBe(10);
    });

    it('should ignore unknown filter fields', () => {
      const raw = {
        filters: {
          gender: 'Male',
          unknown_field: 'some value',
          another_unknown: 42,
        },
        confidence: 0.8,
        interpretation: 'test',
      };
      const result = validator.validate(raw);
      expect(result.filters.gender).toBe('Male');
      expect((result.filters as any).unknown_field).toBeUndefined();
      expect((result.filters as any).another_unknown).toBeUndefined();
    });

    it('should return empty filters for empty input', () => {
      const raw = {
        filters: {},
        confidence: 0.5,
        interpretation: 'No criteria found',
      };
      const result = validator.validate(raw);
      expect(Object.keys(result.filters).length).toBe(0);
    });
  });
});
