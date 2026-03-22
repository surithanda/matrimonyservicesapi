import { ISearchIntent, ISearchFilters } from '../../interfaces/aiSearch.interface';

export class IntentValidator {

  validate(raw: any): ISearchIntent {
    if (!raw || typeof raw !== 'object') {
      throw new Error('AI returned non-object response');
    }

    // If AI returns the intent without a wrapper, handle both formats
    const source = raw.filters && typeof raw.filters === 'object' ? raw : { filters: raw };

    const confidence = typeof source.confidence === 'number'
      ? Math.min(1, Math.max(0, source.confidence))
      : 0.5;

    const interpretation = typeof source.interpretation === 'string'
      ? source.interpretation.substring(0, 500)
      : 'No interpretation provided';

    const filters = this.sanitizeFilters(source.filters || {});

    const validSorts = ['age_asc', 'age_desc', 'newest', 'salary_desc', 'height_desc'];
    const sort_by = validSorts.includes(source.sort_by) ? source.sort_by : undefined;

    return { filters, sort_by, confidence, interpretation };
  }

  private sanitizeFilters(raw: any): ISearchFilters {
    const clean: ISearchFilters = {};

    // String fields — only accept non-empty strings, max 100 chars
    const stringFields = [
      'gender', 'religion', 'caste', 'marital_status', 'nationality',
      'complexion', 'profession', 'city', 'state', 'country',
      'education_level', 'field_of_study', 'institution_name',
      'occupation', 'company', 'eating_habit', 'diet_habit',
      'drinking', 'smoking', 'physical_activity', 'disability',
    ];

    for (const field of stringFields) {
      const val = (raw as any)[field];
      if (val && typeof val === 'string' && val.trim().length > 0) {
        (clean as any)[field] = val.trim().substring(0, 100);
      }
    }

    // Numeric fields — only accept values within sane ranges
    const numericRanges: [string, number, number][] = [
      ['min_age', 18, 80],
      ['max_age', 18, 80],
      ['min_height_cms', 100, 250],
      ['max_height_cms', 100, 250],
      ['min_weight', 20, 300],
      ['max_weight', 20, 300],
      ['min_salary', 0, 999999999],
      ['max_salary', 0, 999999999],
    ];

    for (const [field, min, max] of numericRanges) {
      const val = (raw as any)[field];
      if (typeof val === 'number' && !isNaN(val) && val >= min && val <= max) {
        (clean as any)[field] = Math.round(val);
      }
    }

    // Array fields — hobbies
    if (Array.isArray(raw.hobbies)) {
      clean.hobbies = raw.hobbies
        .filter((h: any) => typeof h === 'string' && h.trim().length > 0)
        .map((h: string) => h.trim().substring(0, 100))
        .slice(0, 10);
    }

    return clean;
  }
}
