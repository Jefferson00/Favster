const withPWA = require("next-pwa");

module.exports = withPWA([
  {
    images: {
      domains: ['storage.googleapis.com', 'static.rhap.com']
    }
  },
  {
    pwa: {
      dest: "public",
      register: true,
      skipWaiting: true,
      sw: '/sw.js'
    },
  }
]);