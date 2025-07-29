import cron from 'node-cron';
import { ApiService } from './api-services';

export class CronService {
  private static jobs: Map<string, cron.ScheduledTask> = new Map();

  static start() {
    console.log('🕒 Starting AMD data CRON jobs...');

    // Update stock data every 30 minutes during market hours (9:30 AM - 4:00 PM ET, Mon-Fri)
    const stockDataJob = cron.schedule('*/30 9-16 * * 1-5', async () => {
      console.log('🔄 Updating stock data and technical indicators...');
      try {
        await Promise.all([
          ApiService.fetchStockData(),
          ApiService.fetchFundamentalData()
        ]);
      } catch (error) {
        console.error('Stock data update error:', error);
      }
    }, { scheduled: false, timezone: 'America/New_York' });

    // Update insider trades daily at 6 AM ET
    const insiderTradesJob = cron.schedule('0 6 * * 1-5', async () => {
      console.log('🔄 Updating insider trades...');
      try {
        await ApiService.fetchInsiderTrades();
      } catch (error) {
        console.error('Insider trades update error:', error);
      }
    }, { scheduled: false, timezone: 'America/New_York' });



    // Update AMD news every hour
    const newsJob = cron.schedule('0 * * * *', async () => {
      console.log('🔄 Updating AMD news...');
      try {
        await ApiService.fetchAmdNews();
      } catch (error) {
        console.error('News update error:', error);
      }
    }, { scheduled: false });

    // Generate AI predictions every hour during market hours
    const predictionJob = cron.schedule('0 9-16 * * 1-5', async () => {
      console.log('🔄 Generating AI predictions...');
      try {
        await ApiService.generateAiPrediction();
      } catch (error) {
        console.error('AI prediction error:', error);
      }
    }, { scheduled: false, timezone: 'America/New_York' });

    // Check for market anomalies every 15 minutes during market hours
    const anomalyJob = cron.schedule('*/15 9-16 * * 1-5', async () => {
      console.log('🔄 Detecting market anomalies...');
      try {
        await ApiService.detectMarketAnomalies();
      } catch (error) {
        console.error('Anomaly detection error:', error);
      }
    }, { scheduled: false, timezone: 'America/New_York' });

    // Store jobs for management
    this.jobs.set('stockData', stockDataJob);
    this.jobs.set('insiderTrades', insiderTradesJob);

    this.jobs.set('news', newsJob);
    this.jobs.set('predictions', predictionJob);
    this.jobs.set('anomalies', anomalyJob);

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
      status[name] = job.running;
    });
    return status;
  }

  // Manual refresh trigger
  static async triggerRefresh() {
    console.log('🔄 Manual data refresh triggered...');
    await ApiService.refreshAllData();
  }
}