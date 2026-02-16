/**
 * Performance Monitoring Utility
 * Tracks app launch time, screen load times, and frame rates
 */

import { logger } from '@lib/services/logger';

interface PerformanceMetrics {
  appLaunchTime?: number; // ms from start to first screen render
  screenLoadTimes: Record<string, number>; // screen name -> load time in ms
  averageFrameRate?: number; // FPS
  memoryUsage?: number; // MB
  bundleSize?: number; // KB
  lastUpdate: Date;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    screenLoadTimes: {},
    lastUpdate: new Date(),
  };

  private startTimes: Record<string, number> = {};

  /**
   * Mark the start of app initialization
   */
  startAppLaunch() {
    this.startTimes['app_launch'] = Date.now();
  }

  /**
   * Mark the end of app initialization
   */
  endAppLaunch() {
    if (this.startTimes['app_launch']) {
      const launchTime = Date.now() - this.startTimes['app_launch'];
      this.metrics.appLaunchTime = launchTime;

      if (launchTime > 3000) {
        logger.warn(`⚠️ App launch time slow: ${launchTime}ms (target: <3000ms)`);
      } else {
        logger.info(`✅ App launch time: ${launchTime}ms`);
      }

      delete this.startTimes['app_launch'];
    }
  }

  /**
   * Track screen load time
   */
  startScreenLoad(screenName: string) {
    this.startTimes[`screen_${screenName}`] = Date.now();
  }

  endScreenLoad(screenName: string) {
    const key = `screen_${screenName}`;
    if (this.startTimes[key]) {
      const loadTime = Date.now() - this.startTimes[key];
      this.metrics.screenLoadTimes[screenName] = loadTime;

      const threshold = 1000; // 1s threshold
      if (loadTime > threshold) {
        logger.warn(
          `⚠️ Screen load slow [${screenName}]: ${loadTime}ms (target: <${threshold}ms)`
        );
      }

      delete this.startTimes[key];
    }
  }

  /**
   * Get all metrics
   */
  getMetrics(): PerformanceMetrics {
    return {
      ...this.metrics,
      lastUpdate: new Date(),
    };
  }

  /**
   * Log metrics summary
   */
  logMetricsSummary() {
    const metrics = this.getMetrics();

    logger.info('📊 Performance Metrics Summary:');
    if (metrics.appLaunchTime) {
      logger.info(`   App Launch: ${metrics.appLaunchTime}ms`);
    }

    const screenLoads = Object.entries(metrics.screenLoadTimes);
    if (screenLoads.length > 0) {
      logger.info('   Screen Load Times:');
      screenLoads.forEach(([screen, time]) => {
        logger.info(`     - ${screen}: ${time}ms`);
      });
    }
  }

  /**
   * Reset metrics
   */
  reset() {
    this.metrics.screenLoadTimes = {};
    this.startTimes = {};
  }
}

export const performanceMonitor = new PerformanceMonitor();
