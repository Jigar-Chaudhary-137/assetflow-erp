const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// --- Helper: Excel Base Generator ---
const createExcelWorkbook = (title, sections) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  // Freeze top rows (1 to 4) for the header info
  worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 4 }];

  // 1. Title Block
  worksheet.addRow(['Asset Flow ERP']).font = { bold: true, size: 16, color: { argb: 'FF1F497D' } };
  worksheet.addRow([title]).font = { bold: true, size: 13 };
  worksheet.addRow([`Export Date: ${new Date().toLocaleString()}`]).font = { italic: true, size: 10 };
  worksheet.addRow([]); // Blank line spacer

  // 2. Sections rendering
  sections.forEach(section => {
    // Add section header if present
    if (section.title) {
      worksheet.addRow([section.title]).font = { bold: true, size: 12, underline: true };
    }

    // Add table headers
    if (section.headers) {
      const headerRow = worksheet.addRow(section.headers);
      headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      headerRow.eachCell(cell => {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1F497D' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    }

    // Add rows
    if (section.rows) {
      section.rows.forEach(rowData => {
        worksheet.addRow(rowData);
      });
    }

    worksheet.addRow([]); // Spacer
  });

  // 3. Auto-adjust columns widths
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, cell => {
      const valStr = cell.value ? String(cell.value) : '';
      if (valStr.length > maxLength) {
        maxLength = valStr.length;
      }
    });
    column.width = Math.max(maxLength + 3, 12);
  });

  return workbook;
};

// --- Helper: PDF Base Generator ---
const drawPDFBase = (title, sections, res) => {
  const doc = new PDFDocument({ margin: 50, bufferPages: true });

  // Stream output to Express response
  doc.pipe(res);

  let pageNumber = 1;

  // Header drawing function
  const drawHeader = () => {
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#1F497D').text('Asset Flow ERP', { align: 'center' });
    doc.fontSize(12).fillColor('#333333').text(title, { align: 'center' });
    doc.fontSize(8).font('Helvetica-Oblique').fillColor('#666666').text(`Export Date: ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(1.5);
  };

  const drawFooter = (pageNo) => {
    doc.fontSize(8).font('Helvetica').fillColor('#999999').text(`Asset Flow ERP | Page ${pageNo}`, 50, doc.page.height - 50, {
      align: 'center',
      width: doc.page.width - 100
    });
  };

  // Setup initial page
  drawHeader();

  sections.forEach(section => {
    // Check page space before printing section title
    if (doc.y > doc.page.height - 120) {
      doc.addPage();
      pageNumber++;
      drawHeader();
    }

    if (section.title) {
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#1F497D').text(section.title);
      doc.moveDown(0.5);
    }

    if (section.headers && section.rows) {
      const colWidths = section.headers.map(() => (doc.page.width - 100) / section.headers.length);
      let currentY = doc.y;

      // Draw table headers
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
      
      // Draw background header rect
      doc.rect(50, currentY - 2, doc.page.width - 100, 18).fill('#1F497D');
      doc.fillColor('#FFFFFF');

      section.headers.forEach((h, i) => {
        doc.text(String(h), 50 + i * colWidths[i], currentY, { width: colWidths[i], align: 'center' });
      });

      currentY += 20;

      // Draw rows
      doc.font('Helvetica').fontSize(8).fillColor('#333333');
      section.rows.forEach((row, rowIdx) => {
        // Page break check
        if (currentY > doc.page.height - 80) {
          doc.addPage();
          pageNumber++;
          drawHeader();
          currentY = doc.y;

          // Redraw headers on new page
          doc.fontSize(9).font('Helvetica-Bold').fillColor('#FFFFFF');
          doc.rect(50, currentY - 2, doc.page.width - 100, 18).fill('#1F497D');
          doc.fillColor('#FFFFFF');
          section.headers.forEach((h, i) => {
            doc.text(String(h), 50 + i * colWidths[i], currentY, { width: colWidths[i], align: 'center' });
          });
          currentY += 20;
          doc.font('Helvetica').fontSize(8).fillColor('#333333');
        }

        // Zebra striping background
        if (rowIdx % 2 === 1) {
          doc.rect(50, currentY - 2, doc.page.width - 100, 15).fill('#F2F5F8');
          doc.fillColor('#333333');
        }

        row.forEach((cell, cellIdx) => {
          doc.text(String(cell || ''), 50 + cellIdx * colWidths[cellIdx], currentY, { width: colWidths[cellIdx], align: 'center' });
        });
        currentY += 15;
      });

      doc.y = currentY + 10;
      doc.moveDown();
    }
  });

  // Draw footers on all pages before ending document
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    drawFooter(i + 1);
  }

  doc.end();
};

// --- Export Service Functions ---

// 1. Dashboard Export
const exportDashboardExcel = (data) => {
  const sections = [
    {
      title: 'Assets Count Status Distribution',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.assets).filter(([k]) => k !== 'total').map(([k, v]) => [k, v])
    },
    {
      title: 'Users Status Distribution',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.users).filter(([k]) => k !== 'total').map(([k, v]) => [k, v])
    },
    {
      title: 'Master Data Totals',
      headers: ['Metric', 'Count'],
      rows: [
        ['Total Categories', data.masterData.categories],
        ['Total Departments', data.masterData.departments]
      ]
    },
    {
      title: 'Operations Totals',
      headers: ['Pending Task / Flow', 'Count'],
      rows: [
        ['Active Allocations', data.operations.activeAllocations],
        ['Pending Transfers', data.operations.pendingTransfers],
        ['Pending Maintenance Tasks', data.operations.pendingMaintenance],
        ['Pending Audits Cycles', data.operations.pendingAudits]
      ]
    }
  ];
  return createExcelWorkbook('Dashboard Summary Report', sections);
};

const exportDashboardPDF = (data, res) => {
  const sections = [
    {
      title: 'Assets Count Status Distribution',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.assets).filter(([k]) => k !== 'total').map(([k, v]) => [k, String(v)])
    },
    {
      title: 'Users Status Distribution',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.users).filter(([k]) => k !== 'total').map(([k, v]) => [k, String(v)])
    },
    {
      title: 'Master Data Totals',
      headers: ['Metric', 'Count'],
      rows: [
        ['Total Categories', String(data.masterData.categories)],
        ['Total Departments', String(data.masterData.departments)]
      ]
    },
    {
      title: 'Operations Totals',
      headers: ['Pending Task / Flow', 'Count'],
      rows: [
        ['Active Allocations', String(data.operations.activeAllocations)],
        ['Pending Transfers', String(data.operations.pendingTransfers)],
        ['Pending Maintenance Tasks', String(data.operations.pendingMaintenance)],
        ['Pending Audits Cycles', String(data.operations.pendingAudits)]
      ]
    }
  ];
  return drawPDFBase('Dashboard Summary Report', sections, res);
};

// 2. Asset Export
const exportAssetExcel = (data) => {
  const sections = [
    {
      title: 'Asset Count and Valuation by Category',
      headers: ['Category Name', 'Count', 'Total Value ($)'],
      rows: data.countByCategory.map(item => [item.categoryName, item.count, item.totalValue])
    },
    {
      title: 'Asset Count and Valuation by Department',
      headers: ['Department Name', 'Count', 'Total Value ($)'],
      rows: data.countByDepartment.map(item => [item.departmentName, item.count, item.totalValue])
    },
    {
      title: 'Asset Status Distribution',
      headers: ['Status', 'Count'],
      rows: data.statusDistribution.map(item => [item._id, item.count])
    },
    {
      title: 'Assets Near Warranty Expiration (90 Days)',
      headers: ['Asset Name', 'Asset Tag', 'Warranty Expiration Date'],
      rows: data.nearWarrantyExpiry.map(item => [
        item.name, 
        item.assetTag, 
        item.purchaseInfo?.warrantyExpiration ? new Date(item.purchaseInfo.warrantyExpiration).toLocaleDateString() : 'N/A'
      ])
    }
  ];
  return createExcelWorkbook('Asset Statistics & Valuation Report', sections);
};

const exportAssetPDF = (data, res) => {
  const sections = [
    {
      title: 'Asset Count and Valuation by Category',
      headers: ['Category Name', 'Count', 'Total Value ($)'],
      rows: data.countByCategory.map(item => [item.categoryName, String(item.count), `$${item.totalValue}`])
    },
    {
      title: 'Asset Count and Valuation by Department',
      headers: ['Department Name', 'Count', 'Total Value ($)'],
      rows: data.countByDepartment.map(item => [item.departmentName, String(item.count), `$${item.totalValue}`])
    },
    {
      title: 'Asset Status Distribution',
      headers: ['Status', 'Count'],
      rows: data.statusDistribution.map(item => [item._id, String(item.count)])
    },
    {
      title: 'Assets Near Warranty Expiration (90 Days)',
      headers: ['Asset Name', 'Asset Tag', 'Warranty Expiration Date'],
      rows: data.nearWarrantyExpiry.map(item => [
        item.name, 
        item.assetTag, 
        item.purchaseInfo?.warrantyExpiration ? new Date(item.purchaseInfo.warrantyExpiration).toLocaleDateString() : 'N/A'
      ])
    }
  ];
  return drawPDFBase('Asset Statistics & Valuation Report', sections, res);
};

// 3. Allocation Export
const exportAllocationExcel = (data) => {
  const sections = [
    {
      title: 'Active Allocations list',
      headers: ['Asset Name', 'Asset Tag', 'Employee Name', 'Checkout Date'],
      rows: data.activeAllocations.map(item => [
        item.assetId?.name || 'N/A',
        item.assetId?.assetTag || 'N/A',
        item.employeeId?.name || 'N/A',
        new Date(item.createdAt).toLocaleDateString()
      ])
    },
    {
      title: 'Most Allocated Assets',
      headers: ['Asset Name', 'Asset Tag', 'Allocation Count'],
      rows: data.mostAllocatedAssets.map(item => [item.assetName, item.assetTag, item.allocationCount])
    },
    {
      title: 'Active Departments (Allocations)',
      headers: ['Department Name', 'Count'],
      rows: data.activeDepartments.map(item => [item.departmentName, item.count])
    }
  ];
  return createExcelWorkbook('Allocation Metrics Report', sections);
};

const exportAllocationPDF = (data, res) => {
  const sections = [
    {
      title: 'Active Allocations list',
      headers: ['Asset Name', 'Asset Tag', 'Employee Name', 'Checkout Date'],
      rows: data.activeAllocations.map(item => [
        item.assetId?.name || 'N/A',
        item.assetId?.assetTag || 'N/A',
        item.employeeId?.name || 'N/A',
        new Date(item.createdAt).toLocaleDateString()
      ])
    },
    {
      title: 'Most Allocated Assets',
      headers: ['Asset Name', 'Asset Tag', 'Allocation Count'],
      rows: data.mostAllocatedAssets.map(item => [item.assetName, item.assetTag, String(item.allocationCount)])
    },
    {
      title: 'Active Departments (Allocations)',
      headers: ['Department Name', 'Count'],
      rows: data.activeDepartments.map(item => [item.departmentName, String(item.count)])
    }
  ];
  return drawPDFBase('Allocation Metrics Report', sections, res);
};

// 4. Transfer Export
const exportTransferExcel = (data) => {
  const sections = [
    {
      title: 'Transfer Requests Status Summary',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.statusSummary).map(([k, v]) => [k, v])
    },
    {
      title: 'Transfer Monthly Trends',
      headers: ['Month', 'Requests Count'],
      rows: data.monthlyTrends.map(item => [item._id, item.count])
    }
  ];
  return createExcelWorkbook('Asset Transfer Trends Report', sections);
};

const exportTransferPDF = (data, res) => {
  const sections = [
    {
      title: 'Transfer Requests Status Summary',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.statusSummary).map(([k, v]) => [k, String(v)])
    },
    {
      title: 'Transfer Monthly Trends',
      headers: ['Month', 'Requests Count'],
      rows: data.monthlyTrends.map(item => [item._id, String(item.count)])
    }
  ];
  return drawPDFBase('Asset Transfer Trends Report', sections, res);
};

// 5. Maintenance Export
const exportMaintenanceExcel = (data) => {
  const sections = [
    {
      title: 'Maintenance Cost Aggregations',
      headers: ['Status', 'Total Estimated ($)', 'Total Actual ($)'],
      rows: data.costSummary.map(item => [item._id, item.totalEstimated, item.totalActual])
    },
    {
      title: 'Active Tasks (IN_PROGRESS)',
      headers: ['Asset Name', 'Asset Tag', 'Reported By User', 'Estimated Cost ($)'],
      rows: data.activeTasks.map(item => [
        item.assetId?.name || 'N/A',
        item.assetId?.assetTag || 'N/A',
        item.reportedById?.name || 'N/A',
        item.estimatedCost
      ])
    },
    {
      title: 'Maintenance Frequency by Asset',
      headers: ['Asset Name', 'Asset Tag', 'Total Requests Count'],
      rows: data.frequencyByAsset.map(item => [item.assetName, item.assetTag, item.count])
    }
  ];
  return createExcelWorkbook('Asset Maintenance Report', sections);
};

const exportMaintenancePDF = (data, res) => {
  const sections = [
    {
      title: 'Maintenance Cost Aggregations',
      headers: ['Status', 'Total Estimated ($)', 'Total Actual ($)'],
      rows: data.costSummary.map(item => [item._id, `$${item.totalEstimated}`, `$${item.totalActual}`])
    },
    {
      title: 'Active Tasks (IN_PROGRESS)',
      headers: ['Asset Name', 'Asset Tag', 'Reported By User', 'Estimated Cost ($)'],
      rows: data.activeTasks.map(item => [
        item.assetId?.name || 'N/A',
        item.assetId?.assetTag || 'N/A',
        item.reportedById?.name || 'N/A',
        `$${item.estimatedCost}`
      ])
    },
    {
      title: 'Maintenance Frequency by Asset',
      headers: ['Asset Name', 'Asset Tag', 'Total Requests Count'],
      rows: data.frequencyByAsset.map(item => [item.assetName, item.assetTag, String(item.count)])
    }
  ];
  return drawPDFBase('Asset Maintenance Report', sections, res);
};

// 6. Audit Export
const exportAuditExcel = (data) => {
  const sections = [
    {
      title: 'Audit Cycles Status Summary',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.auditStatusSummary).map(([k, v]) => [k, v])
    },
    {
      title: 'Verified Asset Condition Statistics',
      headers: ['Condition Status', 'Count'],
      rows: Object.entries(data.verificationSummary).map(([k, v]) => [k, v])
    }
  ];
  return createExcelWorkbook('Audit Verification Metrics Report', sections);
};

const exportAuditPDF = (data, res) => {
  const sections = [
    {
      title: 'Audit Cycles Status Summary',
      headers: ['Status', 'Count'],
      rows: Object.entries(data.auditStatusSummary).map(([k, v]) => [k, String(v)])
    },
    {
      title: 'Verified Asset Condition Statistics',
      headers: ['Condition Status', 'Count'],
      rows: Object.entries(data.verificationSummary).map(([k, v]) => [k, String(v)])
    }
  ];
  return drawPDFBase('Audit Verification Metrics Report', sections, res);
};

module.exports = {
  exportDashboardExcel,
  exportDashboardPDF,
  exportAssetExcel,
  exportAssetPDF,
  exportAllocationExcel,
  exportAllocationPDF,
  exportTransferExcel,
  exportTransferPDF,
  exportMaintenanceExcel,
  exportMaintenancePDF,
  exportAuditExcel,
  exportAuditPDF
};
