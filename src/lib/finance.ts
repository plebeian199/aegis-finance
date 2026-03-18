/**
 * Aegis Finance - Academic Finance Engine
 */

export interface Asset {
  id: string;
  name: string;
  category: string;
  current_balance: number;
}

export interface Liability {
  id: string;
  name: string;
  category: string;
  current_balance: number;
}

/**
 * 1. Calculate Total Net Worth
 */
export function calculateNetWorth(assets: Asset[], liabilities: Liability[]): number {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.current_balance, 0);
  const totalLiabilities = liabilities.reduce((sum, liab) => sum + liab.current_balance, 0);
  return totalAssets - totalLiabilities;
}

/**
 * 2. Household Liquidity Ratio (Emergency Runway)
 * Liquid Assets / Monthly Burn Rate
 */
export function calculateEmergencyRunway(assets: Asset[], monthlyBurnRate: number): number {
  if (monthlyBurnRate <= 0) return 0;
  
  const liquidAssets = assets
    .filter(a => a.category === 'Tier 1: Sangat Likuid')
    .reduce((sum, a) => sum + a.current_balance, 0);
    
  return liquidAssets / monthlyBurnRate;
}

/**
 * 3. Asset Allocation (Modern Portfolio Theory basics)
 */
export function calculateAssetAllocation(assets: Asset[]): Record<string, number> {
  const totalAssets = assets.reduce((sum, asset) => sum + asset.current_balance, 0);
  if (totalAssets === 0) return {};

  const allocation: Record<string, number> = {};
  
  assets.forEach(asset => {
    // Simplified bucket logic for the Donut Chart
    let bucket = "Lainnya";
    if (asset.category.includes('Sangat Likuid')) bucket = "Kas & Setara Kas";
    if (asset.category.includes('Reksadana') || asset.category.includes('Saham') || asset.category.includes('SBN')) bucket = "Sekuritas Pasar";
    if (asset.category.includes('Properti') || asset.category.includes('Emas')) bucket = "Aset Ilikuid/Fisik";
    if (asset.category.includes('BPJS')) bucket = "Dana Pensiun";
    
    if (!allocation[bucket]) allocation[bucket] = 0;
    allocation[bucket] += asset.current_balance;
  });

  // Convert to percentages
  for (const key in allocation) {
    allocation[key] = (allocation[key] / totalAssets) * 100;
  }

  return allocation;
}

/**
 * 4. Risk-Adjusted Return (Sharpe Ratio) Stub
 * Sharpe = (Rp - Rf) / Op
 */
export function calculateSharpeRatio(portfolioReturn: number, riskFreeRate: number, portfolioStandardDev: number): number {
  if (portfolioStandardDev === 0) return 0;
  return (portfolioReturn - riskFreeRate) / portfolioStandardDev;
}

/**
 * 5. Compound Annual Growth Rate (CAGR)
 * CAGR = ((End Value / Begin Value) ^ (1 / Years)) - 1
 */
export function calculateCAGR(beginValue: number, endValue: number, years: number): number {
  if (beginValue <= 0 || years <= 0) return 0;
  return Math.pow((endValue / beginValue), (1 / years)) - 1;
}
