const reportService = require('../services/reportService');
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

module.exports = {
  getDashboardData,
  getAssetReport,
  getAllocationReport,
  getTransferReport,
  getMaintenanceReport,
  getAuditReport
};
