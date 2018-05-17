import { TokenClient, TokenClientOptions } from 'token-server'
import { Queue } from './Queue'
import { QueueItem } from './QueueItem'

/**
 * A client that stores tokens in a queue if they can not be sent immediately.
 * When the client reconnects, the items will be sent.
 */
export class QueueClient extends TokenClient {
	private queue = new Queue<Buffer>()

	constructor(options: TokenClientOptions) {
		super(options)

		this.applyEvents()
	}

	/**
	 * Tries to send a token.
	 * If not connected it waits until the connection is established and then sends the token.
	 * @param token The token that should be sent.
	 * @param expiresIn The time until the token expires in milliseconds.
	 */
	public sendToken(token: Buffer, expiresIn: number): void {
		const success = this.send(token)

		if (!success) {
			this.queue.add(token, expiresIn)
		}
	}

	private applyEvents() {
		this.on('connect', () => {
			// Start emptying the queue.
			while (!this.queue.isEmpty) {
				const item = this.queue.pop() as QueueItem<Buffer>
				this.sendToken(item.value, item.expiresIn)
			}
		})
	}
}
