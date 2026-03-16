import pool from '../../config/database';
import logger from '../../config/logger';

interface LookupEntry {
  id: number;
  name: string;
}

interface GeoEntry {
  id: number;
  name: string;
}

export class SchemaContext {
  private lookupCache: Map<string, LookupEntry[]> = new Map();
  private countryCache: GeoEntry[] = [];
  private stateCache: GeoEntry[] = [];
  private systemPrompt: string = '';
  private lastRefreshed: Date | null = null;

  async initialize(): Promise<void> {
    const categories = [
      'gender', 'religion', 'caste', 'marital_status',
      'education_level', 'field_of_study', 'job_title',
      'profession', 'nationality', 'hobby', 'disability',
    ];

    for (const category of categories) {
      try {
        const [rows] = await pool.execute('CALL lkp_get_LookupData(?)', [category]);
        const data = (rows as any[])[0] || [];
        // Deduplicate by name (some categories have duplicate entries)
        const seen = new Set<string>();
        const unique: LookupEntry[] = [];
        for (const item of data) {
          const key = (item.name || '').toLowerCase();
          if (!seen.has(key)) {
            seen.add(key);
            unique.push({ id: item.id, name: item.name });
          }
        }
        this.lookupCache.set(category, unique);
      } catch (err: any) {
        logger.warn(`[SchemaContext] Failed to load lookup category: ${category}`, { error: err.message });
      }
    }

    // Load countries
    try {
      const [rows] = await pool.execute(
        'SELECT country_id AS id, country_name AS name FROM country WHERE is_active = 1 ORDER BY country_name'
      );
      this.countryCache = (rows as any[]) || [];
    } catch (err: any) {
      logger.warn('[SchemaContext] Failed to load countries', { error: err.message });
    }

    // Load states
    try {
      const [rows] = await pool.execute(
        'SELECT state_id AS id, state_name AS name FROM state WHERE is_active = 1 ORDER BY state_name'
      );
      this.stateCache = (rows as any[]) || [];
    } catch (err: any) {
      logger.warn('[SchemaContext] Failed to load states', { error: err.message });
    }

    this.systemPrompt = this.buildSystemPrompt();
    this.lastRefreshed = new Date();
    logger.info('[SchemaContext] Initialized', {
      categories: categories.length,
      countries: this.countryCache.length,
      states: this.stateCache.length,
    });
  }

  private buildSystemPrompt(): string {
    return `You are a matrimony profile search assistant for MATA Matrimony.
Your ONLY job is to parse natural language search queries into structured JSON filters.

AVAILABLE FILTERS AND VALID VALUES:

1. PERSONAL FILTERS:
   - gender: ${this.getLookupNames('gender')}
   - religion: ${this.getLookupNames('religion')}
   - caste: ${this.getLookupNames('caste')}
   - marital_status: ${this.getLookupNames('marital_status')}
   - nationality: ${this.getLookupNames('nationality')}
   - profession: ${this.getLookupNames('profession')}
   - disability: ${this.getLookupNames('disability')}
   - min_age, max_age: integers between 18 and 80
   - min_height_cms, max_height_cms: integers (e.g., 140 to 210)
   - min_weight, max_weight: integers in kg

2. LOCATION FILTERS:
   - city: free text (e.g., "Hyderabad", "Mumbai", "Chennai", "Bangalore")
   - state: free text (e.g., "Telangana", "Maharashtra", "Karnataka", "Tamil Nadu")
   - country: free text (e.g., "India", "United States", "Canada", "United Kingdom")

3. EDUCATION FILTERS:
   - education_level: ${this.getLookupNames('education_level')}
   - field_of_study: ${this.getLookupNames('field_of_study')}
   - institution_name: free text (college/university name)

4. EMPLOYMENT FILTERS:
   - occupation (job title): ${this.getLookupNames('job_title')}
   - company: free text (employer name)
   - min_salary, max_salary: integers (annual income)

5. LIFESTYLE FILTERS (stored as text — use exact or close match):
   - eating_habit: "Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"
   - diet_habit: free text
   - drinking: "Non-Drinker", "Social Drinker", "Regular Drinker", "Occasional"
   - smoking: "Non-Smoker", "Occasional Smoker", "Regular Smoker", "0", "1-5", "5-10"
   - physical_activity: "Active", "Moderate", "Sedentary"

6. OTHER FILTERS:
   - hobbies: array of strings from ${this.getLookupNames('hobby')}

7. SORTING (optional):
   - sort_by: "age_asc", "age_desc", "newest", "salary_desc", "height_desc"

RESPONSE FORMAT — Return ONLY valid JSON:
{
  "filters": { },
  "sort_by": "newest",
  "confidence": 0.85,
  "interpretation": "Brief human-readable summary of what you understood"
}

RULES:
1. Return ONLY valid JSON — no markdown, no code blocks, no explanation outside the JSON.
2. Only include filters that the user explicitly or clearly implies.
3. Set confidence between 0.0 and 1.0 based on clarity of the query.
4. If the query is vague, include fewer filters and lower confidence.
5. If the query is unrelated to profile search, return: {"filters": {}, "confidence": 0, "interpretation": "Query not related to profile search"}
6. Use the closest matching value from the valid options listed above.
7. When the user mentions "tall", interpret as min_height_cms: 170.
8. When the user mentions "well-educated", interpret as education_level with a post-graduate or higher value.
9. When the user mentions "good salary" or "well-earning", interpret as min_salary: 1000000.
10. Always infer gender from context if not explicitly stated (e.g., "bride"/"girl" = Female, "groom"/"boy" = Male).
11. Never include SQL, code, or anything outside the JSON schema.
12. The "filters" object should only contain the keys listed above — do not invent new keys.`;
  }

  private getLookupNames(category: string): string {
    const items = this.lookupCache.get(category) || [];
    if (items.length === 0) return '"(none loaded)"';
    const names = items.map(item => `"${item.name}"`).join(', ');
    return names;
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }

  getLookupCache(): Map<string, LookupEntry[]> {
    return this.lookupCache;
  }

  getCountryCache(): GeoEntry[] {
    return this.countryCache;
  }

  getStateCache(): GeoEntry[] {
    return this.stateCache;
  }

  getLastRefreshed(): Date | null {
    return this.lastRefreshed;
  }
}
