const Notification = require('../models/Notification');

/**
 * Centrally creates a notification document.
 * @param {object} params
 * @param {string} params.recipient - User ID of the recipient
 * @param {string} params.title
 * @param {string} params.message
 * @param {string} params.type - Category / alert category
 * @param {string} params.priority - LOW, MEDIUM, HIGH, CRITICAL
 * @param {string} params.module - Module name (AUTH, ASSET, ALLOCATION, TRANSFER, MAINTENANCE, AUDIT)
 * @param {string} params.entityId - Primary key of related document
 */
const createNotification = async ({ recipient, title, message, type = 'SYSTEM', priority = 'LOW', module, entityId = null }) => {
  try {
    const notification = await Notification.create({
      recipient,
      title,
      message,
      type,
      priority,
      module,
      entityId
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification centrally:', error);
    return null;
  }
};

module.exports = {
  createNotification
};
