const express = require('express');
const { fetchGears } = require('../dataFetcher');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const gears = await fetchGears();
      res.json(gears);
    } catch (error) {
      res.status(500).send('Erreur serveur');
    }
  });

module.exports = router;