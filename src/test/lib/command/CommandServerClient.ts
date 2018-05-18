import { deepEqual, strictEqual } from 'assert'
import * as assert from 'assert'
import { IBeforeAndAfterContext, ITestCallbackContext } from 'mocha'
import { Command } from '../../../lib/command/Command'
import { CommandClient } from '../../../lib/command/CommandClient'
import { CommandServer } from '../../../lib/command/CommandServer'
import { clientOptions, serverOptions } from '../../options'

interface Context extends IBeforeAndAfterContext, ITestCallbackContext {
	server: CommandServer
	client: CommandClient
}

function setupServer(this: Context, cb) {
	this.server = new CommandServer(serverOptions)

	this.server.once('connect', () => cb())
}

function setupClient(this: Context, cb) {
	this.client = new CommandClient(clientOptions)

	this.client.once('connect', () => cb())
}

function closeServer (this: Context, cb) {
	if (!this.server) {
		return cb()
	}

	this.server.once('close', () => {
		cb()
	})

	if (!this.server.close()) {
		cb()
	}
}

function closeClient (this: Context, cb) {
	if (!this.client) {
		return cb()
	}

	this.client.once('close', () => cb())

	if (!this.client.close()) {
		// Client already closed.
		cb()
	}
}

describe('CommandServer & CommandClient', () => {
	beforeEach(setupServer)
	beforeEach(setupClient)
	afterEach(closeClient)
	afterEach(closeServer)

	it('should execute a command.', async function (this: Context) {
		const origPayload = {
			test: 'args',
		}
		const origResult = {
			test: 'result',
		}

		this.server.command(1, async (payload) => {
			deepEqual(payload, origPayload)

			return origResult
		})

		const result = await this.client.command(1, origPayload, 1000)

		deepEqual(result, origResult)
	})

	it('should transmit an error when the command is not found', async function (this: Context) {
		try {
			await this.client.command(1, true, 1000)
		} catch (err) {
			strictEqual(err.code, 'ENOTFOUND')
			strictEqual(err.name, 'CommandError')
			return
		}

		throw new Error('No error thrown.')
	})

	it('should throw an error when trying to start command 255 (reserved)', async function (this: Context) {
		try {
			await this.client.command(255, true, 1000)
		} catch (err) {
			strictEqual(err.code, 'ERESERVED')
			strictEqual(err.name, 'CommandError')
			return
		}

		throw new Error('No error thrown.')
	})

	it('should throw an error when the expire time is reached', async function (this: Context) {
		this.server.command(1, async () => {
			// never resolve.
			return new Promise(() => null)
		})

		const start = Date.now()
		const expiresIn = 20

		try {
			await this.client.command(1, true, expiresIn)
		} catch (err) {
			const end = Date.now()

			strictEqual(err.code, 'ETIMEOUT')
			strictEqual(err.name, 'CommandError')
			assert(end - start >= expiresIn)
			return
		}

		throw new Error('No error thrown.')
	})

	it('should ignore responses if there is no callback.', async function (this: Context) {
		this.server.command(1, async (payload, connection) => {

			// Send a response with an unknown id.
			connection.send(Command.tokenize({
				command: 1,
				id: 7503,
				payload: 'test',
			}))

			return null
		})

		await this.client.command(1, null, 1000)
		// If no error occurs, the unknown id was ignored.
	})

	it('should emit serialisation errors', function (this: Context, cb) {
		this.server.on('error', (error) => {
			strictEqual(error.name, 'TypeError')
			cb()
		})

		// This should produce a TypeError on the server.
		this.client.send(Buffer.allocUnsafe(1))
	})
})
