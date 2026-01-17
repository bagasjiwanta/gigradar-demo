import { analyzeData, findTopFreelancers, saveInsights } from './analysis';
import { ingestFreelancers } from './api';
import { appendToSheet } from './gsheets';
import { logger } from "./logger";
import { Freelancer } from './types';

/**
 * Sleep 
 */
const sleep = (seconds: number) => new Promise(resolve => setTimeout(resolve, seconds * 1000));

/**
 * Stream ingest only
 */
export async function streamIngest(limit: number, seconds: number, max?: number): Promise<void> {
  let page = 1;
  let totalProcessed = 0;
  
  while (true) {
    // Fetch batch
    logger.info(`Fetching page ${page}...`);
    const batch = await fetchBatch(page, limit);
    
    if (batch.length === 0) {
      logger.info('No more data to fetch');
      break;
    }
    
    // Write to sheets
    await appendToSheet(batch);
    totalProcessed += batch.length;
    logger.success(`Added ${batch.length} records to sheet (Total: ${totalProcessed})`);
    
    // Check if reached max
    if (max && totalProcessed >= max) {
      logger.info(`Reached max limit of ${max} records`);
      break;
    }
    
    // Wait before next batch
    if (batch.length === limit) {
      logger.info(`Waiting ${seconds} seconds...`);
      await sleep(seconds);
    } else {
      break; // No more data
    }
    
    page++;
  }
}

/**
 * Analyze data from API
 */
export async function analyzeFreelancers(max?: number): Promise<void> {
  logger.info('Fetching all data for analysis...');
  const allData = await ingestFreelancers();
  
  const dataToAnalyze = max ? allData.slice(0, max) : allData;
  logger.info(`Analyzing ${dataToAnalyze.length} records`);
  
  const topVariables = analyzeData(dataToAnalyze);
  const topFreelancers = findTopFreelancers(dataToAnalyze);
  
  await saveInsights(topVariables, topFreelancers, dataToAnalyze.length);
  
  logger.info('Top 3 Variables:');
  topVariables.forEach((v, i) => logger.info(`${i + 1}. ${v.name} (${v.impact.toFixed(2)})`));
  
  logger.info('Top 5 Freelancers:');
  topFreelancers.forEach((f, i) => logger.info(`${i + 1}. ${f.name} - $${f.earnings.toFixed(0)}`));
}

/**
 * Stream ingest + continuous analysis
 */
export async function streamIngestAndAnalyze(limit: number, seconds: number, max?: number): Promise<void> {
  let page = 1;
  const allData: Freelancer[] = [];
  
  while (true) {
    logger.info(`Fetching page ${page}...`);
    const batch = await fetchBatch(page, limit);
    
    if (batch.length === 0) {
      logger.info('No more data to fetch');
      break;
    }
    
    allData.push(...batch);
    
    // Write to sheets
    await appendToSheet(batch);
    logger.success(`Added ${batch.length} records to sheet (Total: ${allData.length})`);
    
    // Analyze current data
    const topVariables = analyzeData(allData);
    const topFreelancers = findTopFreelancers(allData);
    
    // Save insights
    await saveInsights(topVariables, topFreelancers, allData.length);
    
    // Display running insights
    logger.info(`RUNNING INSIGHTS (from ${allData.length} records):`);
    logger.info('Top 3 Variables:');
    topVariables.forEach((v, i) => logger.info(`  ${i + 1}. ${v.name} (${v.impact.toFixed(2)})`));
    
    logger.info('Top 5 Freelancers:');
    topFreelancers.forEach((f, i) => {
      const upworkUrl = `https://www.upwork.com/freelancers/~${f.ciphertext || ''}`;
      logger.info(`  ${i + 1}. ${f.name} (${upworkUrl}) - $${f.earnings.toFixed(0)}`);
    });
    
    // Check if reached max
    if (max && allData.length >= max) {
      logger.info(`\nReached max limit of ${max} records`);
      break;
    }
    
    // Wait before next batch
    if (batch.length === limit) {
      logger.info(`Waiting ${seconds} seconds...`);
      await sleep(seconds);
    } else {
      break;
    }
    
    page++;
  }
  
  logger.success(`\nFinal insights saved to insights.json`);
}

/**
 * Helper: Fetch a single batch/page
 */
async function fetchBatch(page: number, limit: number): Promise<Freelancer[]> {
  try {
    const response = await fetch(`http://localhost:3002/freelancers?page=${page}&limit=${limit}`);
    const data = await response.json() as {items : Freelancer[]};
    return data.items || [];
  } catch (error) {
    logger.error(`Failed to fetch page ${page}:`, error);
    return [];
  }
}