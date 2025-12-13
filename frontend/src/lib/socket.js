// File: frontend/src/lib/socket.js
// Socket.io client for real-time notifications
import { io } from 'socket.io-client';

let socket = null;

/**
 * Initialize socket connection
 * @param {string} userId - Current user ID
 * @param {string} role - User role (ADMIN, STAFF, CUSTOMER, etc.)
 */
export const initSocket = (userId, role) => {
    if (socket?.connected) {
        console.log('[Socket.io] Already connected');
        return socket;
    }

    const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:8080';

    socket = io(SOCKET_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
        console.log('[Socket.io] Connected:', socket.id);

        // Join user-specific room
        if (userId) {
            socket.emit('join', { userId, role });
        }
    });

    socket.on('disconnect', (reason) => {
        console.log('[Socket.io] Disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('[Socket.io] Connection error:', error.message);
    });

    return socket;
};

/**
 * Get socket instance
 */
export const getSocket = () => socket;

/**
 * Disconnect socket
 */
export const disconnectSocket = () => {
    if (socket) {
        socket.emit('leave', {});
        socket.disconnect();
        socket = null;
        console.log('[Socket.io] Manually disconnected');
    }
};

/**
 * Subscribe to an event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function
 */
export const subscribeToEvent = (event, callback) => {
    if (!socket) {
        console.warn('[Socket.io] Not connected');
        return;
    }
    socket.on(event, callback);
};

/**
 * Unsubscribe from an event
 * @param {string} event - Event name
 * @param {Function} callback - Callback function (optional)
 */
export const unsubscribeFromEvent = (event, callback) => {
    if (!socket) return;
    if (callback) {
        socket.off(event, callback);
    } else {
        socket.off(event);
    }
};

export default { initSocket, getSocket, disconnectSocket, subscribeToEvent, unsubscribeFromEvent };
