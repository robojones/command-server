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

	/**
	 * Define a command that can be executed from the client.
	 * @param command The command number. (number from 0-254)
	 * @param fn The command implementation.
	 * Must return a promise.
	 * The return value will be sent back to the client.
	 */
	public command(command: number, fn: CommandImplementation): void {
		this.commands[command] = fn
	}

	private initEvents() {
		this.on('token', async (token, connection) => {
			try {
				const {
					id,
					command,
					payload,
				} = Command.parse(token)

				this.runCommand(id, command, payload, connection)
			} catch (error) {
				// This may only be a parse / serialize error.
				this.emit('error', error)
			}
		})
	}

	/**
	 * Runs a command and writes the response / error to the connection.
	 * If an error occurs during the serialisation of the error, the returned promise will be rejected.
	 */
	private async runCommand(
		id: number,
		command: number,
		payload: any,
		connection: Connection,
	): Promise<void> {
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
	}
}
