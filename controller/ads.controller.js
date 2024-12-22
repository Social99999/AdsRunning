const Ads = require('../models/ads.models');

const adsController = {
    // Create new ad
    createAd: async (req, res) => {
        try {
            const { companyName, contactNumber, image } = req.body;
            
            const newAd = new Ads({
                companyName,
                contactNumber,
                image
            });

            await newAd.save();
            
            res.status(201).json({
                message: "Ad created successfully",
                ad: newAd
            });
        } catch (error) {
            res.status(500).json({
                message: "Error creating ad",
                error: error.message
            });
        }
    },

    // Get all ads
    getAllAds: async (req, res) => {
        try {
            const ads = await Ads.find().sort({ createdAt: -1 });
            res.status(200).json({
                ads
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching ads",
                error: error.message
            });
        }
    },

    // Get single ad by ID
    getAdById: async (req, res) => {
        try {
            const ad = await Ads.findById(req.params.id);
            if (!ad) {
                return res.status(404).json({
                    message: "Ad not found"
                });
            }
            res.status(200).json({
                ad
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching ad",
                error: error.message
            });
        }
    },

    // Update ad
    updateAd: async (req, res) => {
        try {
            const { companyName, contactNumber, image } = req.body;
            
            const updatedAd = await Ads.findByIdAndUpdate(
                req.params.id,
                {
                    companyName,
                    contactNumber,
                    image
                },
                { new: true }
            );

            if (!updatedAd) {
                return res.status(404).json({
                    message: "Ad not found"
                });
            }

            res.status(200).json({
                message: "Ad updated successfully",
                ad: updatedAd
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating ad",
                error: error.message
            });
        }
    },

    // Delete ad
    deleteAd: async (req, res) => {
        try {
            const deletedAd = await Ads.findByIdAndDelete(req.params.id);
            
            if (!deletedAd) {
                return res.status(404).json({
                    message: "Ad not found"
                });
            }

            res.status(200).json({
                message: "Ad deleted successfully"
            });
        } catch (error) {
            res.status(500).json({
                message: "Error deleting ad",
                error: error.message
            });
        }
    }
};

module.exports = adsController; 