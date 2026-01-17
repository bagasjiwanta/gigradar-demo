import * as fs from 'fs';
import { Matrix, solve } from "ml-matrix";
import { Freelancer, VariableImpact } from './types';

/**
 * One-hot encode categorical features
 */
function oneHotEncode(data: Freelancer[]): { features: number[][], featureNames: string[] } {
  const features: number[][] = [];
  const featureNames: string[] = [];
  
  // Numerical features
  const numericalFeatures = [
    'totalHoursBilled',
    'totalFeedbacks',
    'avgFeedbackScore',
    'recentAvgFeedbackScore',
    'totalJobs',
    'avgQualityScore',
    'avgSkillsScore',
    'avgCooperationScore',
    'avgAvailabilityScore',
    'avgCommunicationScore',
    'avgDeadlinesScore',
    'workingYears',
    'totalCompletedJobs',
    'openingContracts',
  ];
  
  featureNames.push(...numericalFeatures);
  
  // Categorical features to one-hot encode
  const topRatedStatuses = [...new Set(data.map(f => f.topRatedStatus || 'none'))];
  const countries = [...new Set(data.map(f => f.location?.country || 'unknown'))];
  
  topRatedStatuses.slice(1).forEach(status => featureNames.push(`topRated_${status}`));
  countries.slice(1).forEach(country => featureNames.push(`country_${country}`));
  
  // Build feature matrix
  data.forEach(freelancer => {
    const row: number[] = [];
    
    // Add numerical features
    numericalFeatures.forEach(feature => {
      const value = (freelancer as any)[feature];
      row.push(typeof value === 'number' ? value : 0);
    });
    
    topRatedStatuses
      .slice(1)  // drop 1 column
      .forEach(status => {
        row.push((freelancer.topRatedStatus || 'none') === status ? 1 : 0);
    });
    
    countries
      .slice(1) // drop 1 column
      .forEach(country => {
        row.push((freelancer.location?.country || 'unknown') === country ? 1 : 0);
    });
    
    features.push(row);
  });
  
  return { features, featureNames };
}

/**
 * Analyze data using linear regression to find top variables impacting earnings
 */
export function analyzeData(freelancers: Freelancer[]): VariableImpact[] {
  
  // log the earnings
  const earnings = freelancers.map(f => f.combinedTotalEarnings || 0);
  const yLog = earnings.map(v => Math.log1p(v))
  const yM = Matrix.columnVector(yLog)
  
  // onehot
  const { features, featureNames } = oneHotEncode(freelancers);
  const X = new Matrix(features);
  
  const mu = X.mean('column');
  const sigma = X.standardDeviation('column');
  const sigma_safer = sigma.map(v => v === 0 ? 1 : v)  // avoid divide by zero in the normalizing
  // z-score normalize
  const Xs = X.subRowVector(mu).divRowVector(sigma_safer);

  // bias
  const n = X.rows
  const d = X.columns
  console.log(n, d)
  
  // the library does not have concat so we do this instead
  const Xb = Matrix.ones(n, d+1)
  Xb.setSubMatrix(Xs, 0, 1)
  // console.log(Xb)
  const beta = solve(Xb, yM)
  const coefficients = beta.to1DArray().slice(1)
  // console.log(featureNames.length, coefficients.length);
  // console.log(Xb.size)
  
  const impacts: VariableImpact[] = []
  for (let i = 0; i < featureNames.length; i++) {
    const name = featureNames[i]
    if (!name.startsWith("country_")) {
      impacts.push({
        name,
        impact: Math.abs(coefficients[i]),
        correlation: coefficients[i]
      })
    }
  }

  let countryImpact = 0
  let countrySignedImpact = 0

  for (let i = 0; i < featureNames.length; i++) {
    if (featureNames[i].startsWith('country_')) {
      countryImpact += Math.abs(coefficients[i])
      countrySignedImpact += coefficients[i]
    }
  }

  if (countryImpact > 0) {
    impacts.push({
      name: 'country',
      impact: countryImpact,
      correlation: countrySignedImpact
    })
  }

  // Sort by impact and return top 3
  return impacts
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 3);
}

/**
 * Find top 5 highest-earning freelancers
 */
export function findTopFreelancers(freelancers: Freelancer[]): Array<{ name: string, ciphertext: string, earnings: number }> {
  return freelancers
    .map(f => ({
      name: f.shortName,
      ciphertext: f.ciphertext,
      earnings: f.combinedTotalEarnings || 0,
    }))
    .sort((a, b) => b.earnings - a.earnings)
    .slice(0, 5);
}

/**
 * Save insights to JSON file
 */
export async function saveInsights(
  topVariables: VariableImpact[],
  topFreelancers: Array<{ name: string, ciphertext: string, earnings: number }>,
  totalRecords: number
): Promise<void> {
  const insights = {
    timestamp: new Date().toISOString(),
    totalRecordsAnalyzed: totalRecords,
    top3Features: topVariables.map(v => ({
      name: v.name,
      impact: v.impact,
      correlation: v.correlation,
    })),
    top5Freelancers: topFreelancers.map(f => ({
      name: f.name,
      ciphertext: f.ciphertext,
      earnings: f.earnings,
    })),
  };
  
  fs.writeFileSync('insights.json', JSON.stringify(insights, null, 2));
}