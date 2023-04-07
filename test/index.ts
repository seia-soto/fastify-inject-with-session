import useFastifyCookie from '@fastify/cookie';
import anyTest, {type TestFn} from 'ava';
import useFastify from 'fastify';
import {useInjectWithSession} from '../src/index.js';

const createServer = async () => {
	const fastify = useFastify({
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

	await fastify.register(useFastifyCookie);

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

const test = anyTest as TestFn<{
	server: Awaited<ReturnType<typeof createServer>>;
	inject: ReturnType<Awaited<ReturnType<typeof useInjectWithSession>>>;
}>;

test.serial.before(async t => {
	const server = await createServer();
	const useInject = useInjectWithSession();

	t.context.server = server;
	t.context.inject = useInject(server);
});

test.serial('set cookie', async t => {
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
