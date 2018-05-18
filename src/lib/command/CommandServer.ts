import { Connection, TokenServer, TokenServerOptions } from 'token-server/build'
import { CodeError } from '../error/CodeError'
import { ErrorSerializer } from '../error/ErrorSerializer'
import { Command } from './Command'

export type CommandImplementation = (payload: any, connection: Connection) => Promise<any>

export class CommandServer extends TokenServer {
	private commands: {
		[command: number]: CommandImplementation
	} = {}

	constructor(options: TokenServerOptions) {
		super(options)
		this.initEvents()
	}

	public command(command: number, fn: CommandImplementation): void {
		this.commands[command] = fn
	}

	private initEvents() {
		this.on('token', async (token, connection) => {
			const {
				id,
				command,
				payload,
			} = Command.parse(token)

			try {
				if (!this.commands[command]) {
					throw new CodeError(`Command ${command} not found.`, 'ENOTFOUND', 'CommandError')
				}

				const result = await this.commands[command](payload, connection)

				connection.send(Command.tokenize({
					command,
					id,
					payload: result,
				}))
			} catch (error) {
				const payload = ErrorSerializer.serialize(error)

				connection.send(Command.tokenize({
					command: 255,
					id,
					payload,
				}))
			}
		})
	}
}
