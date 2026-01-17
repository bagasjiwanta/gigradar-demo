import { authenticate } from '@google-cloud/local-auth';
import { google, sheets_v4 } from 'googleapis';
import path from "node:path";
import { config } from './config';
import { Freelancer } from './types';

// const sheets = google.sheets('v4');

let sheetsInstance: sheets_v4.Sheets | null = null
let initPromise: Promise<sheets_v4.Sheets> | null = null

async function getSheets() {
  if (sheetsInstance) return sheetsInstance
  if (initPromise) return initPromise

  initPromise = (async () => {
    const auth = await authenticate({
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      keyfilePath: path.join(process.cwd(), 'credentials/google-credentials.json')
    })
    sheetsInstance = google.sheets({ version: 'v4', auth })
    return sheetsInstance
  })()

  return initPromise
}

// async function getSheets() {
//   const auth = await authenticate({
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     keyfilePath: path.join(process.cwd(), 'credentials/google-credentials.json')
//   })
//   return google.sheets({version: 'v4', auth: auth})
// }


// /**
//  * Authenticate with Google Sheets API
//  */
// async function getAuthClient() {
//   const credentials = JSON.parse(
//     fs.readFileSync(config.googleSheets.credentialsPath, 'utf-8')
//   );
// //   console.table(credentials)

//   const auth = new google.auth.GoogleAuth({
//     credentials,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//   });

//   return await auth.getClient();
// }

/**
 * Convert Freelancer data to Sheet Row format
 */
function freelancerToSheetRow(freelancer: Freelancer): any[] {
  const agency = freelancer.agencies?.[0];
  const skills = freelancer.attrSkills || [];
  const skill1 = skills[0]?.skills?.[0]?.skill?.prettyName || '';
  const skill2 = skills[0]?.skills?.[1]?.skill?.prettyName || skills[1]?.skills?.[0]?.skill?.prettyName || '';
  const serviceProfile = freelancer.serviceProfileNames?.[0] || '';
  
  // Format: "groupName - skillName"
  const skill1Formatted = skills[0]?.groupName && skill1 
    ? `${skills[0].groupName} - ${skill1}` 
    : skill1;
  const skill2Formatted = skills[0]?.groupName && skill2 
    ? `${skills[0].groupName} - ${skill2}` 
    : skill2;

  const upworkUrl = `https://www.upwork.com/freelancers/~${freelancer.ciphertext}`;
  
  return [
    freelancer.ciphertext,
    freelancer.ciphertext, // Do Not Delete
    freelancer.shortName,
    agency?.name || '',
    upworkUrl,
    '', // Status - empty by default
    new Date().toLocaleDateString('en-GB'), // Date
    '', // First name
    '', // Last name
    'FALSE', // Freelancer
    '', '', '', // Email, Phone, Company Phone
    freelancer.title,
    '', '', '', '', '', '', '', '', // Department through Website
    freelancer.location?.country || '',
    '', '', '', // Company LinkedIn through Source URL
    '', '', // Industry, Company Size
    '', '', '', '', '', '', '', // Solutions through Client3
    `${Math.round(freelancer.combinedTotalRevenue || 0)}`,
    freelancer.totalHourlyJobs || 0,
    `${Math.round(freelancer.combinedRecentEarnings || 0)}`,
    freelancer.workingYears?.toFixed(2) || '0',
    freelancer.avgDeadlinesScore?.toFixed(2) || '0',
    serviceProfile,
    freelancer.topRatedStatus || '',
    '', // summarySanitized - not available
    skill1Formatted,
    skill2Formatted,
    freelancer.memberSince,
    freelancer.memberSince,
    `${Math.round(freelancer.combinedRecentEarnings || 0)}`,
    `${Math.round(freelancer.combinedTotalRevenue || 0)}`,
    freelancer.description,
    freelancer.avgFeedbackScore?.toFixed(2) || '0',
    '', // companyLogo - not available
    '', '', // Owner, Research Campaign
    new Date().toISOString(),
    new Date().toISOString(),
  ];
}

/**
 * Append freelancers to Google Sheet
 */
export async function appendToSheet(freelancers: Freelancer[]): Promise<void> {
  // const auth = await getAuthClient();
  const sheets = await getSheets();
  const rows = freelancers.map(freelancerToSheetRow);
  
  await sheets.spreadsheets.values.append({
    // auth: auth as any,
    spreadsheetId: config.googleSheets.spreadsheetId,
    range: `${config.googleSheets.sheetName}!A:AZ`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: rows,
    },
  });
}

/**
 * Clear sheet and write new data (for full refresh)
 */
export async function updateGoogleSheet(freelancers: Freelancer[]): Promise<void> {
  // const auth = await getAuthClient();
  const sheets = await getSheets()
  
  // Clear existing data (keep headers)
  await sheets.spreadsheets.values.clear({
    // auth: auth as any,
    spreadsheetId: config.googleSheets.spreadsheetId,
    range: `${config.googleSheets.sheetName}!A2:AZ`,
  });
  
  // Add new data
  await appendToSheet(freelancers);
}