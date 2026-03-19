import { ISearchIntent, IResolvedIds } from '../../interfaces/aiSearch.interface';

interface QueryResult {
  sql: string;
  params: any[];
}

export class QueryBuilder {

  build(
    intent: ISearchIntent,
    resolvedIds: IResolvedIds,
    callerProfileId: number
  ): QueryResult {
    const conditions: string[] = [
      'pp.is_active = 1',
      'pp.profile_id != ?',
    ];
    const params: any[] = [callerProfileId];

    // Track which tables need JOINs
    let needAddress = false;
    let needEducation = false;
    let needEmployment = false;
    let needLifestyle = false;

    // ── Personal filters (profile_personal) ─────────────
    if (resolvedIds.gender != null) {
      conditions.push('pp.gender = ?');
      params.push(resolvedIds.gender);
    }

    if (intent.filters.min_age != null) {
      conditions.push('TIMESTAMPDIFF(YEAR, pp.birth_date, CURDATE()) >= ?');
      params.push(intent.filters.min_age);
    }

    if (intent.filters.max_age != null) {
      conditions.push('TIMESTAMPDIFF(YEAR, pp.birth_date, CURDATE()) <= ?');
      params.push(intent.filters.max_age);
    }

    if (resolvedIds.religion != null) {
      conditions.push('pp.religion = ?');
      params.push(resolvedIds.religion);
    }

    if (resolvedIds.caste != null) {
      conditions.push('pp.caste = ?');
      params.push(resolvedIds.caste);
    }

    if (resolvedIds.marital_status != null) {
      conditions.push('pp.marital_status = ?');
      params.push(resolvedIds.marital_status);
    }

    if (resolvedIds.nationality != null) {
      conditions.push('pp.nationality = ?');
      params.push(resolvedIds.nationality);
    }

    if (resolvedIds.profession != null) {
      conditions.push('pp.profession = ?');
      params.push(resolvedIds.profession);
    }

    if (intent.filters.min_height_cms != null) {
      conditions.push('pp.height_cms >= ?');
      params.push(intent.filters.min_height_cms);
    }

    if (intent.filters.max_height_cms != null) {
      conditions.push('pp.height_cms <= ?');
      params.push(intent.filters.max_height_cms);
    }

    if (intent.filters.min_weight != null) {
      conditions.push('pp.weight >= ?');
      params.push(intent.filters.min_weight);
    }

    if (intent.filters.max_weight != null) {
      conditions.push('pp.weight <= ?');
      params.push(intent.filters.max_weight);
    }

    if (resolvedIds.disability != null) {
      conditions.push('pp.disability = ?');
      params.push(resolvedIds.disability);
    }

    // ── Location filters (profile_address) ──────────────
    if (intent.filters.city) {
      needAddress = true;
      conditions.push('pa.city LIKE ?');
      params.push(`%${intent.filters.city}%`);
    }

    if (resolvedIds.state_id != null) {
      needAddress = true;
      conditions.push('pa.state = ?');
      params.push(resolvedIds.state_id);
    }

    if (resolvedIds.country_id != null) {
      needAddress = true;
      conditions.push('pa.country_id = ?');
      params.push(resolvedIds.country_id);
    }

    // ── Education filters (profile_education) ───────────
    if (resolvedIds.education_level != null) {
      needEducation = true;
      conditions.push('pe.education_level = ?');
      params.push(resolvedIds.education_level);
    }

    if (resolvedIds.field_of_study != null) {
      needEducation = true;
      conditions.push('pe.field_of_study = ?');
      params.push(resolvedIds.field_of_study);
    }

    if (intent.filters.institution_name) {
      needEducation = true;
      conditions.push('pe.institution_name LIKE ?');
      params.push(`%${intent.filters.institution_name}%`);
    }

    // ── Employment filters (profile_employment) ─────────
    if (resolvedIds.occupation != null) {
      needEmployment = true;
      conditions.push('pem.job_title_id = ?');
      params.push(resolvedIds.occupation);
    }

    if (intent.filters.company) {
      needEmployment = true;
      conditions.push('pem.institution_name LIKE ?');
      params.push(`%${intent.filters.company}%`);
    }

    if (intent.filters.min_salary != null) {
      needEmployment = true;
      conditions.push('pem.last_salary_drawn >= ?');
      params.push(intent.filters.min_salary);
    }

    if (intent.filters.max_salary != null) {
      needEmployment = true;
      conditions.push('pem.last_salary_drawn <= ?');
      params.push(intent.filters.max_salary);
    }

    // ── Lifestyle filters (profile_lifestyle — varchar columns) ──
    if (intent.filters.eating_habit) {
      needLifestyle = true;
      conditions.push('pl.eating_habit LIKE ?');
      params.push(`%${intent.filters.eating_habit}%`);
    }

    if (intent.filters.diet_habit) {
      needLifestyle = true;
      conditions.push('pl.diet_habit LIKE ?');
      params.push(`%${intent.filters.diet_habit}%`);
    }

    if (intent.filters.drinking) {
      needLifestyle = true;
      conditions.push('pl.drink_frequency LIKE ?');
      params.push(`%${intent.filters.drinking}%`);
    }

    if (intent.filters.smoking) {
      needLifestyle = true;
      conditions.push('pl.cigarettes_per_day LIKE ?');
      params.push(`%${intent.filters.smoking}%`);
    }

    if (intent.filters.physical_activity) {
      needLifestyle = true;
      conditions.push('pl.physical_activity_level LIKE ?');
      params.push(`%${intent.filters.physical_activity}%`);
    }

    // ── Build JOINs (only for tables actually needed) ───
    const joins: string[] = [];

    if (needAddress) {
      joins.push('LEFT JOIN profile_address pa ON pp.profile_id = pa.profile_id');
    }
    if (needEducation) {
      joins.push('LEFT JOIN profile_education pe ON pp.profile_id = pe.profile_id');
    }
    if (needEmployment) {
      joins.push('LEFT JOIN profile_employment pem ON pp.profile_id = pem.profile_id');
    }
    if (needLifestyle) {
      joins.push('LEFT JOIN profile_lifestyle pl ON pp.profile_id = pl.profile_id AND pl.is_active = 1');
    }

    // Always join photo for primary photo URL
    joins.push(
      'LEFT JOIN profile_photo ph ON pp.profile_id = ph.profile_id AND ph.photo_type = 450'
    );

    // ── ORDER BY ────────────────────────────────────────
    let orderBy = 'pp.created_date DESC';
    switch (intent.sort_by) {
      case 'age_asc':     orderBy = 'pp.birth_date DESC'; break;
      case 'age_desc':    orderBy = 'pp.birth_date ASC'; break;
      case 'newest':      orderBy = 'pp.created_date DESC'; break;
      case 'height_desc': orderBy = 'pp.height_cms DESC'; break;
      case 'salary_desc': orderBy = 'pp.created_date DESC'; break; // fallback — salary is in employment table
    }

    // ── Assemble SQL ────────────────────────────────────
    const sql = `
      SELECT DISTINCT
        pp.profile_id,
        pp.first_name,
        pp.last_name,
        pp.gender,
        pp.birth_date,
        TIMESTAMPDIFF(YEAR, pp.birth_date, CURDATE()) AS age,
        pp.religion,
        pp.caste,
        pp.marital_status,
        pp.nationality,
        pp.height_cms,
        pp.weight,
        pp.complexion,
        pp.profession,
        pp.short_summary,
        ph.url AS primary_photo_url
      FROM profile_personal pp
      ${joins.join('\n      ')}
      WHERE ${conditions.join('\n        AND ')}
      ORDER BY ${orderBy}
      LIMIT 50
    `;

    return { sql, params };
  }
}
