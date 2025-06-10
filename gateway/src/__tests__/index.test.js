"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const http_proxy_middleware_1 = require("http-proxy-middleware");
jest.mock('http-proxy-middleware');
describe('API Gateway', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should return 200 OK for health check endpoint', () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(server_1.default).get('/health');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ status: 'API Gateway is running' });
    }));
    it('should setup proxy middleware for user service', () => {
        expect(http_proxy_middleware_1.createProxyMiddleware).toHaveBeenCalledWith(expect.objectContaining({
            target: process.env.USER_SERVICE_URL || 'http://localhost:3001',
            changeOrigin: true,
            pathRewrite: { '^/users': '' }
        }));
    });
    it('should setup proxy middleware for blog service', () => {
        expect(http_proxy_middleware_1.createProxyMiddleware).toHaveBeenCalledWith(expect.objectContaining({
            target: process.env.BLOG_SERVICE_URL || 'http://localhost:3002',
            changeOrigin: true,
            pathRewrite: { '^/blogs': '' }
        }));
    });
    it('should setup proxy middleware for notification service', () => {
        expect(http_proxy_middleware_1.createProxyMiddleware).toHaveBeenCalledWith(expect.objectContaining({
            target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3003',
            changeOrigin: true,
            pathRewrite: { '^/notifications': '' }
        }));
    });
});
