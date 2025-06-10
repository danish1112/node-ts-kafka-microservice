"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const winston_1 = __importDefault(require("winston"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Logger setup
const logger = winston_1.default.createLogger({
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'logs/combined.log' })
    ]
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Proxy routes
app.use('/users', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
    changeOrigin: true,
    pathRewrite: { '^/users': '' }
}));
app.use('/blogs', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.BLOG_SERVICE_URL || 'http://localhost:3002',
    changeOrigin: true,
    pathRewrite: { '^/blogs': '' }
}));
app.use('/notifications', (0, http_proxy_middleware_1.createProxyMiddleware)({
    target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
    changeOrigin: true,
    pathRewrite: { '^/notifications': '' }
}));
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(http_status_codes_1.StatusCodes.OK).json({ status: 'API Gateway is running...' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    logger.error(err.message, { stack: err.stack });
    res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
});
app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});
exports.default = app;
