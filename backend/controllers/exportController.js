const reportService = require('../services/reportService');
const exportService = require('../services/exportService');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Export Dashboard Data as Excel
// @route   GET /api/reports/dashboard/export/excel
// @access  Private (Admin, Manager)
const exportDashboardToExcel = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchDashboardData(req.user);
  const workbook = exportService.exportDashboardExcel(data);
  const filename = `dashboard-summary-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Dashboard Data as PDF
// @route   GET /api/reports/dashboard/export/pdf
// @access  Private (Admin, Manager)
const exportDashboardToPDF = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchDashboardData(req.user);
  const filename = `dashboard-summary-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportDashboardPDF(data, res);
});

// @desc    Export Asset Data as Excel
// @route   GET /api/reports/assets/export/excel
// @access  Private (Admin, Manager)
const exportAssetToExcel = asyncHandler(async (req, res, next) => {
  const { categoryId, departmentId } = req.query;
  const data = await reportService.fetchAssetReportData({ categoryId, departmentId });
  const workbook = exportService.exportAssetExcel(data);
  const filename = `assets-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Asset Data as PDF
// @route   GET /api/reports/assets/export/pdf
// @access  Private (Admin, Manager)
const exportAssetToPDF = asyncHandler(async (req, res, next) => {
  const { categoryId, departmentId } = req.query;
  const data = await reportService.fetchAssetReportData({ categoryId, departmentId });
  const filename = `assets-report-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportAssetPDF(data, res);
});

// @desc    Export Allocation Data as Excel
// @route   GET /api/reports/allocations/export/excel
// @access  Private (Admin, Manager)
const exportAllocationToExcel = asyncHandler(async (req, res, next) => {
  const { departmentId, userId } = req.query;
  const data = await reportService.fetchAllocationReportData({ departmentId, userId });
  const workbook = exportService.exportAllocationExcel(data);
  const filename = `allocations-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Allocation Data as PDF
// @route   GET /api/reports/allocations/export/pdf
// @access  Private (Admin, Manager)
const exportAllocationToPDF = asyncHandler(async (req, res, next) => {
  const { departmentId, userId } = req.query;
  const data = await reportService.fetchAllocationReportData({ departmentId, userId });
  const filename = `allocations-report-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportAllocationPDF(data, res);
});

// @desc    Export Transfer Data as Excel
// @route   GET /api/reports/transfers/export/excel
// @access  Private (Admin, Manager)
const exportTransferToExcel = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchTransferReportData();
  const workbook = exportService.exportTransferExcel(data);
  const filename = `transfers-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Transfer Data as PDF
// @route   GET /api/reports/transfers/export/pdf
// @access  Private (Admin, Manager)
const exportTransferToPDF = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchTransferReportData();
  const filename = `transfers-report-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportTransferPDF(data, res);
});

// @desc    Export Maintenance Data as Excel
// @route   GET /api/reports/maintenance/export/excel
// @access  Private (Admin, Manager)
const exportMaintenanceToExcel = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchMaintenanceReportData();
  const workbook = exportService.exportMaintenanceExcel(data);
  const filename = `maintenance-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Maintenance Data as PDF
// @route   GET /api/reports/maintenance/export/pdf
// @access  Private (Admin, Manager)
const exportMaintenanceToPDF = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchMaintenanceReportData();
  const filename = `maintenance-report-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportMaintenancePDF(data, res);
});

// @desc    Export Audit Data as Excel
// @route   GET /api/reports/audits/export/excel
// @access  Private (Admin, Manager)
const exportAuditToExcel = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchAuditReportData();
  const workbook = exportService.exportAuditExcel(data);
  const filename = `audits-report-${new Date().toISOString().split('T')[0]}.xlsx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  await workbook.xlsx.write(res);
  return res.end();
});

// @desc    Export Audit Data as PDF
// @route   GET /api/reports/audits/export/pdf
// @access  Private (Admin, Manager)
const exportAuditToPDF = asyncHandler(async (req, res, next) => {
  const data = await reportService.fetchAuditReportData();
  const filename = `audits-report-${new Date().toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  exportService.exportAuditPDF(data, res);
});

module.exports = {
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
};
