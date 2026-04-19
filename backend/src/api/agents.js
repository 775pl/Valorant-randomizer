const express = require('express');
const { fetchAgents } = require('../dataFetcher');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
      const agents = await fetchAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).send('Erreur serveur');
    }
  });

module.exports = router;