import { QueryBuilder } from '../../services/aiSearch/queryBuilder';
import { ISearchIntent, IResolvedIds } from '../../interfaces/aiSearch.interface';

describe('QueryBuilder', () => {
  let builder: QueryBuilder;
  const callerProfileId = 42;

  beforeEach(() => {
    builder = new QueryBuilder();
  });

  describe('build()', () => {
    it('should generate base query excluding caller profile', () => {
      const intent: ISearchIntent = {
        filters: {},
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('pp.is_active = 1');
      expect(sql).toContain('pp.profile_id != ?');
      expect(params[0]).toBe(callerProfileId);
      expect(sql).toContain('LIMIT 50');
    });

    it('should add gender filter when resolved', () => {
      const intent: ISearchIntent = {
        filters: { gender: 'Female' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { gender: 10 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('pp.gender = ?');
      expect(params).toContain(10);
    });

    it('should add age range filters', () => {
      const intent: ISearchIntent = {
        filters: { min_age: 25, max_age: 35 },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('TIMESTAMPDIFF(YEAR, pp.birth_date, CURDATE()) >= ?');
      expect(sql).toContain('TIMESTAMPDIFF(YEAR, pp.birth_date, CURDATE()) <= ?');
      expect(params).toContain(25);
      expect(params).toContain(35);
    });

    it('should add religion filter', () => {
      const intent: ISearchIntent = {
        filters: { religion: 'Hindu' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { religion: 131 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('pp.religion = ?');
      expect(params).toContain(131);
    });

    it('should add caste filter', () => {
      const intent: ISearchIntent = {
        filters: { caste: 'Brahmin' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { caste: 168 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('pp.caste = ?');
      expect(params).toContain(168);
    });

    it('should add height range filters', () => {
      const intent: ISearchIntent = {
        filters: { min_height_cms: 160, max_height_cms: 180 },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('pp.height_cms >= ?');
      expect(sql).toContain('pp.height_cms <= ?');
      expect(params).toContain(160);
      expect(params).toContain(180);
    });

    // ── Location JOINs ─────────────────────────────
    it('should LEFT JOIN profile_address for city filter', () => {
      const intent: ISearchIntent = {
        filters: { city: 'Hyderabad' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_address pa');
      expect(sql).toContain('pa.city LIKE ?');
      expect(params).toContain('%Hyderabad%');
    });

    it('should LEFT JOIN profile_address for country filter', () => {
      const intent: ISearchIntent = {
        filters: { country: 'India' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { country_id: 101 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_address pa');
      expect(sql).toContain('pa.country_id = ?');
      expect(params).toContain(101);
    });

    it('should LEFT JOIN profile_address for state filter', () => {
      const intent: ISearchIntent = {
        filters: { state: 'Telangana' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { state_id: 1 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_address pa');
      expect(sql).toContain('pa.state = ?');
      expect(params).toContain(1);
    });

    it('should NOT JOIN profile_address when no location filters', () => {
      const intent: ISearchIntent = {
        filters: { gender: 'Male' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { gender: 9 };

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).not.toContain('LEFT JOIN profile_address pa');
    });

    // ── Education JOINs ─────────────────────────────
    it('should LEFT JOIN profile_education for education_level', () => {
      const intent: ISearchIntent = {
        filters: { education_level: 'MBA' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { education_level: 273 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_education pe');
      expect(sql).toContain('pe.education_level = ?');
      expect(params).toContain(273);
    });

    it('should LEFT JOIN profile_education for institution_name', () => {
      const intent: ISearchIntent = {
        filters: { institution_name: 'IIT' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_education pe');
      expect(sql).toContain('pe.institution_name LIKE ?');
      expect(params).toContain('%IIT%');
    });

    it('should NOT JOIN profile_education when no education filters', () => {
      const intent: ISearchIntent = {
        filters: { gender: 'Male' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { gender: 9 };

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).not.toContain('LEFT JOIN profile_education pe');
    });

    // ── Employment JOINs ────────────────────────────
    it('should LEFT JOIN profile_employment for occupation', () => {
      const intent: ISearchIntent = {
        filters: { occupation: 'Software Engineer' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { occupation: 284 };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_employment pem');
      expect(sql).toContain('pem.job_title_id = ?');
      expect(params).toContain(284);
    });

    it('should LEFT JOIN profile_employment for salary range', () => {
      const intent: ISearchIntent = {
        filters: { min_salary: 500000, max_salary: 2000000 },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_employment pem');
      expect(sql).toContain('pem.last_salary_drawn >= ?');
      expect(sql).toContain('pem.last_salary_drawn <= ?');
      expect(params).toContain(500000);
      expect(params).toContain(2000000);
    });

    it('should LEFT JOIN profile_employment for company filter', () => {
      const intent: ISearchIntent = {
        filters: { company: 'Google' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_employment pem');
      expect(sql).toContain('pem.institution_name LIKE ?');
      expect(params).toContain('%Google%');
    });

    // ── Lifestyle JOINs ─────────────────────────────
    it('should LEFT JOIN profile_lifestyle for eating_habit', () => {
      const intent: ISearchIntent = {
        filters: { eating_habit: 'Vegetarian' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_lifestyle pl');
      expect(sql).toContain('pl.eating_habit LIKE ?');
      expect(params).toContain('%Vegetarian%');
    });

    it('should LEFT JOIN profile_lifestyle for drinking filter', () => {
      const intent: ISearchIntent = {
        filters: { drinking: 'Non-Drinker' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_lifestyle pl');
      expect(sql).toContain('pl.drink_frequency LIKE ?');
      expect(params).toContain('%Non-Drinker%');
    });

    it('should NOT JOIN profile_lifestyle when no lifestyle filters', () => {
      const intent: ISearchIntent = {
        filters: { gender: 'Male' },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = { gender: 9 };

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).not.toContain('LEFT JOIN profile_lifestyle pl');
    });

    // ── Always JOIN photo ───────────────────────────
    it('should always LEFT JOIN profile_photo for primary photo', () => {
      const intent: ISearchIntent = {
        filters: {},
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('LEFT JOIN profile_photo ph');
      expect(sql).toContain('ph.photo_type = 450');
    });

    // ── Sorting ─────────────────────────────────────
    it('should default sort to newest', () => {
      const intent: ISearchIntent = {
        filters: {},
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('ORDER BY pp.created_date DESC');
    });

    it('should sort by age_asc (youngest first = birth_date DESC)', () => {
      const intent: ISearchIntent = {
        filters: {},
        sort_by: 'age_asc',
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('ORDER BY pp.birth_date DESC');
    });

    it('should sort by age_desc (oldest first = birth_date ASC)', () => {
      const intent: ISearchIntent = {
        filters: {},
        sort_by: 'age_desc',
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('ORDER BY pp.birth_date ASC');
    });

    it('should sort by height_desc', () => {
      const intent: ISearchIntent = {
        filters: {},
        sort_by: 'height_desc',
        confidence: 0.5,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql } = builder.build(intent, resolved, callerProfileId);

      expect(sql).toContain('ORDER BY pp.height_cms DESC');
    });

    // ── Complex multi-filter query ──────────────────
    it('should combine multiple filters with correct JOINs', () => {
      const intent: ISearchIntent = {
        filters: {
          gender: 'Female',
          min_age: 25,
          max_age: 30,
          religion: 'Hindu',
          education_level: 'MBA',
          city: 'Hyderabad',
          country: 'India',
          eating_habit: 'Vegetarian',
          min_salary: 1000000,
        },
        sort_by: 'newest',
        confidence: 0.95,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {
        gender: 10,
        religion: 131,
        education_level: 273,
        country_id: 101,
      };

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      // Should have all 4 optional JOINs
      expect(sql).toContain('LEFT JOIN profile_address pa');
      expect(sql).toContain('LEFT JOIN profile_education pe');
      expect(sql).toContain('LEFT JOIN profile_employment pem');
      expect(sql).toContain('LEFT JOIN profile_lifestyle pl');

      // Check conditions
      expect(sql).toContain('pp.gender = ?');
      expect(sql).toContain('pp.religion = ?');
      expect(sql).toContain('pe.education_level = ?');
      expect(sql).toContain('pa.city LIKE ?');
      expect(sql).toContain('pa.country_id = ?');
      expect(sql).toContain('pl.eating_habit LIKE ?');
      expect(sql).toContain('pem.last_salary_drawn >= ?');

      // Verify DISTINCT (prevents duplicates from JOINs)
      expect(sql).toContain('SELECT DISTINCT');

      // Correct number of params: callerProfileId + 10 filter values
      expect(params.length).toBeGreaterThanOrEqual(8);
    });

    // ── SQL injection safety ────────────────────────
    it('should use parameterized queries (no raw string interpolation)', () => {
      const intent: ISearchIntent = {
        filters: { city: "'; DROP TABLE profile_personal; --" },
        confidence: 0.9,
        interpretation: 'test',
      };
      const resolved: IResolvedIds = {};

      const { sql, params } = builder.build(intent, resolved, callerProfileId);

      // The malicious string should be in params, not in SQL
      expect(sql).not.toContain('DROP TABLE');
      expect(sql).toContain('pa.city LIKE ?');
      expect(params).toContain("%'; DROP TABLE profile_personal; --%");
    });
  });
});
