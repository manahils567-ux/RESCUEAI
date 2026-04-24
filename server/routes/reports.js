const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ status: "REPORTS ROUTE WORKING" });
});

module.exports = router;

console.log("REPORTS ROUTE LOADED");