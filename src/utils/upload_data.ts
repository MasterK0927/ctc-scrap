// scripts/upload_data.ts
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { addCompanyData, syncDatabase } from '../server/database';

async function uploadData() {
  await syncDatabase();

  const filePath = path.resolve(__dirname, '../ml/cleaned_data.csv');
  fs.createReadStream(filePath)
    .pipe(csvParser())
    .on('data', async (row) => {
      const companyData = {
        name: row.name,
        ctc: parseFloat(row.ctc),
        stipend: row.stipend ? parseFloat(row.stipend) : undefined,
        college: row.college,
      };
      await addCompanyData(companyData);
    })
    .on('end', () => {
      console.log('Data uploaded successfully.');
    });
}

uploadData();
