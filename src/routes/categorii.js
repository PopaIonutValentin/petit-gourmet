const express = require('express');
const categorii = require('../models/categorii');

const router = express.Router();

router.get('/', (req, res) =>
{
    res.json({categorii: categorii.listeazaCategorii() });
});

module.exports = router;