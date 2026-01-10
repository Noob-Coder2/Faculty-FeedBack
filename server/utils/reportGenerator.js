// server/utils/reportGenerator.js
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

/**
 * Generates a PDF report for ratings.
 * @param {Array} data - The data to report.
 * @param {Object} res - The express response object to stream to.
 */
const generatePdfReport = (data, res) => {
    const doc = new PDFDocument();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=ratings-report.pdf');

    doc.pipe(res);

    doc.fontSize(20).text('Faculty Ratings Report', { align: 'center' });
    doc.moveDown();

    data.forEach((item, index) => {
        doc.fontSize(14).text(`${index + 1}. ${item.facultyName || 'Unknown Faculty'}`);
        doc.fontSize(12).text(`Subject: ${item.subject || 'N/A'}`);
        doc.text(`Average Rating: ${item.averageRating || 'N/A'}`);
        doc.moveDown();
    });

    doc.end();
};

/**
 * Generates an Excel report for ratings.
 * @param {Array} data - The data to report.
 * @param {Object} res - The express response object to stream to.
 */
const generateExcelReport = async (data, res) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Ratings');

    worksheet.columns = [
        { header: 'Faculty Name', key: 'facultyName', width: 30 },
        { header: 'Subject', key: 'subject', width: 20 },
        { header: 'Average Rating', key: 'averageRating', width: 15 },
        { header: 'Total Feedbacks', key: 'totalFeedbacks', width: 15 }
    ];

    data.forEach(item => {
        worksheet.addRow({
            facultyName: item.facultyName,
            subject: item.subject,
            averageRating: item.averageRating,
            totalFeedbacks: item.totalFeedbacks
        });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=ratings-report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
};

module.exports = {
    generatePdfReport,
    generateExcelReport
};
