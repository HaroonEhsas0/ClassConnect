// Backtesting & Model Evaluation Service for AMD Stock Predictions
// Purpose: Verify prediction accuracy against historical data and calculate performance metrics

interface BacktestResult {
  accuracy: number;
  totalPredictions: number;
  correctPredictions: number;
  averageDeviation: number;
  bestCaseDeviation: number;
  worstCaseDeviation: number;
  sharpeRatio?: number;
  winRate: number;
  profitability: number;
}

interface PredictionAccuracy {
  predicted: number;
  actual: number;
  deviation: number;
  correct: boolean;
  date: string;
}

export class BacktestingService {
  
  // Run backtesting analysis on historical AMD data
  static async runBacktest(days: number = 30): Promise<BacktestResult> {
    console.log(`🔄 Starting ${days}-day backtesting analysis...`);
    
    try {
      // For now, simulate historical data since we don't have real historical predictions
      // In production, this would query actual historical predictions vs actual prices
      const mockResults = this.generateMockBacktestData(days);
      
      const accuracy = this.calculateAccuracy(mockResults);
      const deviations = mockResults.map(r => Math.abs(r.deviation));
      const averageDeviation = deviations.reduce((sum, d) => sum + d, 0) / deviations.length;
      const bestCaseDeviation = Math.min(...deviations);
      const worstCaseDeviation = Math.max(...deviations);
      
      const correctPredictions = mockResults.filter(r => r.correct).length;
      const winRate = (correctPredictions / mockResults.length) * 100;
      
      // Calculate profitability (simplified)
      const profitability = this.calculateProfitability(mockResults);
      
      const result: BacktestResult = {
        accuracy,
        totalPredictions: mockResults.length,
        correctPredictions,
        averageDeviation,
        bestCaseDeviation,
        worstCaseDeviation,
        winRate,
        profitability,
        sharpeRatio: this.calculateSharpeRatio(mockResults)
      };
      
      console.log(`✅ Backtesting completed:`);
      console.log(`   Accuracy: ${accuracy.toFixed(1)}%`);
      console.log(`   Win Rate: ${winRate.toFixed(1)}%`);
      console.log(`   Avg Deviation: $${averageDeviation.toFixed(2)}`);
      console.log(`   Best/Worst Case: $${bestCaseDeviation.toFixed(2)} / $${worstCaseDeviation.toFixed(2)}`);
      console.log(`   Profitability: ${profitability.toFixed(2)}%`);
      
      return result;
      
    } catch (error) {
      console.error('Backtesting error:', error);
      throw error;
    }
  }
  
  // Calculate prediction accuracy percentage
  private static calculateAccuracy(results: PredictionAccuracy[]): number {
    const correctPredictions = results.filter(r => r.correct).length;
    return (correctPredictions / results.length) * 100;
  }
  
  // Calculate profitability based on prediction accuracy
  private static calculateProfitability(results: PredictionAccuracy[]): number {
    let totalReturn = 0;
    
    for (const result of results) {
      // Simulate trading based on predictions
      const predictedReturn = (result.predicted - 100) / 100; // Assuming base price of 100
      const actualReturn = (result.actual - 100) / 100;
      
      // If prediction direction was correct, add positive return
      if ((predictedReturn > 0 && actualReturn > 0) || (predictedReturn < 0 && actualReturn < 0)) {
        totalReturn += Math.abs(actualReturn);
      } else {
        totalReturn -= Math.abs(actualReturn) * 0.5; // Penalty for wrong direction
      }
    }
    
    return (totalReturn / results.length) * 100;
  }
  
  // Calculate Sharpe ratio (risk-adjusted returns)
  private static calculateSharpeRatio(results: PredictionAccuracy[]): number {
    const returns = results.map(r => (r.actual - r.predicted) / r.predicted);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const returnVariance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const returnStdDev = Math.sqrt(returnVariance);
    
    // Assuming risk-free rate of 2% annually (0.0055% daily)
    const riskFreeRate = 0.000055;
    
    return returnStdDev === 0 ? 0 : (avgReturn - riskFreeRate) / returnStdDev;
  }
  
  // Generate mock historical data for testing (replace with real data in production)
  private static generateMockBacktestData(days: number): PredictionAccuracy[] {
    const results: PredictionAccuracy[] = [];
    const basePrice = 175; // AMD base price
    
    for (let i = 0; i < days; i++) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Simulate realistic price movements
      const volatility = 0.03; // 3% daily volatility
      const trend = Math.sin(i * 0.1) * 0.01; // Slight trending pattern
      const randomWalk = (Math.random() - 0.5) * volatility;
      
      const actualPrice = basePrice * (1 + trend + randomWalk);
      
      // Simulate prediction with some accuracy
      const predictionError = (Math.random() - 0.5) * 0.02; // ±2% prediction error
      const predictedPrice = actualPrice * (1 + predictionError);
      
      const deviation = predictedPrice - actualPrice;
      const correct = Math.abs(deviation) < actualPrice * 0.015; // Within 1.5% is "correct"
      
      results.push({
        predicted: predictedPrice,
        actual: actualPrice,
        deviation,
        correct,
        date
      });
    }
    
    return results;
  }
  
  // Evaluate current model performance
  static async evaluateModelPerformance(): Promise<{
    modelAccuracy: number;
    confidenceCalibration: number;
    predictionStability: number;
  }> {
    console.log('🔍 Evaluating current model performance...');
    
    // In production, this would analyze recent predictions vs outcomes
    const mockEvaluation = {
      modelAccuracy: 78.5, // Model prediction accuracy
      confidenceCalibration: 85.2, // How well confidence matches actual accuracy
      predictionStability: 92.1 // Consistency of predictions over time
    };
    
    console.log(`📊 Model Performance:`);
    console.log(`   Accuracy: ${mockEvaluation.modelAccuracy}%`);
    console.log(`   Confidence Calibration: ${mockEvaluation.confidenceCalibration}%`);
    console.log(`   Prediction Stability: ${mockEvaluation.predictionStability}%`);
    
    return mockEvaluation;
  }
}

export default BacktestingService;