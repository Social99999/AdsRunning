const User = require('../models/user.models');
const jwt = require('jsonwebtoken');
const Ads = require('../models/ads.models');
const UserLoginHistory = require('../models/userLoginHistory.model');

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
};

// Controller methods

// Create a new user
exports.createUser = async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).json({ success: true, message: 'User created successfully', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        
        // Map through users and add active time for each
        const usersWithActiveTime = users.map(user => {
            const activeTime = user.calculateTotalActiveTime();
            return {
                ...user.toObject(),
                activeTime: {
                    totalTime: activeTime.formatted,
                    hours: activeTime.hours,
                    minutes: activeTime.minutes
                }
            };
        });

        res.status(200).json({ success: true, data: usersWithActiveTime });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users', error: error.message });
    }
};

// Get a single user by ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Calculate active time using the instance method
        const activeTime = user.calculateTotalActiveTime();

        // Create response object with user data and active time
        const responseData = {
            ...user.toObject(),
            activeTime: {
                totalTime: activeTime.formatted,
                hours: activeTime.hours,
                minutes: activeTime.minutes
            }
        };

        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
    }
};

// Update a user by ID
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User updated successfully', data: user });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error updating user', error: error.message });
    }
};

// Delete a user by ID
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting user', error: error.message });
    }
};

// User login
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        await user.updateLoginTime();
        const token = generateToken(user);
        
        // Get Socket.IO instance
        const io = req.app.get('io');
        if (io) {
            // Broadcast user login status if needed
            io.emit('userStatus', { userId: user._id, status: 'online' });
        }

        // After successful login, create login history entry
        const loginHistory = new UserLoginHistory({
            userId: user._id,
            loginTime: new Date()
        });
        await loginHistory.save();

        res.status(200).json({ 
            success: true, 
            message: 'Login successful', 
            token, 
            user 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error during login', error: error.message });
    }
};

// User logout
exports.logout = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.updateLogoutTime();

        // Update the latest login history entry for this user
        await UserLoginHistory.findOneAndUpdate(
            { 
                userId: req.user._id,
                logoutTime: null 
            },
            { 
                logoutTime: new Date() 
            },
            { 
                sort: { loginTime: -1 } 
            }
        );

        res.status(200).json({ success: true, message: 'Logout successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error during logout', error: error.message });
    }
};

// Add this new function to handle socket-based logouts
exports.handleSocketLogout = async (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        console.log(decoded);
        
        if (user) {
            await user.updateLogoutTime();
            console.log(`User ${user._id} logged out via socket disconnect`);
        }
        
        // Update the latest login history entry for this user
        await UserLoginHistory.findOneAndUpdate(
            { 
                userId: decoded.id,
                logoutTime: null 
                
            },
            { 
                logoutTime: new Date() 
            },
            { 
                sort: { loginTime: -1 } 
            }
        );
    } catch (error) {
        console.error('Error updating login history on socket disconnect:', error);
    }
};

// Add this new controller method
exports.getActiveTime = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const activeTime = user.calculateTotalActiveTime();
        res.status(200).json({ 
            success: true, 
            data: {
                totalTime: activeTime.formatted,
                hours: activeTime.hours,
                minutes: activeTime.minutes
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error calculating active time', 
            error: error.message 
        });
    }
};

exports.createadsss = async (req, res) => {
    try {
        const ads = Ads.create(req.body);
        res.status(201).json({ success: true, message: 'Ads created successfully', data: ads });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Error creating ads', error: error.message });
    }
}

// Add new function to get login history
exports.getLoginHistoryById = async (req, res) => {
    try {
        const loginHistory = await UserLoginHistory.find({ userId: req.params.id })
            .sort({ loginTime: -1 })
            .populate('userId', 'username email contact');

        // Map through the login history and add formatted duration for each entry
        const historyWithDuration = loginHistory.map(entry => {
            const duration = entry.calculateTotalActiveTime();
            return {
                ...entry.toObject(),
                duration: {
                    totalTime: duration.formatted,
                    hours: duration.hours,
                    minutes: duration.minutes
                }
            };
        });

        res.status(200).json({
            success: true,
            data: historyWithDuration
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching login history',
            error: error.message
        });
    }
};