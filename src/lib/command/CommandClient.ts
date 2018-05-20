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
			throw new CodeError(`Command 255 is reserved for errors.`, 'ERESERVED', 'CommandError')
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
			try {
				const data = Command.parse(token)

				if (this.callbacks[data.id]) {
					if (data.command === 255) {
						const error = ErrorSerializer.deserialize(data.payload)
						this.callbacks[data.id](error)
					} else {
						this.callbacks[data.id](null, data.payload)
					}
				}
			} catch (error) {
				this.emit('error', error)
			}
		})
	}

	private createTimeoutPromise(id: number, expiresIn: number): Promise<any> {
		return new Promise<any>((resolve, reject) => {
			setTimeout(() => {
				this.ids.release(id)
				delete this.callbacks[id]
				reject(new CodeError(`Command timed out after ${expiresIn} milliseconds!`, 'ETIMEOUT', 'CommandError'))
			}, expiresIn)
		})
	}

	private createResponsePromise(id: number) {
		return new Promise<any>((resolve, reject) => {
			this.callbacks[id] = (error: Error | null, result?: any) => {
				this.ids.release(id)
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
