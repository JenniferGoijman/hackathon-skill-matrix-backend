module.exports = {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: process.env.PORT || 8080,
  },
  pg: {
    connection: {
      ssl: true,
    },
  },
};
