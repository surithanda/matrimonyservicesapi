import { ISearchFilters, IResolvedIds } from '../../interfaces/aiSearch.interface';

interface LookupEntry {
  id: number;
  name: string;
}

interface GeoEntry {
  id: number;
  name: string;
}

export class LookupResolver {

  resolve(
    filters: ISearchFilters,
    lookupCache: Map<string, LookupEntry[]>,
    countryCache: GeoEntry[],
    stateCache: GeoEntry[]
  ): IResolvedIds {
    const resolved: IResolvedIds = {};

    // Map filter field → lookup category
    const fieldCategoryMap: Record<string, string> = {
      gender: 'gender',
      religion: 'religion',
      caste: 'caste',
      marital_status: 'marital_status',
      nationality: 'nationality',
      profession: 'profession',
      education_level: 'education_level',
      field_of_study: 'field_of_study',
      occupation: 'job_title',
      disability: 'disability',
    };

    for (const [field, category] of Object.entries(fieldCategoryMap)) {
      const value = (filters as any)[field];
      if (value && typeof value === 'string') {
        const lookups = lookupCache.get(category) || [];
        (resolved as any)[field] = this.fuzzyMatch(value, lookups);
      }
    }

    // Resolve country from country table
    if (filters.country) {
      resolved.country_id = this.fuzzyMatch(
        filters.country,
        countryCache
      );
    }

    // Resolve state from state table
    if (filters.state) {
      resolved.state_id = this.fuzzyMatch(
        filters.state,
        stateCache
      );
    }

    // Resolve hobbies array
    if (filters.hobbies && filters.hobbies.length > 0) {
      const hobbyLookups = lookupCache.get('hobby') || [];
      resolved.hobbies = filters.hobbies.map(h => this.fuzzyMatch(h, hobbyLookups));
    }

    return resolved;
  }

  private fuzzyMatch(
    text: string,
    lookups: { id: number; name: string }[]
  ): number | null {
    if (!text || !lookups.length) return null;

    const lower = text.toLowerCase().trim();

    // 1. Exact match
    const exact = lookups.find(l => l.name === text);
    if (exact) return exact.id;

    // 2. Case-insensitive match
    const caseInsensitive = lookups.find(
      l => l.name.toLowerCase() === lower
    );
    if (caseInsensitive) return caseInsensitive.id;

    // 3. Lookup name contains search text
    const contains = lookups.find(
      l => l.name.toLowerCase().includes(lower)
    );
    if (contains) return contains.id;

    // 4. Search text contains lookup name
    const partial = lookups.find(
      l => lower.includes(l.name.toLowerCase())
    );
    if (partial) return partial.id;

    return null;
  }
}
