// ============================================================================
// services/export/export.service.ts - Export service for reports
// ============================================================================

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import type {
  StatisticsOverview,
  AgeGroupDistribution,
  SpecialPopulationRegistry,
  MonthlyRevenue,
  PopulationDistributionByStreet,
  DocumentTypesIssued,
  MostRequestedService,
  ReportsFilters,
} from '../reports/reports.types';

interface ExportData {
  statisticsOverview: StatisticsOverview;
  ageGroupDistribution: AgeGroupDistribution[];
  specialPopulationRegistry: SpecialPopulationRegistry[];
  monthlyRevenue?: MonthlyRevenue[]; // Optional - uses mock data
  populationDistributionByStreet: PopulationDistributionByStreet[];
  documentTypesIssued: DocumentTypesIssued[];
  mostRequestedServices?: MostRequestedService[]; // Optional - uses mock data
  filters: ReportsFilters;
}

export class ExportService {
  /**
   * Export all report data to Excel with separate sheets
   */
  async exportToExcel(data: ExportData): Promise<void> {
    try {
      // Create a new workbook
      const workbook = XLSX.utils.book_new();

      // Add Statistics Overview sheet
      this.addStatisticsOverviewSheet(workbook, data.statisticsOverview, data.filters);

      // Add Age Group Distribution sheet
      this.addAgeGroupDistributionSheet(workbook, data.ageGroupDistribution, data.filters);

      // Add Special Population Registry sheet
      this.addSpecialPopulationSheet(workbook, data.specialPopulationRegistry, data.filters);

      // Add Monthly Revenue sheet (only if data is available - not mock)
      if (data.monthlyRevenue) {
        this.addMonthlyRevenueSheet(workbook, data.monthlyRevenue, data.filters);
      }

      // Add Population Distribution by Street sheet
      this.addPopulationDistributionSheet(workbook, data.populationDistributionByStreet, data.filters);

      // Add Document Types Issued sheet
      this.addDocumentTypesIssuedSheet(workbook, data.documentTypesIssued, data.filters);

      // Add Most Requested Services sheet (only if data is available - not mock)
      if (data.mostRequestedServices) {
        this.addMostRequestedServicesSheet(workbook, data.mostRequestedServices, data.filters);
      }

      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Barangay_Reports_${timestamp}.xlsx`;
      
      saveAs(dataBlob, filename);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw new Error('Failed to export data to Excel');
    }
  }

  /**
   * Export all report data to Word document
   */
  async exportToWord(data: ExportData): Promise<void> {
    try {
      const htmlContent = this.generateWordContent(data);
      
      // Create blob with HTML content
      const blob = new Blob([htmlContent], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `Barangay_Reports_${timestamp}.doc`;
      
      saveAs(blob, filename);
    } catch (error) {
      console.error('Error exporting to Word:', error);
      throw new Error('Failed to export data to Word');
    }
  }

  // Helper methods for Excel export
  private addStatisticsOverviewSheet(workbook: XLSX.WorkBook, data: StatisticsOverview, filters: ReportsFilters) {
    const worksheetData = [
      ['Statistics Overview'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Quarter', filters.quarter || 'All Quarters'],
      ['Filter: Street', filters.street || 'All Streets'],
      [''],
      ['Metric', 'Value'],
      ['Total Residents', data.totalResidents],
      ['Total Households', data.totalHouseholds],
      ['Active Barangay Officials', data.activeBarangayOfficials],
      ['Total Blotter Cases', data.totalBlotterCases],
      ['Total Issued Clearance', data.totalIssuedClearance],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Statistics Overview');
  }

  private addAgeGroupDistributionSheet(workbook: XLSX.WorkBook, data: AgeGroupDistribution[], filters: ReportsFilters) {
    const worksheetData = [
      ['Age Group Distribution'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Quarter', filters.quarter || 'All Quarters'],
      [''],
      ['Age Group', 'Percentage'],
      ...data.map(item => [item.name, `${item.percentage}%`])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Age Groups');
  }

  private addSpecialPopulationSheet(workbook: XLSX.WorkBook, data: SpecialPopulationRegistry[], filters: ReportsFilters) {
    const worksheetData = [
      ['Special Population Registry'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Quarter', filters.quarter || 'All Quarters'],
      [''],
      ['Category', 'Percentage'],
      ...data.map(item => [item.name, `${item.percentage}%`])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Special Population');
  }

  private addMonthlyRevenueSheet(workbook: XLSX.WorkBook, data: MonthlyRevenue[], filters: ReportsFilters) {
    const worksheetData = [
      ['Monthly Revenue Collection'],
      ['Filter: Year', filters.year || 'All Years'],
      [''],
      ['Month', 'Revenue (₱)'],
      ...data.map(item => [item.timeLabel, item.value])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Revenue');
  }

  private addPopulationDistributionSheet(workbook: XLSX.WorkBook, data: PopulationDistributionByStreet[], filters: ReportsFilters) {
    const worksheetData = [
      ['Population Distribution by Street'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Street', filters.street || 'All Streets'],
      [''],
      ['Street', 'Population'],
      ...data.map(item => [item.label, item.value])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Population by Street');
  }

  private addDocumentTypesIssuedSheet(workbook: XLSX.WorkBook, data: DocumentTypesIssued[], filters: ReportsFilters) {
    const worksheetData = [
      ['Document Types Issued'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Quarter', filters.quarter || 'All Quarters'],
      [''],
      ['Document Type', 'Count'],
      ...data.map(item => [item.label, item.value])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Document Types');
  }

  private addMostRequestedServicesSheet(workbook: XLSX.WorkBook, data: MostRequestedService[], filters: ReportsFilters) {
    const worksheetData = [
      ['Most Requested Services'],
      ['Filter: Year', filters.year || 'All Years'],
      ['Filter: Quarter', filters.quarter || 'All Quarters'],
      [''],
      ['Service', 'Requested', 'Completed', 'Avg Processing Days', 'Fees Collected (₱)'],
      ...data.map(item => [
        item.service,
        item.requested,
        item.completed,
        item.avgProcessingTimeInDays,
        item.feesCollected
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Requested Services');
  }

  // Helper method for Word export
  private generateWordContent(data: ExportData): string {
    const timestamp = new Date().toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Barangay Management System - Reports</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #1e40af; margin-top: 30px; }
          table { border-collapse: collapse; width: 100%; margin: 10px 0; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f0f8ff; }
          .summary { background-color: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0; }
          .filter-info { background-color: #fef7cd; padding: 10px; margin: 10px 0; border-radius: 5px; }
        </style>
      </head>
      <body>
        <h1>Barangay Management System - Reports</h1>
        <p><strong>Generated on:</strong> ${timestamp}</p>
        
        <div class="filter-info">
          <strong>Filters Applied:</strong>
          Year: ${data.filters.year || 'All Years'} | 
          Quarter: ${data.filters.quarter || 'All Quarters'} | 
          Street: ${data.filters.street || 'All Streets'}
        </div>

        <h2>Statistics Overview</h2>
        <div class="summary">
          <p><strong>Total Residents:</strong> ${data.statisticsOverview.totalResidents.toLocaleString()}</p>
          <p><strong>Total Households:</strong> ${data.statisticsOverview.totalHouseholds.toLocaleString()}</p>
          <p><strong>Active Barangay Officials:</strong> ${data.statisticsOverview.activeBarangayOfficials.toLocaleString()}</p>
          <p><strong>Total Blotter Cases:</strong> ${data.statisticsOverview.totalBlotterCases.toLocaleString()}</p>
          <p><strong>Total Issued Clearance:</strong> ${data.statisticsOverview.totalIssuedClearance.toLocaleString()}</p>
        </div>

        <h2>Age Group Distribution</h2>
        <table>
          <tr><th>Age Group</th><th>Percentage</th></tr>
          ${data.ageGroupDistribution.map(item => `
            <tr><td>${item.name}</td><td>${item.percentage}%</td></tr>
          `).join('')}
        </table>

        <h2>Special Population Registry</h2>
        <table>
          <tr><th>Category</th><th>Percentage</th></tr>
          ${data.specialPopulationRegistry.map(item => `
            <tr><td>${item.name}</td><td>${item.percentage}%</td></tr>
          `).join('')}
        </table>

        ${data.monthlyRevenue ? `
        <h2>Monthly Revenue Collection</h2>
        <table>
          <tr><th>Month</th><th>Revenue (₱)</th></tr>
          ${data.monthlyRevenue.map(item => `
            <tr><td>${item.timeLabel}</td><td>₱${item.value.toLocaleString()}</td></tr>
          `).join('')}
        </table>
        <div class="summary">
          <p><strong>Total Revenue:</strong> ₱${data.monthlyRevenue.reduce((sum, item) => sum + item.value, 0).toLocaleString()}</p>
          <p><strong>Average Monthly Revenue:</strong> ₱${data.monthlyRevenue.length > 0 ? Math.round(data.monthlyRevenue.reduce((sum, item) => sum + item.value, 0) / data.monthlyRevenue.length).toLocaleString() : '0'}</p>
        </div>
        ` : ''}

        <h2>Population Distribution by Street</h2>
        <table>
          <tr><th>Street</th><th>Population</th></tr>
          ${data.populationDistributionByStreet.map(item => `
            <tr><td>${item.label}</td><td>${item.value.toLocaleString()}</td></tr>
          `).join('')}
        </table>

        <h2>Document Types Issued</h2>
        <table>
          <tr><th>Document Type</th><th>Count</th></tr>
          ${data.documentTypesIssued.map(item => `
            <tr><td>${item.label}</td><td>${item.value.toLocaleString()}</td></tr>
          `).join('')}
        </table>

        ${data.mostRequestedServices ? `
        <h2>Most Requested Services</h2>
        <table>
          <tr>
            <th>Service</th>
            <th>Requested</th>
            <th>Completed</th>
            <th>Avg Processing Days</th>
            <th>Fees Collected (₱)</th>
          </tr>
          ${data.mostRequestedServices.map(item => `
            <tr>
              <td>${item.service}</td>
              <td>${item.requested.toLocaleString()}</td>
              <td>${item.completed.toLocaleString()}</td>
              <td>${item.avgProcessingTimeInDays}</td>
              <td>₱${item.feesCollected.toLocaleString()}</td>
            </tr>
          `).join('')}
        </table>
        <div class="summary">
          <p><strong>Total Requests:</strong> ${data.mostRequestedServices.reduce((sum, item) => sum + item.requested, 0).toLocaleString()}</p>
          <p><strong>Total Completed:</strong> ${data.mostRequestedServices.reduce((sum, item) => sum + item.completed, 0).toLocaleString()}</p>
          <p><strong>Overall Completion Rate:</strong> ${data.mostRequestedServices.length > 0 ? Math.round((data.mostRequestedServices.reduce((sum, item) => sum + item.completed, 0) / data.mostRequestedServices.reduce((sum, item) => sum + item.requested, 0)) * 100) : 0}%</p>
          <p><strong>Total Fees Collected:</strong> ₱${data.mostRequestedServices.reduce((sum, item) => sum + item.feesCollected, 0).toLocaleString()}</p>
        </div>
        ` : ''}

        <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #ccc; text-align: center; color: #666;">
          <p>Generated by Barangay Management System</p>
        </div>
      </body>
      </html>
    `;
  }
}

// Create singleton instance
export const exportService = new ExportService();