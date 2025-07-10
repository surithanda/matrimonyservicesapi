import { MetaDataRepository } from '../repositories/metaData.repository';
import pool from '../config/database';

export class MetaDataService {
  private metaDataRepository: MetaDataRepository;

  constructor() {
    this.metaDataRepository = new MetaDataRepository();
  }

  async getCategoryData(data:any): Promise<{ success: boolean; message: string; data?: any }> {
    const connection = await pool.getConnection();
    
    try {
      const result = await this.metaDataRepository.getMetadataByCategory(data.category);
      let response = null;
      if(result){
        response = {
          success: true,
          message: 'Category data fetched successfully',
          data: result[0]
        }
      }
      else{
        
        response = {
        success: false,
        message: "Could not fetch data"
        }
        
      }

      return response;
    } catch (error: any) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getCountryData(data:any): Promise<{ success: boolean; message: string; data?: any }> {
    const connection = await pool.getConnection();
    
    try {
      const result = await this.metaDataRepository.getCountries();
      let response = null;
      if(result){
        response = {
          success: true,
          message: 'Countries fetched successfully',
          data: result[0]
        }
      }
      else{
        
        response = {
        success: false,
        message: "Could not fetch countries"
        }
        
      }

      return response;
    } catch (error: any) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async getStateData(data:any): Promise<{ success: boolean; message: string; data?: any }> {
    const connection = await pool.getConnection();
    
    try {
      const result = await this.metaDataRepository.getStatesByCountry(data.country);
      let response = null;
      if(result){
        response = {
          success: true,
          message: 'States fetched successfully',
          data: result[0]
        }
      }
      else{
        
        response = {
        success: false,
        message: "Could not fetch states"
        }
        
      }

      return response;
    } catch (error: any) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
} 