// server/services/emailService.js
const logger = require('../utils/logger');

/**
 * Sends an email (currently logs to console).
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Email body text
 * @param {string} html - Email body HTML (optional)
 */
const sendEmail = async (to, subject, text, html = '') => {
    try {
        // In a real application, you would use a library like nodemailer here.
        // For now, we will just log the email details to the console.

        console.log('---------------------------------------------------');
        console.log(`MOCK EMAIL TO: ${to}`);
        console.log(`SUBJECT: ${subject}`);
        console.log(`TEXT: ${text}`);
        if (html) {
            console.log(`HTML: ${html}`);
        }
        console.log('---------------------------------------------------');

        logger.info(`Mock email sent to ${to} with subject: ${subject}`);
        return true;
    } catch (error) {
        logger.error('Error sending email:', error);
        return false;
    }
};

module.exports = {
    sendEmail
};
