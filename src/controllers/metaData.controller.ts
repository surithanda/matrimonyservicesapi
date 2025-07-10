import { Request, Response } from 'express';
import { MetaDataService } from '../services/metaData.service';

export const fetchCategory = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const service = new MetaDataService();
    const result = await service.getCategoryData(req.body);

    console.log("Controller result", result);
    console.log("-----------------------------------------------------------------------------");
    if (!result.success) {
      return res.status(409).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load data',
      error: error.message
    });
  }
};

export const fetchCountries = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const service = new MetaDataService();
    const result = await service.getCountryData(req.body);

    console.log("Controller result", result);
    console.log("-----------------------------------------------------------------------------");
    if (!result.success) {
      return res.status(409).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load data',
      error: error.message
    });
  }
};

export const fetchStates = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    const service = new MetaDataService();
    const result = await service.getStateData(req.body);

    console.log("Controller result", result);
    console.log("-----------------------------------------------------------------------------");
    if (!result.success) {
      return res.status(409).json(result);
    }
    
    res.status(201).json(result);
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Failed to load data',
      error: error.message
    });
  }
};
