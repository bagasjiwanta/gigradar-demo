import dotenv from 'dotenv';

dotenv.config();

export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3002',
    endpoint: '/freelancers',
  },
  googleSheets: {
    spreadsheetId: process.env.GOOGLE_SHEET_ID || '1sxm5uw8UpEqwW1MpC63MO599cFK5u8CkDD2xG5n0cco',
    credentialsPath: process.env.GOOGLE_CREDENTIALS_PATH || './credentials/google-credentials.json',
    sheetName: process.env.SHEET_NAME || 'Sheet1',
  },
  telegram: {
    botToken: '6687009206:AAEVWwjLKSArdfGqUhgy6Wx428XyN70kLR8',
    channelUrl: 'https://t.me/+YUisED2qUpoyZGI6',
  },
};