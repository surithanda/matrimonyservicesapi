import { Request, Response, NextFunction } from 'express';

export const validateAccountRegistration = (req: Request, res: Response, next: NextFunction) => {
  const { 
    email, 
    primary_phone, 
    first_name, 
    last_name, 
    birth_date,
    gender,
    address_line1,
    city,
    state,
    zip,
    country
  } = req.body;

  // Basic validation checks
  if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid email format'
    });
  }

  if (!primary_phone) {
    return res.status(400).json({
      success: false,
      message: 'Primary phone is required'
    });
  }

  const requiredFields = [
    'first_name',
    'last_name',
    'birth_date',
    'gender',
    'address_line1',
    'city',
    'state',
    'zip',
    'country'
  ];

  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }

  next();
}; 