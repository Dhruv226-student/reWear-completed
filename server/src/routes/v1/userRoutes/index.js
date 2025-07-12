const express = require('express');
const userRoutes = require('./user.route');
const swapRoutes = require('./swap.route')
const itemRoutes = require('./item.route');

const router = express.Router();

router.use('/', userRoutes); // User routes.
router.use('/swap',swapRoutes)
router.use('/item', itemRoutes); // Item routes.

module.exports = router;
