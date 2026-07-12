const express = require('express');
const { 
  getDashboardData, 
  getAssetReport, 
  getAllocationReport, 
  getTransferReport, 
  getMaintenanceReport, 
  getAuditReport,
  getDashboardMetrics,
  getReportSummary
} = require('../controllers/reportController');
const {
  exportDashboardToExcel,
  exportDashboardToPDF,
  exportAssetToExcel,
  exportAssetToPDF,
  exportAllocationToExcel,
  exportAllocationToPDF,
  exportTransferToExcel,
  exportTransferToPDF,
  exportMaintenanceToExcel,
  exportMaintenanceToPDF,
  exportAuditToExcel,
  exportAuditToPDF
} = require('../controllers/exportController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

const router = express.Router();

// JSON Reports
router.get('/dashboard-legacy', protect, authorize('Admin', 'Manager'), getDashboardData);
router.get('/reports/assets', protect, authorize('Admin', 'Manager'), getAssetReport);
router.get('/reports/allocations', protect, authorize('Admin', 'Manager'), getAllocationReport);
router.get('/reports/transfers', protect, authorize('Admin', 'Manager'), getTransferReport);
router.get('/reports/maintenance', protect, authorize('Admin', 'Manager'), getMaintenanceReport);
router.get('/reports/audits', protect, authorize('Admin', 'Manager'), getAuditReport);

// Excel Exports
router.get('/reports/dashboard/export/excel', protect, authorize('Admin', 'Manager'), exportDashboardToExcel);
router.get('/reports/assets/export/excel', protect, authorize('Admin', 'Manager'), exportAssetToExcel);
router.get('/reports/allocations/export/excel', protect, authorize('Admin', 'Manager'), exportAllocationToExcel);
router.get('/reports/transfers/export/excel', protect, authorize('Admin', 'Manager'), exportTransferToExcel);
router.get('/reports/maintenance/export/excel', protect, authorize('Admin', 'Manager'), exportMaintenanceToExcel);
router.get('/reports/audits/export/excel', protect, authorize('Admin', 'Manager'), exportAuditToExcel);

// PDF Exports
router.get('/reports/dashboard/export/pdf', protect, authorize('Admin', 'Manager'), exportDashboardToPDF);
router.get('/reports/assets/export/pdf', protect, authorize('Admin', 'Manager'), exportAssetToPDF);
router.get('/reports/allocations/export/pdf', protect, authorize('Admin', 'Manager'), exportAllocationToPDF);
router.get('/reports/transfers/export/pdf', protect, authorize('Admin', 'Manager'), exportTransferToPDF);
router.get('/reports/maintenance/export/pdf', protect, authorize('Admin', 'Manager'), exportMaintenanceToPDF);
router.get('/reports/audits/export/pdf', protect, authorize('Admin', 'Manager'), exportAuditToPDF);

// @route   GET /api/reports/dashboard
router.get('/dashboard', protect, authorize('Admin', 'Manager'), getDashboardMetrics);

// @route   GET /api/reports/summary
router.get('/summary', protect, authorize('Admin', 'Manager'), getReportSummary);

module.exports = router;
