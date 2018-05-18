# command-server

Execute commands via a SSL encrypted connection.

[![CircleCI](https://circleci.com/gh/robojones/command-server.svg?style=svg)](https://circleci.com/gh/robojones/command-server)

[![Test Coverage](https://api.codeclimate.com/v1/badges/e592d669c9cf5773e23c/test_coverage)](https://codeclimate.com/github/robojones/command-server/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/e592d669c9cf5773e23c/maintainability)](https://codeclimate.com/github/robojones/command-server/maintainability)

## Example

This example shows, how a client and a server can be connected using self-signed certificates.

For some help on how to generate self-signed certificates [see this comment](https://github.com/nodejs/help/issues/253#issuecomment-242425636).

```javascript
const { CommandServer, CommandClient } = require('command-server')

/* ### Server ### */

const server = new CommandServer({
	host: 'localhost',
	port: 8090,

	key: fs.readFileSync('certs/server/server.key'),
	cert: fs.readFileSync('certs/server/server.crt'),
	ca: fs.readFileSync('certs/ca/ca.crt')
	requestCert: true, // ask for a client cert
})

// Implement command 0.
server.command(0, (payload) => {
	console.log('Server received:', payload)
	return 'result from the server'
})

/* ### Client ### */

const client = new CommandClient({
	host: 'localhost',
	port: 8090,

	key: fs.readFileSync('certs/client/client.key'),
	cert: fs.readFileSync('certs/client/client.crt'),
	ca: fs.readFileSync('certs/ca/ca.crt')
})

// Execute the command 0.
client.command(0, 'message from the client', 1000).then((result) => {
	console.log('Client received::', result)
})
```

## API

### CommandClient

Extends the [TokenClient](https://www.npmjs.com/package/token-server#tokenclient) from the token-server package.

#### CommandClient#command()

Executes a command on the server and then returns the **result as a promise**.
The returned promise will be **rejected** when no response arrives before the expiresIn time has passed. The promise will also be rejected if an error occurs on the server during the execution of the command.

```typescript
client.command(command, payload, expiresIn)
```

- **command** `<number>` A number identifying the command you want to execute. The number must lay between 0 and 254.
- **payload** `<any>` A parameter that will be passed to the command.
	It may be of any value that can be stringified using `JSON.stringify()` so it must not be `undefined`.
- **expiresIn** `<number>` Milliseconds until the command times out.

### CommandServer

Extends the [TokenServer](https://www.npmjs.com/package/token-server#tokenserver) from the token-server package.

#### CommandServer#command()

Executes a command on the server and then returns the **result as a promise**.
The returned promise will be **rejected** when no response arrives before the expiresIn time has passed. The promise will also be rejected if an error occurs on the server during the execution of the command.

```typescript
client.command(command, (payload, connection) => result)
```

- **command** `<number>` A number identifying the command. The number lay be between 0 and 254.
- **payload** `<any>` The value that was passed as the payload parameter to the CommandClient#command().
- **connection** `<Connection>` [see here](https://www.npmjs.com/package/token-server#connection) The connection that triggered the command.
- **result** `<any>` A result that will be transmitted as response to the client.
	It may be of any value that can be stringified using `JSON.stringify()` so it must not be `undefined`.
