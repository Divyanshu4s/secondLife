import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { connectDB, disconnectDB } from '../config/db.js';

// Models
import { AmazonProduct } from '../models/AmazonProduct.js';
import { RelifeProduct } from '../models/RelifeProduct.js';
import { User } from '../models/User.js';
import { Seller } from '../models/Seller.js';

// Raw data (copied structure from frontend mockData.js for the seed)
// Note: In a real app we'd import the JSON, but since it's ES module JS exporting constants, we'll embed the raw seed arrays.

const rawAmazonProducts = [
  {
    id: 'a-shoe-1',
    name: 'Nike Air Max 270 Men\'s Running Shoes',
    price: '12,995.00',
    oldPrice: '15,995.00',
    rating: 4.6,
    reviews: '8,245',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=600&auto=format&fit=crop',
    description: 'Boasting the first-ever Max Air unit created specifically for Nike Sportswear...',
    category: 'Shoes',
    brand: 'Nike'
  },
  {
    id: 'a1',
    name: 'Echo Dot (5th Gen, 2022 release) | Smart speaker with Alexa | Charcoal',
    price: '4,499.00',
    oldPrice: '5,499.00',
    rating: 4.8,
    reviews: '12,402',
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=600&auto=format&fit=crop',
    description: 'Our best-sounding Echo Dot yet...',
    category: 'Smart Home',
    brand: 'Amazon'
  },
  {
    id: 'a2',
    name: 'Kindle Paperwhite (8 GB) – Now with a 6.8" display',
    price: '10,999.00',
    oldPrice: '13,999.00',
    rating: 4.7,
    reviews: '34,210',
    image: 'https://images.unsplash.com/photo-1592496001020-d31bd830651f?q=80&w=600&auto=format&fit=crop',
    description: 'Purpose-built for reading with a 6.8" flush-front design...',
    category: 'E-Readers',
    brand: 'Amazon'
  },
  {
    id: 'a3',
    name: 'Apple MacBook Air Laptop M1 chip, 13.3-inch',
    price: '84,900.00',
    oldPrice: '99,900.00',
    rating: 4.7,
    reviews: '2,845',
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=600&auto=format&fit=crop',
    description: 'All-Day Battery Life – Go longer than ever with up to 18 hours of battery life...',
    category: 'Laptops',
    brand: 'Apple'
  },
  {
    id: 'a4',
    name: 'Sony WH-1000XM4 Noise Cancelling Wireless Headphones',
    price: '22,990.00',
    oldPrice: '29,990.00',
    rating: 4.5,
    reviews: '15,620',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop',
    description: 'Industry-leading noise canceling with Dual Noise Sensor technology',
    category: 'Audio',
    brand: 'Sony'
  }
];

const rawUsedProducts = [
  {
    id: 'u4',
    originalAsin: 'a1',
    name: 'Amazon Echo Dot (4th Gen, Black)',
    originalPrice: '3,999',
    relifePrice: '1,899',
    conditionScore: 78,
    distance: '8.0 km',
    passportAvailable: false,
    sellerRating: 4.2,
    sellerReviews: 56,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=500&auto=format&fit=crop',
    category: 'Smart Home',
    co2Saved: '8 kg'
  },
  {
    id: 'u5',
    originalAsin: 'a3',
    name: 'Apple MacBook Air M1 (2020) 8GB RAM, 256GB SSD',
    originalPrice: '92,900',
    relifePrice: '54,990',
    conditionScore: 94,
    distance: '12 km',
    passportAvailable: true,
    sellerRating: 4.7,
    sellerReviews: 210,
    image: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=500&auto=format&fit=crop',
    category: 'Laptops',
    co2Saved: '220 kg'
  },
  {
    id: 'u6',
    originalAsin: 'a4',
    name: 'Sony WH-1000XM4 Noise Cancelling Headphones',
    originalPrice: '22,990',
    relifePrice: '14,500',
    conditionScore: 88,
    distance: '3.5 km',
    passportAvailable: true,
    sellerRating: 4.6,
    sellerReviews: 312,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop',
    category: 'Audio',
    co2Saved: '15 kg'
  }
];

const rawOpenBoxProducts = [
  {
    id: 'o2',
    originalAsin: 'a1',
    name: 'Amazon Echo Dot (5th Gen, 2022)',
    originalPrice: '5,499',
    relifePrice: '3,499',
    discountPercent: 36,
    conditionScore: 99,
    distance: 'Fulfillment Center',
    passportAvailable: true,
    aiVerified: true,
    image: 'https://images.unsplash.com/photo-1543512214-318c7553f230?q=80&w=500&auto=format&fit=crop',
    category: 'Smart Home'
  },
  {
    id: 'o6',
    originalAsin: 'a4',
    name: 'Bose QuietComfort 45 Bluetooth Wireless Noise Cancelling',
    originalPrice: '29,900',
    relifePrice: '22,500',
    discountPercent: 25,
    conditionScore: 98,
    distance: 'Fulfillment Center',
    passportAvailable: true,
    aiVerified: true,
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=500&auto=format&fit=crop',
    category: 'Audio'
  }
];

const getConditionLabel = (score) => {
  if (score >= 80) return 'Like New';
  if (score >= 50) return 'Refurbished';
  if (score >= 30) return 'Donate';
  return 'Reject / Recycle';
};

const sellerNames = ['TechRenew Electronics', 'ReLife Certified Seller', 'Gadget Restore', 'GreenTech Store', 'Amazon Warehouse'];
const inspectionSummaries = [
  'Minor micro-abrasions on the bottom edge.',
  'Display has no visible scratches. Fully tested.',
  'Battery replaced with OEM part. Minor scuffs on casing.',
  'Pristine condition. Looks and feels like new.',
  'Noticeable wear on corners, screen is flawless.'
];

const generateUnitsForProduct = (baseProduct, isUsed) => {
  const basePriceStr = baseProduct.relifePrice.replace(/,/g, '');
  const basePrice = parseInt(basePriceStr, 10);
  const baseScore = baseProduct.conditionScore;
  
  const numUnits = Math.floor(Math.random() * 3) + 4; // 4 to 6 units
  const units = [];
  
  for (let i = 0; i < numUnits; i++) {
    let scoreOffset = 0;
    if (i === 0) scoreOffset = Math.floor(Math.random() * 3);
    else if (i === 1) scoreOffset = 0;
    else scoreOffset = -Math.floor(Math.random() * 15) - 2;
    
    let score = baseScore + scoreOffset;
    if (score > 100) score = 100;
    if (score < 60) score = 60 + Math.floor(Math.random() * 10);
    
    const scoreDiff = score - baseScore;
    const priceMultiplier = 1 + (scoreDiff * 0.012);
    const price = Math.round((basePrice * priceMultiplier) / 10) * 10;
    const formattedPrice = price.toLocaleString('en-IN');
    
    units.push({
      unitId: `${baseProduct.id}-unit-${i}`,
      conditionScore: score,
      conditionLabel: getConditionLabel(score),
      price: formattedPrice,
      batteryHealth: isUsed ? `${Math.floor(Math.random() * 15) + 85}%` : '100%',
      sellerName: sellerNames[Math.floor(Math.random() * sellerNames.length)],
      sellerRating: (Math.random() * 1 + 4).toFixed(1),
      warrantyMonths: score >= 90 ? 12 : 6,
      inspectionSummary: inspectionSummaries[Math.floor(Math.random() * inspectionSummaries.length)],
      passportId: `pass-${Math.floor(Math.random() * 90000) + 10000}`,
      distance: `${(Math.random() * 15 + 1).toFixed(1)} km`
    });
  }
  
  units.sort((a, b) => b.conditionScore - a.conditionScore);
  return units;
};

export const runSeed = async () => {
  try {
    console.log('Clearing old data...');
    await AmazonProduct.deleteMany({});
    await RelifeProduct.deleteMany({});
    await User.deleteMany({});
    await Seller.deleteMany({});

    console.log('Seeding Users and Sellers...');
    const user = await User.create({
      name: 'Test Customer',
      email: 'customer@example.com',
      passwordHash: 'password123',
      role: 'customer'
    });

    await Seller.create({
      name: 'TechRenew Seller',
      email: 'seller@example.com',
      passwordHash: 'password123',
      businessName: 'TechRenew Electronics',
      sellerRating: 4.8,
      reviewsCount: 1540,
      totalSales: 8900
    });

    console.log('Seeding Amazon Products...');
    for (const ap of rawAmazonProducts) {
      await AmazonProduct.create({
        originalId: ap.id,
        name: ap.name,
        price: ap.price,
        oldPrice: ap.oldPrice,
        rating: ap.rating,
        reviews: ap.reviews,
        image: ap.image,
        description: ap.description,
        category: ap.category,
        brand: ap.brand
      });
    }

    console.log('Seeding ReLife Products (Used)...');
    for (const rp of rawUsedProducts) {
      const units = generateUnitsForProduct(rp, true);
      await RelifeProduct.create({
        originalId: rp.id,
        originalAsin: rp.originalAsin,
        isUsed: true,
        name: rp.name,
        originalPrice: rp.originalPrice,
        relifePrice: rp.relifePrice,
        conditionScore: rp.conditionScore,
        distance: rp.distance,
        passportAvailable: rp.passportAvailable,
        sellerRating: rp.sellerRating,
        sellerReviews: rp.sellerReviews,
        image: rp.image,
        category: rp.category,
        co2Saved: rp.co2Saved,
        availableUnits: units
      });
    }

    console.log('Seeding ReLife Products (Open Box)...');
    for (const op of rawOpenBoxProducts) {
      const units = generateUnitsForProduct(op, false);
      await RelifeProduct.create({
        originalId: op.id,
        originalAsin: op.originalAsin,
        isUsed: false,
        name: op.name,
        originalPrice: op.originalPrice,
        relifePrice: op.relifePrice,
        discountPercent: op.discountPercent,
        conditionScore: op.conditionScore,
        distance: op.distance,
        passportAvailable: op.passportAvailable,
        aiVerified: op.aiVerified,
        image: op.image,
        category: op.category,
        availableUnits: units
      });
    }

    console.log('Database Seeding Completed Successfully!');
  } catch (error) {
    console.error('Seeding Error:', error);
  }
};

// Standalone execution support
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  dotenv.config();
  connectDB().then(async () => {
    await runSeed();
    await disconnectDB();
  });
}
