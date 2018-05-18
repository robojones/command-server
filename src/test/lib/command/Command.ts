import * as assert from 'assert'
import { deepEqual, throws } from 'assert'
import { Command } from '../../../lib/command/Command'

describe('Command', () => {
	describe('tokenize & parse', () => {
		it('should correctly encode and decode', () => {
			const data = {
				command: 10,
				id: 12435,
				payload: {
					hallo: 'asdf',
				},
			}

			const token = Command.tokenize(data)

			assert(token instanceof Buffer, 'is not a buffer')

			const result = Command.parse(token)

			deepEqual(result, data)
		})
	})

	describe('parse', () => {
		it('should throw if the buffer is to short', () => {
			throws(() => {
				Command.parse(Buffer.allocUnsafe(2))
			})
		})
	})
})
