"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_1 = __importDefault(require("@fastify/cookie"));
const ava_1 = __importDefault(require("ava"));
const fastify_1 = __importDefault(require("fastify"));
const index_js_1 = require("../src/index.js");
const createServer = async () => {
    const fastify = (0, fastify_1.default)({
        logger: {
            transport: {
                target: 'pino-pretty',
                options: {
                    translateTime: 'HH:MM:ss Z',
                    ignore: 'pid,hostname',
                },
            },
        },
    });
    await fastify.register(cookie_1.default);
    fastify.get('/', async (_request, reply) => {
        void reply.setCookie('cookie', 'sample');
        return '';
    });
    fastify.get('/isCookieSet', async (request, _reply) => {
        if (request.cookies.cookie) {
            return 'ok';
        }
        return 'notok';
    });
    return fastify;
};
const test = ava_1.default;
test.serial.before(async (t) => {
    const server = await createServer();
    const useInject = (0, index_js_1.useInjectWithSession)();
    t.context.server = server;
    t.context.inject = useInject(server);
});
test.serial('set cookie', async (t) => {
    await t.context.inject({
        url: '/',
        method: 'GET',
    });
    const response = await t.context.inject({
        url: '/isCookieSet',
        method: 'GET',
    });
    t.is(response.payload, 'ok');
});
