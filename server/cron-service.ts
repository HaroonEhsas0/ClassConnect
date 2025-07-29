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
      console.log('🔄 Detecting market anomalies...');
      try {
        await ApiService.detectMarketAnomalies();
      } catch (error) {
        console.error('Anomaly detection error:', error);
      }
    }, { timezone: 'America/New_York' });

    // Add continuous real-time updates (every 2 minutes for immediate pricing)
    const realTimeJob = cron.schedule('*/2 * * * *', async () => {
      console.log('🔄 Real-time data update...');
      try {
        await ApiService.fetchRealTimeAmdData();
      } catch (error) {
        console.error('Real-time update error:', error);
      }
    });

    // Store jobs for management
    this.jobs.set('stockData', stockDataJob);
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