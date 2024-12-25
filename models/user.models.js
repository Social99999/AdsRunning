const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        // unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false // Don't return password by default in queries
    },
    contact: {
        type: String,
        required: [true, 'Contact number is required'],
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit contact number']
    },
    address: {
        street: {
            type: String,
            required: [true, 'Street address is required'],
            trim: true
        },
        city: {
            type: String,
            required: [true, 'City is required'],
            trim: true
        },
        state: {
            type: String,
            required: [true, 'State is required'],
            trim: true
        },
        pincode: {
            type: String,
            required: [true, 'Pincode is required'],
            match: [/^[0-9]{6}$/, 'Please enter a valid 6-digit pincode']
        }
    },
    loginTime: {
        type: Date,
        default: null
    },
    logoutTime: {
        type: Date,
        default: null
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    countTotalActiveTime: {
        type: String,
        default: 0
    }
});

// Update login time
userSchema.methods.updateLoginTime = function() {
    this.loginTime = new Date();
    this.lastActive = new Date();
    this.logoutTime = null;
    return this.save();
};

// Update logout time
userSchema.methods.updateLogoutTime = function() {
    this.logoutTime = new Date();
    this.lastActive = new Date();
    return this.save();
};

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to compare entered password with hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Update last active timestamp
userSchema.methods.updateLastActive = function() {
    this.lastActive = new Date();
    return this.save();
};

// Add this method after other schema methods
userSchema.methods.calculateTotalActiveTime = function() {
    let totalMinutes = 0;
    
    if (this.loginTime && this.logoutTime) {
        // Calculate duration between login and logout
        const duration = this.logoutTime - this.loginTime;
        totalMinutes = Math.floor(duration / (1000 * 60)); // Convert milliseconds to minutes
    }
    
    // Format the duration
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    return {
        hours,
        minutes,
        formatted: `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`
    };
};

const User = mongoose.model('User', userSchema);

module.exports = User;
