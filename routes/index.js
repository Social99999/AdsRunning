var express = require('express');
var router = express.Router();
const authController = require('../controller/auth.controller');
const { 
  createUser, 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  login, 
  logout, 
  createadsss,
  getLoginHistoryById
} = require('../controller/user.controller');
const {
  createAd,
  getAllAds,
  getAdById,
  updateAd,
  deleteAd
} = require('../controller/ads.controller');
/* GET home page. */

// POST /auth/login
router.post('/login', authController.login);

// POST /auth/register
router.post('/register', authController.register);


router.post('/registerUser', createUser); // Register a new user
router.post('/loginUser', login); // Login a user
router.post('/logoutUser', logout); // Logout a user

router.get('/', getAllUsers); // Get all usersed route)
// router.get('/:id', getUserById); // Get a user by IDed route)
router.put('/:id', updateUser); // Update a user by IDed route)
router.delete('/:id', deleteUser); // Delete a user by ID (protected route)

router.post('/createadsss', createadsss);

router.post('/ads', createAd);

// Get all ads - Public route
router.get('/ads', getAllAds);

// Get single ad by ID - Public route
router.get('/ads/:id',  getAdById);

// Update ad - Protected route
router.put('/ads/:id', updateAd);

// Delete ad - Protected route
router.delete('/ads/:id', deleteAd);


router.get('/login-history/:id', getLoginHistoryById);
module.exports = router;
