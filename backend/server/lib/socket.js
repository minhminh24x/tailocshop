// File: backend/server/lib/socket.js
// WebSocket server for real-time notifications
import { Server } from 'socket.io';

let io = null;

/**
 * Initialize Socket.io server
 * @param {object} httpServer - HTTP server instance
 */
export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true
        },
        pingTimeout: 60000,
        pingInterval: 25000
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.io] Client connected: ${socket.id}`);

        // Join room based on user role or ID
        socket.on('join', (data) => {
            if (data.userId) {
                socket.join(`user:${data.userId}`);
                console.log(`[Socket.io] User ${data.userId} joined their room`);
            }
            if (data.role === 'ADMIN' || data.role === 'STAFF') {
                socket.join('admin-staff');
                console.log(`[Socket.io] ${data.role} joined admin-staff room`);
            }
        });

        // Leave room
        socket.on('leave', (data) => {
            if (data.userId) {
                socket.leave(`user:${data.userId}`);
            }
            socket.leave('admin-staff');
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    console.log('[Socket.io] Initialized');
    return io;
};

/**
 * Get Socket.io instance
 */
export const getIO = () => {
    if (!io) {
        console.warn('[Socket.io] Not initialized yet');
        return null;
    }
    return io;
};

// ============ Event Emitters ============

/**
 * Notify a specific user
 * @param {string} userId 
 * @param {string} event 
 * @param {object} data 
 */
export const notifyUser = (userId, event, data) => {
    const socket = getIO();
    if (socket) {
        socket.to(`user:${userId}`).emit(event, data);
    }
};

/**
 * Notify all admins and staff
 * @param {string} event 
 * @param {object} data 
 */
export const notifyAdminStaff = (event, data) => {
    const socket = getIO();
    if (socket) {
        socket.to('admin-staff').emit(event, data);
    }
};

/**
 * Broadcast to all connected clients
 * @param {string} event 
 * @param {object} data 
 */
export const broadcast = (event, data) => {
    const socket = getIO();
    if (socket) {
        socket.emit(event, data);
    }
};

// ============ Pre-defined Events ============

/**
 * Emit when a new order is created
 */
export const emitNewOrder = (order) => {
    notifyAdminStaff('new-order', {
        type: 'NEW_ORDER',
        message: `Đơn hàng mới #${order.orderNumber}`,
        order: {
            id: order.id,
            orderNumber: order.orderNumber,
            customerName: order.inGameName,
            status: order.status,
            createdAt: order.createdAt
        },
        timestamp: new Date()
    });
};

/**
 * Emit when order status changes (to customer)
 */
export const emitOrderStatusChange = (order) => {
    if (order.customerUserId) {
        notifyUser(order.customerUserId, 'order-status', {
            type: 'ORDER_STATUS_UPDATE',
            message: `Đơn hàng #${order.orderNumber} đã được cập nhật`,
            order: {
                id: order.id,
                orderNumber: order.orderNumber,
                status: order.status,
                paymentStatus: order.paymentStatus
            },
            timestamp: new Date()
        });
    }
};

/**
 * Emit low stock alert
 */
export const emitLowStockAlert = (item) => {
    notifyAdminStaff('low-stock', {
        type: 'LOW_STOCK_ALERT',
        message: `Sản phẩm "${item.name}" sắp hết hàng (còn ${item.stockQuantity})`,
        item: {
            id: item.id,
            name: item.name,
            stockQuantity: item.stockQuantity
        },
        timestamp: new Date()
    });
};

export default { initSocket, getIO, notifyUser, notifyAdminStaff, broadcast };
