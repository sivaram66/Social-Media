const brevo = require('@getbrevo/brevo');
const logger = require('./logger');

// Initialize Brevo Client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);

/**
 * Send an email using Brevo
 * @param {string} toEmail - Recipient email
 * @param {string} subject - Email subject
 * @param {string} htmlContent - Email body (HTML)
 */
const sendEmail = async (toEmail, subject, htmlContent) => {
  try {
    const sendSmtpEmail = new brevo.SendSmtpEmail();

    sendSmtpEmail.subject = subject;
    sendSmtpEmail.htmlContent = htmlContent;
    sendSmtpEmail.sender = { name: "Social Media Social", email: process.env.SENDER_EMAIL };
    sendSmtpEmail.to = [{ email: toEmail }];

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    logger.verbose(`Email sent to ${toEmail}. MessageId: ${data.messageId}`);
    return true;
  } catch (error) {
    logger.critical("Failed to send email:", error.response ? error.response.body : error.message);
    return false;
  }
};

module.exports = { sendEmail };