// File: server/routes/auth.route.js
import express from 'express';
import { register, login, logout } from '../controllers/auth.controller.js';

const router = express.Router();

// Định nghĩa tuyến đường cho 'register', 'login' và 'logout'
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
export default router;