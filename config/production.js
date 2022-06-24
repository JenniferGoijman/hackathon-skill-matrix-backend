module.exports = {
  server: {
    host: '0.0.0.0',
    port: process.env.PORT,
  },
  pg: {
    connection: {
      ssl: true,
    },
  },
};
