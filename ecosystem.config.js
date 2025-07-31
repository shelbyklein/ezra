// PM2 Configuration for Production Deployment
module.exports = {
  apps: [{
    name: 'ezra-backend',
    script: './backend/dist/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 6001
    },
    error_file: '/var/log/ezra/error.log',
    out_file: '/var/log/ezra/out.log',
    log_file: '/var/log/ezra/combined.log',
    time: true,
    watch: false,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};