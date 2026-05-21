const Notification = require('../models/Notification');

/**
 * Simulates sending an email notification by logging to console and persisting to DB logs.
 * @param {string} recipient - The recipient's email address
 * @param {string} subject - The subject of the email
 * @param {string} body - The body message of the email
 */
const sendMailMock = async (recipient, subject, body) => {
  try {
    // 1. Log to console in color style
    console.log('\x1b[35m%s\x1b[0m', `📧 [EMAIL SIMULATOR] Dispatched email:`);
    console.log(`   To:      ${recipient}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Message: ${body}\n`);

    // 2. Persist to notifications list
    await Notification.create({
      recipient,
      subject,
      body
    });
  } catch (err) {
    console.error('Failed to write notification audit:', err.message);
  }
};

module.exports = {
  sendMailMock
};
