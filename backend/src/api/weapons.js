const express = require('express');
const { fetchWeapons } = require('../dataFetcher');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const weapons = await fetchWeapons();
      res.json(weapons);
    } catch (error) {
      res.status(500).send('Erreur serveur');
    }
  });

module.exports = router;