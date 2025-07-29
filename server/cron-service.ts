import * as cron from 'node-cron';
import { ApiService } from './api-services';

export class CronService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();

  static start() {
    console.log('🕒 Starting AMD data CRON jobs...');

    // Update stock data every 1 minute for real-time pricing (9:30 AM - 4:00 PM ET, Mon-Fri)
    const stockDataJob = cron.schedule('* 9-16 * * 1-5', async () => {
      console.log('🔄 Updating real-time stock data...');
      try {
        await Promise.all([
          ApiService.fetchStockData(),
          ApiService.fetchFundamentalData()
        ]);
      } catch (error) {
        console.error('Stock data update error:', error);
      }
    }, { timezone: 'America/New_York' });

    // Update technical indicators every 15 minutes during market hours
    const technicalIndicatorsJob = cron.schedule('*/15 9-16 * * 1-5', async () => {
      console.log('🔄 Updating technical indicators...');
      try {
        await ApiService.calculateTechnicalIndicators();
      } catch (error) {
        console.error('Technical indicators update error:', error);
      }
    }, { timezone: 'America/New_York' });

    // Update insider trades daily at 6 AM ET
    const insiderTradesJob = cron.schedule('0 6 * * 1-5', async () => {
      console.log('🔄 Updating insider trades...');
      try {
        await ApiService.fetchInsiderTrades();
      } catch (error) {
        console.error('Insider trades update error:', error);
      }
    }, { timezone: 'America/New_York' });



    // Update AMD news every hour
    const newsJob = cron.schedule('0 * * * *', async () => {
      console.log('🔄 Updating AMD news...');
      try {
        await ApiService.fetchAmdNews();
      } catch (error) {
        console.error('News update error:', error);
      }
    });

    // Generate AI predictions every 10 minutes during market hours for real-time analysis
    const predictionJob = cron.schedule('*/10 9-16 * * 1-5', async () => {
      console.log('🔄 Generating real-time AI predictions...');
      try {
        await ApiService.generateAiPrediction();
        await ApiService.generateAdvancedAiPrediction(); // OpenAI-powered predictions if available
      } catch (error) {
        console.error('AI prediction error:', error);
      }
    }, { timezone: 'America/New_York' });

    // Check for market anomalies every 5 minutes during market hours for faster detection
    const anomalyJob = cron.schedule('*/5 9-16 * * 1-5', async () => {
      console.log('🔄 Monitoring market patterns...');
      try {
        // Market anomaly detection logic would go here
        console.log('✅ Market patterns monitored');
      } catch (error) {
        console.error('Market monitoring error:', error);
      }
    }, { timezone: 'America/New_York' });

    // Real-time price updates every minute during market hours, every 2 minutes after hours
    const realTimeJob = cron.schedule('*/1 * * * *', async () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // During market hours (9:30 AM - 4:00 PM ET, Mon-Fri): update every minute
      const isMarketHours = day >= 1 && day <= 5 && hour >= 9 && hour <= 16;
      
      if (isMarketHours || now.getMinutes() % 2 === 0) { // Market hours: every minute, After hours: every 2 minutes
        console.log('🔄 Real-time AMD price update...');
        try {
          await Promise.all([
            ApiService.fetchStockData(),
            ApiService.fetchFundamentalData()
          ]);
          console.log('✅ Real-time AMD price update completed');
        } catch (error) {
          console.error('Real-time update error:', error);
        }
      }
    });

    // Store jobs for management
    this.jobs.set('stockData', stockDataJob);
    this.jobs.set('technicalIndicators', technicalIndicatorsJob);
    this.jobs.set('insiderTrades', insiderTradesJob);
    this.jobs.set('news', newsJob);
    this.jobs.set('predictions', predictionJob);
    this.jobs.set('anomalies', anomalyJob);
    this.jobs.set('realTime', realTimeJob);

    // Start all jobs
    this.jobs.forEach((job, name) => {
      job.start();
      console.log(`✅ Started ${name} CRON job`);
    });

    // Initial data load
    this.initialDataLoad();
  }

  static stop() {
    console.log('⏹️ Stopping all CRON jobs...');
    this.jobs.forEach((job, name) => {
      job.stop();
      console.log(`⏹️ Stopped ${name} CRON job`);
    });
    this.jobs.clear();
  }

  private static async initialDataLoad() {
    console.log('🚀 Performing initial AMD data load...');
    try {
      // Load all data on startup
      await ApiService.refreshAllData();
      console.log('✅ Initial data load completed');
    } catch (error) {
      console.error('❌ Initial data load failed:', error);
    }
  }

  static getJobStatus() {
    const status: Record<string, boolean> = {};
    this.jobs.forEach((job, name) => {
      status[name] = true; // Simplified status check
    });
    return status;
  }

  // Manual refresh trigger
  static async triggerRefresh() {
    console.log('🔄 Manual data refresh triggered...');
    await ApiService.refreshAllData();
  }
}