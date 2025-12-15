// File: backend/server/utils/sanitize.js
// Utility functions để sanitize input và ngăn XSS attacks

/**
 * Escape các ký tự HTML đặc biệt để ngăn XSS
 * @param {string} input - Chuỗi cần sanitize
 * @returns {string} - Chuỗi đã được escape
 */
export const escapeHtml = (input) => {
    if (typeof input !== 'string') return input;

    const htmlEscapes = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
};

/**
 * Sanitize một string input: trim và escape HTML
 * @param {string} input - Chuỗi cần sanitize
 * @returns {string} - Chuỗi đã được sanitize
 */
export const sanitizeString = (input) => {
    if (typeof input !== 'string') return input;
    return escapeHtml(input.trim());
};

/**
 * Sanitize một object chứa các string fields
 * @param {object} obj - Object cần sanitize
 * @param {string[]} fields - Danh sách tên field cần sanitize
 * @returns {object} - Object đã được sanitize
 */
export const sanitizeObject = (obj, fields) => {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized = { ...obj };

    for (const field of fields) {
        if (sanitized[field] && typeof sanitized[field] === 'string') {
            sanitized[field] = sanitizeString(sanitized[field]);
        }
    }

    return sanitized;
};

/**
 * Validate và sanitize email
 * @param {string} email - Email cần validate
 * @returns {string|null} - Email đã sanitize hoặc null nếu không hợp lệ
 */
export const sanitizeEmail = (email) => {
    if (typeof email !== 'string') return null;

    const trimmed = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmed)) return null;

    return trimmed;
};

/**
 * Sanitize inGameName - cho phép chữ, số, underscore
 * @param {string} name - Tên cần sanitize
 * @returns {string} - Tên đã sanitize
 */
export const sanitizeInGameName = (name) => {
    if (typeof name !== 'string') return '';

    // Chỉ giữ lại chữ, số, underscore, space và một số ký tự Minecraft thường gặp
    return name.trim().replace(/[<>\"'&]/g, '');
};

export default {
    escapeHtml,
    sanitizeString,
    sanitizeObject,
    sanitizeEmail,
    sanitizeInGameName,
};
