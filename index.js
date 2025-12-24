const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send("Test Successful - Server is alive!");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log(`Listening on ${port}`);
});
