module.exports = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 5500,
  },
  pg: {
    connection: {
      ssl: true,
    },
  },
};
