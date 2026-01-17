import { Command } from 'commander';
import { logger } from './logger';
import { analyzeFreelancers, streamIngest, streamIngestAndAnalyze } from './orchestrator';

const program = new Command();

program
  .name('gigradar-demo')
  .description('GigRadar Test')
  .version('1.0.0');

program
  .command('ingest')
  .description('Ingest data from API and add to Google Sheets')
  .requiredOption('-l, --limit <number>', 'Records per batch')
  .requiredOption('-s, --seconds <number>', 'Delay between batches in seconds')
  .option('-m, --max <number>', 'Maximum records to ingest')
  .action(async (options) => {
    try {
      console.log(process.cwd())
      const limit = parseInt(options.limit);
      const seconds = parseInt(options.seconds);
      const max = options.max ? parseInt(options.max) : undefined;

      logger.info(`Starting ingestion: ${limit} records every ${seconds} seconds`);
      if (max) logger.info(`Max records: ${max}`);

      await streamIngest(limit, seconds, max);
      logger.success('Ingestion completed!');
    } catch (error) {
      logger.error('Ingestion failed:', error);
      process.exit(1);
    }
  });

program
  .command('analyze')
  .description('Analyze data and output insights to JSON')
  .option('-m, --max <number>', 'Maximum records to analyze')
  .action(async (options) => {
    try {
      const max = options.max ? parseInt(options.max) : undefined;

      logger.info('Starting analysis...');
      if (max) logger.info(`Analyzing up to ${max} records`);

      await analyzeFreelancers(max);
      logger.success('Analysis completed! Check insights.json');
    } catch (error) {
      logger.error('Analysis failed:', error);
      process.exit(1);
    }
  });

program
  .command('ingest-analyze')
  .description('Ingest data while continuously analyzing and showing running insights')
  .requiredOption('-l, --limit <number>', 'Records per batch')
  .requiredOption('-s, --seconds <number>', 'Delay between batches in seconds')
  .option('-m, --max <number>', 'Maximum records to process')
  .action(async (options) => {
    try {
      const limit = parseInt(options.limit);
      const seconds = parseInt(options.seconds);
      const max = options.max ? parseInt(options.max) : undefined;

      logger.info(`Starting stream ingestion + analysis: ${limit} records every ${seconds} seconds`);
      if (max) logger.info(`Max records: ${max}`);

      await streamIngestAndAnalyze(limit, seconds, max);
      logger.success('✓ Ingestion and analysis completed! Check insights.json');
    } catch (error) {
      logger.error('Process failed:', error);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}