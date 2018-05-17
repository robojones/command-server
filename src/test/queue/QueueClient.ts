import { strictEqual } from 'assert'
import { IBeforeAndAfterContext, ITestCallbackContext } from 'mocha'
import { TokenServer } from 'token-server/build'
import { QueueClient } from '../../queue/QueueClient'
import { clientOptions, serverOptions } from '../options'

interface Context extends IBeforeAndAfterContext, ITestCallbackContext {
	client: QueueClient
	server: TokenServer
}

function setupServer(this: Context, cb) {
	this.server = new TokenServer(serverOptions)

	this.server.once('connect', () => cb())
}

function setupClient(this: Context, cb) {
	this.client = new QueueClient(clientOptions)

	this.client.once('connect', () => {
		cb()
	})
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

describe('QueueClient', () => {
	describe('#sendToken()', () => {
		beforeEach(setupServer)
		beforeEach(setupClient)
		afterEach(closeClient)
		afterEach(closeServer)

		it ('resend tokens when the client gets back online', function (this: Context, cb) {
			const msg = 'hello'

			this.server.on('token', (token) => {
				// Token should arrive.
				strictEqual(token.toString(), msg)
				cb()
			})

			this.client.once('close', () => {
				// Send → client is closed → enqueue
				this.client.sendToken(Buffer.from(msg), 1000)

				// Connect again → token will be sent
				this.client.connect()
			})

			// Close client to initialize the test..
			this.client.close()
		})
	})
})
