const Asset = require('../models/Asset');
const User = require('../models/User');
const Category = require('../models/Category');
const Department = require('../models/Department');
const Allocation = require('../models/Allocation');
const Transfer = require('../models/Transfer');
const Maintenance = require('../models/Maintenance');
const Audit = require('../models/Audit');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Shared service for retrieving dashboard statistics.
 */
const fetchDashboardData = async (user) => {
  const [
    assetStats,
    userStats,
    catCount,
    deptCount,
    activeAllocationsCount,
    pendingTransfersCount,
    pendingMaintenanceCount,
    pendingAuditsCount,
    recentLogs,
    recentNotifications
  ] = await Promise.all([
    Asset.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    User.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Category.countDocuments(),
    Department.countDocuments(),
    Allocation.countDocuments({ status: 'ACTIVE' }),
    Transfer.countDocuments({ status: 'PENDING' }),
    Maintenance.countDocuments({ status: { $in: ['SCHEDULED', 'IN_PROGRESS'] } }),
    Audit.countDocuments({ status: { $in: ['PENDING', 'IN_PROGRESS'] } }),
    ActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('userId', 'name username'),
    Notification.find(user.role === 'ADMIN' ? {} : { recipient: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('recipient', 'name username')
  ]);

  const assets = {
    total: 0,
    AVAILABLE: 0,
    ALLOCATED: 0,
    RESERVED: 0,
    UNDER_MAINTENANCE: 0,
    LOST: 0,
    RETIRED: 0,
    DISPOSED: 0
  };
  assetStats.forEach(stat => {
    if (stat._id) {
      assets[stat._id] = stat.count;
      assets.total += stat.count;
    }
  });

  const users = {
    total: 0,
    ACTIVE: 0,
    INACTIVE: 0,
    SUSPENDED: 0
  };
  userStats.forEach(stat => {
    if (stat._id) {
      users[stat._id] = stat.count;
      users.total += stat.count;
    }
  });

  const masterData = {
    categories: catCount,
    departments: deptCount
  };

  const operations = {
    activeAllocations: activeAllocationsCount,
    pendingTransfers: pendingTransfersCount,
    pendingMaintenance: pendingMaintenanceCount,
    pendingAudits: pendingAuditsCount
  };

  return {
    assets,
    users,
    masterData,
    operations,
    recent: {
      activityLogs: recentLogs,
      notifications: recentNotifications
    }
  };
};

/**
 * Shared service for retrieving Asset report statistics.
 */
const fetchAssetReportData = async ({ categoryId, departmentId }) => {
  const matchQuery = {};

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    matchQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
  }
  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    matchQuery.departmentId = new mongoose.Types.ObjectId(departmentId);
  }

  const [
    countByCategory,
    countByDept,
    statusDist,
    nearWarranty
  ] = await Promise.all([
    Asset.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$categoryId',
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$purchaseInfo.purchaseCost', 0] } }
        }
      },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          categoryName: { $ifNull: ['$category.name', 'Uncategorized'] },
          count: 1,
          totalValue: 1
        }
      }
    ]),
    Asset.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$departmentId',
          count: { $sum: 1 },
          totalValue: { $sum: { $ifNull: ['$purchaseInfo.purchaseCost', 0] } }
        }
      },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          departmentName: { $ifNull: ['$dept.name', 'Unassigned'] },
          count: 1,
          totalValue: 1
        }
      }
    ]),
    Asset.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Asset.find({
      ...matchQuery,
      'purchaseInfo.warrantyExpiration': {
        $gte: new Date(),
        $lte: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      }
    }).select('name assetTag purchaseInfo.warrantyExpiration')
  ]);

  return {
    countByCategory,
    countByDepartment: countByDept,
    statusDistribution: statusDist,
    nearWarrantyExpiry: nearWarranty
  };
};

/**
 * Shared service for retrieving Allocation report statistics.
 */
const fetchAllocationReportData = async ({ departmentId, userId }) => {
  const matchQuery = {};
  if (departmentId && mongoose.Types.ObjectId.isValid(departmentId)) {
    matchQuery['user.departmentId'] = new mongoose.Types.ObjectId(departmentId);
  }
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    matchQuery.employeeId = new mongoose.Types.ObjectId(userId);
  }

  const [
    activeAllocations,
    mostAllocated,
    activeDepts
  ] = await Promise.all([
    Allocation.find({ status: 'ACTIVE' })
      .populate('assetId', 'name assetTag serialNumber')
      .populate('employeeId', 'name username email')
      .limit(50),
    Allocation.aggregate([
      { $group: { _id: '$assetId', allocationCount: { $sum: 1 } } },
      { $sort: { allocationCount: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' } },
      { $unwind: '$asset' },
      { $project: { assetName: '$asset.name', assetTag: '$asset.assetTag', allocationCount: 1 } }
    ]),
    Allocation.aggregate([
      { $lookup: { from: 'users', localField: 'employeeId', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' },
      { $match: matchQuery },
      { $group: { _id: '$user.departmentId', count: { $sum: 1 } } },
      { $lookup: { from: 'departments', localField: '_id', foreignField: '_id', as: 'dept' } },
      { $unwind: { path: '$dept', preserveNullAndEmptyArrays: true } },
      { $project: { departmentName: { $ifNull: ['$dept.name', 'Unassigned'] }, count: 1 } },
      { $sort: { count: -1 } }
    ])
  ]);

  return {
    activeAllocations,
    mostAllocatedAssets: mostAllocated,
    activeDepartments: activeDepts
  };
};

/**
 * Shared service for retrieving Transfer report statistics.
 */
const fetchTransferReportData = async () => {
  const [
    statusCounts,
    trends
  ] = await Promise.all([
    Transfer.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Transfer.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ])
  ]);

  const summary = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0
  };
  statusCounts.forEach(stat => {
    if (stat._id) {
      summary[stat._id] = stat.count;
    }
  });

  return {
    statusSummary: summary,
    monthlyTrends: trends
  };
};

/**
 * Shared service for retrieving Maintenance report statistics.
 */
const fetchMaintenanceReportData = async () => {
  const [
    costSummary,
    activeTasks,
    frequency
  ] = await Promise.all([
    Maintenance.aggregate([
      {
        $group: {
          _id: '$status',
          totalEstimated: { $sum: '$estimatedCost' },
          totalActual: { $sum: '$actualCost' }
        }
      }
    ]),
    Maintenance.find({ status: 'IN_PROGRESS' })
      .populate('assetId', 'name assetTag serialNumber')
      .populate('reportedById', 'name username'),
    Maintenance.aggregate([
      { $group: { _id: '$assetId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $lookup: { from: 'assets', localField: '_id', foreignField: '_id', as: 'asset' } },
      { $unwind: '$asset' },
      { $project: { assetName: '$asset.name', assetTag: '$asset.assetTag', count: 1 } }
    ])
  ]);

  return {
    costSummary,
    activeTasks,
    frequencyByAsset: frequency
  };
};

/**
 * Shared service for retrieving Audit report statistics.
 */
const fetchAuditReportData = async () => {
  const [
    statusCounts,
    verifiedStats
  ] = await Promise.all([
    Audit.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]),
    Audit.aggregate([
      { $unwind: '$verifiedAssets' },
      {
        $group: {
          _id: '$verifiedAssets.condition',
          count: { $sum: 1 }
        }
      }
    ])
  ]);

  const auditSummary = {
    PENDING: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0
  };
  statusCounts.forEach(stat => {
    if (stat._id) {
      auditSummary[stat._id] = stat.count;
    }
  });

  const verificationSummary = {
    GOOD: 0,
    DAMAGED: 0,
    MISSING: 0
  };
  verifiedStats.forEach(stat => {
    if (stat._id) {
      verificationSummary[stat._id] = stat.count;
    }
  });

  return {
    auditStatusSummary: auditSummary,
    verificationSummary
  };
};

module.exports = {
  fetchDashboardData,
  fetchAssetReportData,
  fetchAllocationReportData,
  fetchTransferReportData,
  fetchMaintenanceReportData,
  fetchAuditReportData
};
