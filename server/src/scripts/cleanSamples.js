import mongoose from 'mongoose';
import { Vehicle } from '../models/Vehicle.js';
import { TourPackage } from '../models/TourPackage.js';
import { FAQ } from '../models/FAQ.js';
import { BlogPost } from '../models/BlogPost.js';
import { Destination } from '../models/Destination.js';
import { Route } from '../models/Route.js';
import { WebsiteSettings } from '../models/WebsiteSettings.js';
import { env } from '../config/env.js';

async function main() {
  await mongoose.connect(env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Remove old starter placeholders marked with isSample: true
  const vDel = await Vehicle.deleteMany({ isSample: true });
  console.log(`Deleted ${vDel.deletedCount} sample vehicles`);

  const pDel = await TourPackage.deleteMany({ isSample: true });
  console.log(`Deleted ${pDel.deletedCount} sample packages`);

  const fDel = await FAQ.deleteMany({ isSample: true });
  console.log(`Deleted ${fDel.deletedCount} sample FAQs`);

  const bDel = await BlogPost.deleteMany({ isSample: true });
  console.log(`Deleted ${bDel.deletedCount} sample blog posts`);

  const dDel = await Destination.deleteMany({ isSample: true });
  console.log(`Deleted ${dDel.deletedCount} sample destinations`);

  // Ensure remaining blog posts have valid BSON dates for publishedAt
  const remainingPosts = await BlogPost.find({});
  for (const post of remainingPosts) {
    if (!post.publishedAt || !(post.publishedAt instanceof Date)) {
      post.publishedAt = new Date();
      await post.save();
    }
  }

  // Check counts
  const routesCount = await Route.countDocuments({ status: 'published' });
  const vehiclesCount = await Vehicle.countDocuments({ status: 'published' });
  const packagesCount = await TourPackage.countDocuments({ status: 'published' });
  const faqsCount = await FAQ.countDocuments({ status: 'published' });
  const blogCount = await BlogPost.countDocuments({ status: 'published' });

  console.log('Cleaned state summary:');
  console.log(`- Routes: ${routesCount}`);
  console.log(`- Vehicles: ${vehiclesCount}`);
  console.log(`- Packages: ${packagesCount}`);
  console.log(`- FAQs: ${faqsCount}`);
  console.log(`- Blog Posts: ${blogCount}`);

  await mongoose.disconnect();
}

main().catch(console.error);
