import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadMedia } from '../middleware/uploadMiddleware.js';
import { s3Service } from '../adapters/s3Service.js';
import { productService } from '../services/productService.js';
import { inspectionService } from '../services/inspectionService.js';
import { passportService } from '../services/passportService.js';

export const productRouter = Router();

// Upload a product
productRouter.post('/upload', requireAuth, uploadMedia.array('media', 5), async (req, res, next) => {
  try {
    const { name, category, price, source } = req.body;
    
    // Upload media to S3
    const mediaUrls = [];
    if (req.files) {
      for (const file of req.files) {
        const key = await s3Service.upload(file.buffer, { originalname: file.originalname, mimetype: file.mimetype });
        mediaUrls.push(s3Service.getUrl(key));
      }
    }
    
    const product = await productService.submitProduct(req.user._id, {
      name, category, price: Number(price), source, media: mediaUrls
    });
    
    res.status(201).json({ success: true, product });
  } catch (err) { next(err); }
});

// Evaluate condition (AI Inspection)
productRouter.post('/:id/evaluate', requireAuth, async (req, res, next) => {
  try {
    const result = await inspectionService.performInspection(req.params.id);
    const passport = await passportService.generatePassport(req.params.id);
    
    res.status(200).json({ success: true, inspection: result.analysis, product: result.product, passport });
  } catch (err) { next(err); }
});
