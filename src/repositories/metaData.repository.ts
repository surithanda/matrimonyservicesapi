import pool from '../config/database';
import { PoolConnection } from 'mysql2/promise';

export class MetaDataRepository {

  async getMetadataByCategory(category: string): Promise<any> {
    const categoryData = await pool.execute(
      `CALL lkp_get_LookupData(?)`,
      [category]
    );
    return (categoryData as any[])[0];
  }

  async getCountries(): Promise<any> {
    const data = await pool.execute(
      `CALL lkp_get_Country_List()`
    );
    return (data as any[])[0];
  }

  async getStatesByCountry(country: string): Promise<any> {
    const data = await pool.execute(
      `CALL lkp_get_Country_States(?)`,
      [country]
    );
    return (data as any[])[0];
  }
} 