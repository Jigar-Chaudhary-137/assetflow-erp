const reportService = require('../services/reportService');
const Asset = require('../models/Asset');
const Allocation = require('../models/Allocation');
const Booking = require('../models/Booking');
const Maintenance = require('../models/Maintenance');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Get dashboard metrics summary
// @route   GET /api/dashboard
// @access  Private (Admin, Manager)
const getDashboardData = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchDashboardData(req.user);
  return res.status(200).json(
    new ApiResponse(200, data, 'Dashboard metrics fetched successfully')
  );
});

// @desc    Get detailed Asset reports
// @route   GET /api/reports/assets
// @access  Private (Admin, Manager)
const getAssetReport = asyncHandler(async (req, res, next) => {
  const { categoryId, departmentId } = req.query;
  const data = await reportService.fetchAssetReportData({ categoryId, departmentId });
  return res.status(200).json(
    new ApiResponse(200, data, 'Asset report fetched successfully')
  );
});

// @desc    Get detailed Allocation reports
// @route   GET /api/reports/allocations
// @access  Private (Admin, Manager)
const getAllocationReport = asyncHandler(async (req, res, next) => {
  const { departmentId, userId } = req.query;
  const data = await reportService.fetchAllocationReportData({ departmentId, userId });
  return res.status(200).json(
    new ApiResponse(200, data, 'Allocation report fetched successfully')
  );
});

// @desc    Get detailed Transfer reports
// @route   GET /api/reports/transfers
// @access  Private (Admin, Manager)
const getTransferReport = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchTransferReportData();
  return res.status(200).json(
    new ApiResponse(200, data, 'Transfer report fetched successfully')
  );
});

// @desc    Get detailed Maintenance reports
// @route   GET /api/reports/maintenance
// @access  Private (Admin, Manager)
const getMaintenanceReport = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchMaintenanceReportData();
  return res.status(200).json(
    new ApiResponse(200, data, 'Maintenance report fetched successfully')
  );
});

// @desc    Get detailed Audit reports
// @route   GET /api/reports/audits
// @access  Private (Admin, Manager)
const getAuditReport = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchAuditReportData();
  return res.status(200).json(
    new ApiResponse(200, data, 'Audit report fetched successfully')
  );
});

// @desc    Get dashboard summary metrics (KPIs, distributions, recent activity)
// @route   GET /api/reports/dashboard
// @access  Private (Admin, Manager, DeptHead)
const getDashboardMetrics = asyncHandler(async (req, res, next) => {
  // ── Asset Counts by Status ──────────────────────────────────────────────
  const assetStatusCounts = await Asset.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusMap = {};
  assetStatusCounts.forEach(item => { statusMap[item._id] = item.count; });

  const totalAssets        = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const availableAssets    = statusMap['AVAILABLE']         || 0;
  const allocatedAssets    = statusMap['ALLOCATED']         || 0;
  const maintenanceAssets  = statusMap['UNDER_MAINTENANCE'] || 0;
  const reservedAssets     = statusMap['RESERVED']          || 0;

  // ── Pending Counts ──────────────────────────────────────────────────────
  const [pendingBookings, pendingMaintenance, pendingTransfers] = await Promise.all([
    Booking.countDocuments({ status: 'PENDING' }),
    Maintenance.countDocuments({ status: 'SCHEDULED' }),
    Allocation.countDocuments({ transferStatus: 'PENDING_APPROVAL' })
  ]);

  // ── Total Portfolio Value ───────────────────────────────────────────────
  const valueAgg = await Asset.aggregate([
    { $group: { _id: null, total: { $sum: '$purchaseInfo.purchaseCost' } } }
  ]);
  const totalValue = valueAgg.length > 0 ? (valueAgg[0].total || 0) : 0;

  // ── Category Distribution ───────────────────────────────────────────────
  const categoryDistribution = await Asset.aggregate([
    {
      $lookup: {
        from: 'categories',
        localField: 'categoryId',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: false } },
    { $group: { _id: '$category.name', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
    { $sort: { value: -1 } }
  ]);

  // ── Department Distribution ─────────────────────────────────────────────
  const departmentDistribution = await Asset.aggregate([
    { $match: { departmentId: { $ne: null } } },
    {
      $lookup: {
        from: 'departments',
        localField: 'departmentId',
        foreignField: '_id',
        as: 'department'
      }
    },
    { $unwind: { path: '$department', preserveNullAndEmptyArrays: false } },
    { $group: { _id: '$department.name', value: { $sum: 1 } } },
    { $project: { _id: 0, name: '$_id', value: 1 } },
    { $sort: { value: -1 } }
  ]);

  // ── Recent Activity ─────────────────────────────────────────────────────
  const recentActivity = await ActivityLog.find()
    .populate('userId', 'name username')
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  // ── Pending Approvals (previews for Dashboard quick-action cards) ────────
  const [pendingBookingsList, pendingMaintenanceList] = await Promise.all([
    Booking.find({ status: 'PENDING' })
      .populate('assetId', 'name assetTag')
      .populate('bookedById', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean(),
    Maintenance.find({ status: 'SCHEDULED' })
      .populate('assetId', 'name assetTag')
      .populate('reportedById', 'name')
      .sort({ createdAt: -1 })
      .limit(3)
      .lean()
  ]);

  const pendingTransfersList = await Allocation.find({ transferStatus: 'PENDING_APPROVAL' })
    .populate('assetId', 'name assetTag')
    .populate('employeeId', 'name')
    .populate('transferRequestedTo', 'name')
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, {
      counts: {
        total: totalAssets,
        available: availableAssets,
        allocated: allocatedAssets,
        maintenance: maintenanceAssets,
        reserved: reservedAssets,
        pendingBookings,
        pendingMaintenance,
        pendingTransfers
      },
      totalValue,
      categoryDistribution,
      departmentDistribution,
      recentActivity,
      pendingApprovals: {
        bookings: pendingBookingsList,
        maintenances: pendingMaintenanceList,
        transfers: pendingTransfersList
      }
    }, 'Dashboard metrics retrieved successfully')
  );
});

// @desc    Get report summary data (assets, allocations, bookings, maintenance)
// @route   GET /api/reports/summary
// @access  Private (Admin, Manager, DeptHead)
const getReportSummary = asyncHandler(async (req, res, next) => {
  const [assets, allocations, bookings, maintenances] = await Promise.all([
    Asset.find()
      .populate('categoryId', 'name code')
      .populate('departmentId', 'name code')
      .lean(),
    Allocation.find({ status: 'ACTIVE' })
      .populate('assetId', 'name assetTag')
      .populate('employeeId', 'name email')
      .lean(),
    Booking.find()
      .populate('assetId', 'name assetTag')
      .populate('bookedById', 'name')
      .lean(),
    Maintenance.find()
      .populate('assetId', 'name assetTag')
      .populate('reportedById', 'name')
      .lean()
  ]);

  return res.status(200).json(
    new ApiResponse(200, {
      assets,
      allocations,
      bookings,
      maintenances
    }, 'Report summary retrieved successfully')

  );
});

module.exports = {
  getDashboardData,
  getAssetReport,
  getAllocationReport,
  getTransferReport,
  getMaintenanceReport,
  getAuditReport,
  getDashboardMetrics,
  getReportSummary
};
