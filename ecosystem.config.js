// PM2 Ecosystem Configuration for High-Traffic Production Node.js Clustering
// Provides zero-downtime reloads, automatic worker restarts on memory leak, and multi-core CPU utilization

module.exports = {
  apps: [
    {
      name: 'royal-honey-ecom',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      exec_mode: 'cluster',
      instances: 'max', // Spawns 1 worker process per physical CPU core
      autorestart: true,
      watch: false,
      max_memory_restart: '1G', // Gracefully recycle worker if memory exceeds 1GB
      listen_timeout: 10000,
      kill_timeout: 5000,
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
