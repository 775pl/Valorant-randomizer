const express = require('express');

const emojis = require('./emojis');
const agents = require('./agents');
const gears = require('./gears');
const weapons = require('./weapons');

const router = express.Router();

router.get('/', (req, res) => {
    res.json({
      message: 'API - 👋🌎🌍🌏',
    });
  });

router.use('/emojis', emojis);
router.use('/agents', agents);
router.use('/gears', gears);
router.use('/weapons', weapons);


module.exports = router;