import pool from '../config/database';

export const generateAccountCode = async (): Promise<string> => {
  // Format: YYYYMMDD-HHMMSS-XX
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
  const time = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0'); // XX
  const accountCode = `${date}-${time}-${random}`;
  
  // Check if the generated code already exists
  const [rows]: any = await pool.execute(
    'SELECT account_code FROM account WHERE account_code = ?',
    [accountCode]
  );
  
  if (rows.length > 0) {
    // If code exists, generate a new one recursively
    return generateAccountCode();
  }
  
  return accountCode;
}; 