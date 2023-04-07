# Fastify Inject with Session

This library automates the client cookie management for testing with Fastify injection API based on tough-cookie.
You can use this library both on CJS and ESM environment.

## Usage

Use `useInjectWithSession` export both on CJS and ESM.

Calling this function will create a context to save and retrieve cookies before and after the request.
The only argument is called `namespace` which is valid domain name to set cookie.
Internally, the protocol is set to `https` to support cookies with secure flag and `__Host-` prefixed cookies.

```typescript
const namespace = 'test.example.org';
const useInject = useInjectWithSession(namespace);
```

After creating a context, call `useInject` function with your Fastify instance again to hook up the injector.
Now, you can use the output — `inject` function to manage cookies automatically.

```typescript
const inject = useInject(fastify);
```

Calling `inject` function is completely same as calling `fastify.inject` function.
We just pass the raw response object after processing internally.

### Internals

**Why not `response.cookies` instead of `response.headers['set-cookie']`**

We never use `light-my-request` — internal Fastify injector library's `response.cookies` property that automatically parses set-cookie header.
It's because `tough-cookie` already implements the exact same functionality.

`tough-cookie` will validate the input when set-cookie header, any kind of cookie data, or whatever passed to `tough-cookie`.
So it would be make our work double if we access the getter of `response.cookies`.

## Example

The following example shows how to implement your test code using `fastify-inject-with-session` with ava.

```typescript
import anyTest, {type TestFn} from 'ava';
import {useInjectWithSession} from 'fastify-inject-with-session';
import {createServer} from '<somewhere your server being initialized>';

const test = anyTest as TestFn<{
	server: Awaited<ReturnType<typeof createServer>>;
	inject: ReturnType<Awaited<ReturnType<typeof useInjectWithSession>>>;
}>;

test.serial.before(async t => {
	const server = await createServer({
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
	const useInject = useInjectWithSession();

	t.context.server = server;
	t.context.inject = useInject(server);
});
```

## License

This package is distributed under ISC license.
