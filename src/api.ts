import axios, { AxiosError } from 'axios';
import { config } from './config';
import { logger } from './logger';
import { ApiResponse, Freelancer } from './types';

const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

/**
 * Fetch a single page of freelancers from the API
 */
async function fetchPage(page: number, limit: number = 10): Promise<ApiResponse> {
  const url = `${config.api.baseUrl}${config.api.endpoint}`;
  
  try {
    const response = await axios.get<ApiResponse>(url, {
      params: { page, limit },
      timeout: 10000, // 10 second timeout
    });
    
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(`Failed to fetch page ${page}: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Fetch a page with retry logic
 */
async function fetchPageWithRetry(
  page: number,
  limit: number,
  retries: number = MAX_RETRIES
): Promise<ApiResponse> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fetchPage(page, limit);
    } catch (error) {
      if (attempt === retries) {
        throw error;
      }
      
      logger.warn(`Retry ${attempt}/${retries} for page ${page} after error`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * attempt));
    }
  }
  
  throw new Error(`Failed to fetch page ${page} after ${retries} retries`);
}

/**
 * Ingest all freelancers from the API with pagination
 */
export async function ingestFreelancers(): Promise<Freelancer[]> {
  const limit = 10; // Records per page
  const allFreelancers: Freelancer[] = [];
  
  try {
    // Fetch first page to get total count
    logger.info('Fetching first page to determine total records...');
    const firstPage = await fetchPageWithRetry(1, limit);
    
    const { total, totalPages } = firstPage;
    logger.info(`Total records: ${total}, Total pages: ${totalPages}`);
    
    // Add first page items
    allFreelancers.push(...firstPage.items);
    logger.info(`Progress: 1/${totalPages} pages (${allFreelancers.length}/${total} records)`);
    
    // Fetch remaining pages
    for (let page = 2; page <= totalPages; page++) {
      const pageData = await fetchPageWithRetry(page, limit);
      allFreelancers.push(...pageData.items);
      
      // Log progress every 10 pages or on last page
      if (page % 10 === 0 || page === totalPages) {
        logger.info(`Progress: ${page}/${totalPages} pages (${allFreelancers.length}/${total} records)`);
      }
    }
    
    logger.success(`✓ Successfully fetched all ${allFreelancers.length} freelancers`);
    return allFreelancers;
    
  } catch (error) {
    logger.error('Failed to ingest freelancers:', error);
    throw error;
  }
}

/**
 * Fetch a limited number of freelancers (for testing)
 */
export async function ingestFreelancersLimited(
  limit: number = 10,
  maxPages: number = 5
): Promise<Freelancer[]> {
  const allFreelancers: Freelancer[] = [];
  
  try {
    for (let page = 1; page <= maxPages; page++) {
      const pageData = await fetchPageWithRetry(page, limit);
      allFreelancers.push(...pageData.items);
      
      logger.info(`Fetched page ${page}/${maxPages} (${allFreelancers.length} records)`);
      
      // Stop if no more pages
      if (!pageData.hasNextPage) {
        break;
      }
    }
    
    logger.success(`✓ Fetched ${allFreelancers.length} freelancers`);
    return allFreelancers;
    
  } catch (error) {
    logger.error('Failed to ingest freelancers:', error);
    throw error;
  }
}