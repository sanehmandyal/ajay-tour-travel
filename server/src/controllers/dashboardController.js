import { Inquiry, Destination, BlogPost, Route, Vehicle, TourPackage, FAQ } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/respond.js';

export const dashboard = asyncHandler(async (_req, res) => {
  const since = new Date(Date.now() - 29 * 86400000); since.setUTCHours(0, 0, 0, 0);
  const [byStatus, recent, trendRaw, popular, counts] = await Promise.all([
    Inquiry.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
    Inquiry.find().select('reference name pickup destination travelDate status createdAt').sort({ createdAt: -1 }).limit(8).lean(),
    Inquiry.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, n: { $sum: 1 } } }]),
    Destination.find({ status: 'published' }).select('name slug viewCount').sort({ viewCount: -1 }).limit(5).lean(),
    Promise.all([Destination.countDocuments({ status: 'published' }), Route.countDocuments({ enabled: true }), Vehicle.countDocuments({ status: 'published' }), TourPackage.countDocuments({ status: 'published' }), BlogPost.countDocuments({ status: 'published' })]),
  ]);
  const sampleCount = (await Promise.all([Destination, Vehicle, TourPackage, BlogPost, FAQ].map((M) => M.countDocuments({ isSample: true, status: 'published' })))).reduce((a, b) => a + b, 0);
  const status = Object.fromEntries(byStatus.map((s) => [s._id, s.n]));
  const map = Object.fromEntries(trendRaw.map((t) => [t._id, t.n]));
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(since.getTime() + i * 86400000).toISOString().slice(0, 10);
    return { date: d, count: map[d] || 0 };
  });
  ok(res, {
    totals: { total: Object.values(status).reduce((a, b) => a + b, 0), new: status.New || 0, confirmed: status.Confirmed || 0, completed: status.Completed || 0, byStatus: status },
    recent, trend, popular, sampleCount,
    content: { destinations: counts[0], routes: counts[1], vehicles: counts[2], packages: counts[3], posts: counts[4] },
  });
});
