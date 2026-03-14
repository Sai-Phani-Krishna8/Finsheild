'use strict';

const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`FinShield PAN Fraud Detection server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
