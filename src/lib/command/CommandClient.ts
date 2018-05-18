import { TokenClientOptions } from 'token-server/build'
import { CodeError } from '../error/CodeError'
import { ErrorSerializer } from '../error/ErrorSerializer'
import { QueueClient } from '../queue/QueueClient'
import { Command } from './Command'
import { IdManager } from './IdManager'

export class CommandClient extends QueueClient {
	private ids = new IdManager(Math.pow(2, 16) - 1)
	private callbacks: {
		[id: number]: (error: Error | null, result?: any) => void
	} = {}

	constructor(options: TokenClientOptions) {
		super(options)

		this.initEvents()
	}

	public async command(command: number, payload: any, expiresIn: number): Promise<any> {
		if (command === 255) {
			throw new Error(`Command 255 is reserved for errors.`)
		}

		const id = this.ids.reserve()
		const token = Command.tokenize({
			id,
			command,
			payload,
		})

		// Add the token to the queue.
		this.sendToken(token, expiresIn)

		const response = this.createResponsePromise(id)
		const timeout = this.createTimeoutPromise(id, expiresIn)

		return Promise.race([response, timeout])
	}

	private initEvents() {
		this.on('token', (token) => {
			const data = Command.parse(token)

			if (this.callbacks[data.id]) {
				if (data.command === 255) {
					const error = ErrorSerializer.deserialize(data.payload)
					this.callbacks[data.id](error)
				} else if (this.callbacks[data.id]) {
					this.callbacks[data.id](null, data.payload)
				}
			}
		})
	}

	private createTimeoutPromise(id: number, expiresIn: number): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			setTimeout(() => {
				delete this.callbacks[id]
				reject(new CodeError(`Command timed out after ${expiresIn} milliseconds!`, 'ETIMEOUT', 'TimeoutError'))
			})
		})
	}

	private createResponsePromise(id: number) {
		return new Promise<any>((resolve, reject) => {
			this.callbacks[id] = (error: Error | null, result?: any) => {
				delete this.callbacks[id]
				if (error) {
					reject(error)
				} else {
					resolve(result)
				}
			}
		})
	}
}