import { AmazonProduct } from '../models/AmazonProduct.js';
import { RelifeProduct } from '../models/RelifeProduct.js';
import { Order } from '../models/Order.js';

export const getAmazonProducts = async (req, res) => {
  try {
    const products = await AmazonProduct.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAmazonProductById = async (req, res) => {
  try {
    let product = await AmazonProduct.findOne({ originalId: req.params.id });
    if (!product) {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
         console.log("Fallback finding by ID:", req.params.id);
         product = await AmazonProduct.findOne({ _id: req.params.id });
         console.log("Fallback result:", product ? "FOUND" : "NOT FOUND");
      }
    }
    if (!product) {
       console.log("Returning 404 for:", req.params.id);
       return res.status(404).json({ message: 'Amazon Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelifeProducts = async (req, res) => {
  try {
    const isUsed = req.query.type === 'used' ? true : req.query.type === 'openbox' ? false : undefined;
    const filter = { status: 'ACTIVE' };
    if (isUsed !== undefined) {
      filter.isUsed = isUsed;
    }
    const products = await RelifeProduct.find(filter);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRelifeProductById = async (req, res) => {
  try {
    // Attempt originalId first (e.g. 'u1', 'o1') then fallback to MongoDB _id if needed
    let product = await RelifeProduct.findOne({ originalId: req.params.id });
    if (!product) {
      if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
         product = await RelifeProduct.findById(req.params.id);
      }
    }
    if (!product) return res.status(404).json({ message: 'ReLife Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getRecommendationsForAsin = async (req, res) => {
  try {
    const { asin } = req.params;
    
    // Find all relife products that correspond to this Amazon ASIN (originalId)
    const alternatives = await RelifeProduct.find({ originalAsin: asin, status: 'ACTIVE' });
    
    if (!alternatives || alternatives.length === 0) {
      return res.status(404).json({ message: 'No recommendations found' });
    }

    // Condition-First Logic: Find the absolute best unit across all matching RelifeProducts
    let bestProduct = null;
    let bestUnit = null;
    let highestCondition = -1;

    alternatives.forEach(product => {
      if (product.availableUnits && product.availableUnits.length > 0) {
        product.availableUnits.forEach(unit => {
          if (unit.conditionScore > highestCondition) {
            highestCondition = unit.conditionScore;
            bestUnit = unit;
            bestProduct = product;
          }
        });
      }
    });

    if (!bestProduct || !bestUnit) {
      return res.status(404).json({ message: 'No available units found' });
    }

    res.json({
      product: bestProduct,
      unit: bestUnit
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const searchAllProducts = async (req, res) => {
  try {
    const { q, mode } = req.query;
    if (!q) return res.json({ amazon: [], relife: [] });

    const regex = new RegExp(q, 'i');
    const result = { amazon: [], relife: [] };

    if (!mode || mode === 'amazon') {
      result.amazon = await AmazonProduct.find({ name: regex });
    }
    
    if (!mode || mode === 'relife') {
      result.relife = await RelifeProduct.find({ name: regex, status: 'ACTIVE' });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



export const getMyRelifeListings = async (req, res) => {
  try {
    const listings = await RelifeProduct.find({ listingOwnerId: req.user._id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    console.error("My listings error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteRelifeListing = async (req, res) => {
  try {
    const listingId = req.params.id;
    const listing = await RelifeProduct.findById(listingId);
    
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.listingOwnerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this listing' });
    }

    // Delete the listing
    await RelifeProduct.findByIdAndDelete(listingId);

    // If it was a resell item, revert the order item's resaleStatus
    if (listing.sourceOrderId && listing.sourceItemId) {
      const sourceOrder = await Order.findById(listing.sourceOrderId);
      if (sourceOrder) {
        const sourceItem = sourceOrder.items.id(listing.sourceItemId) || sourceOrder.items.find(i => i._id.toString() === listing.sourceItemId.toString());
        if (sourceItem) {
          sourceItem.resaleStatus = 'not_listed';
          sourceItem.resaleListingId = null;
          await sourceOrder.save();
        }
      }
    }

    res.json({ success: true, message: 'Listing deleted successfully' });
  } catch (error) {
    console.error("Delete listing error:", error);
    res.status(500).json({ message: error.message });
  }
};
