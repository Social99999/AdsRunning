const Ads = require('../models/ads.models');

// Controller methods

// Create a new ad
exports.createAd = async (req, res) => {
    console.log("sddf");
    try {
        const { companyName, contactNumber, category, image } = req.body;

        const newAd = new Ads({
            companyName,
            contactNumber,
            category,
            image
        });

        await newAd.save();
        res.status(201).json({ 
            success: true, 
            message: 'Ad created successfully', 
            data: newAd 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error creating ad', 
            error: error.message 
        });
    }
};

// Get all ads
exports.getAllAds = async (req, res) => {
    try {
        const ads = await Ads.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: ads });
    } catch (error) {
        console.error("Error fetching ads:", error); // Log the exact error
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching ads', 
            error: error.message 
        });
    }
};


// Get a single ad by ID
exports.getAdById = async (req, res) => {
    try {
        const ad = await Ads.find();
        if (!ad) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ad not found' 
            });
        }
        res.status(200).json({ success: true, data: ad });
    } catch (error) {
        console.error("Error fetching ads:", error); // Log the exact error

        res.status(500).json({ 
            success: false, 
            message: 'Error fetching ad', 
            error: error.message 
        });
    }
};

// Update an ad by ID
exports.updateAd = async (req, res) => {
    try {
        const { companyName, contactNumber, category, image } = req.body;

        const updatedAd = await Ads.findByIdAndUpdate(
            req.params.id,
            { companyName, contactNumber, category, image },
            { new: true, runValidators: true }
        );

        if (!updatedAd) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ad not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: 'Ad updated successfully', 
            data: updatedAd 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: 'Error updating ad', 
            error: error.message 
        });
    }
};

// Delete an ad by ID
exports.deleteAd = async (req, res) => {
    try {
        const deletedAd = await Ads.findByIdAndDelete(req.params.id);

        if (!deletedAd) {
            return res.status(404).json({ 
                success: false, 
                message: 'Ad not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: 'Ad deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting ad', 
            error: error.message 
        });
    }
};
