// src/pages/api/companies.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getCompanyData } from '../../server/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const companies = await getCompanyData();
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch company data' });
  }
}
