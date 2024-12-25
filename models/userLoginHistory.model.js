const mongoose = require('mongoose');

const userLoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  loginTime: {
    type: Date,
    required: true
  },
  logoutTime: {
    type: Date,
    default: null
  },
  totalHours: {
    type: Number,
    default: 0
  },
  totalMinutes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Add a pre-save middleware to calculate hours and minutes
userLoginHistorySchema.pre('save', function(next) {
  if (this.loginTime && this.logoutTime) {
    const timeDiff = this.logoutTime - this.loginTime;
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    this.totalHours = hours;
    this.totalMinutes = minutes;
  }
  next();
});

userLoginHistorySchema.methods.calculateTotalActiveTime = function() {
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


module.exports = mongoose.model('UserLoginHistory', userLoginHistorySchema); 