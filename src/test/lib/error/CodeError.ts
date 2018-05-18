import { strictEqual } from 'assert'
import { CodeError } from '../../../lib/error/CodeError'

describe('CodeError', () => {
	it('should work properly', () => {
		const message = 'This is a bad error!'
		const code = 'EBAD'
		const name = 'TestError'

		const error = new CodeError(message, code, name)

		strictEqual(error.message, message)
		strictEqual(error.code, code)
		strictEqual(error.name, name)
	})

	it('should be constructable without a name', () => {
		const message = 'This is a bad error!'
		const code = 'EBAD'

		const error = new CodeError(message, code)

		strictEqual(error.message, message)
		strictEqual(error.code, code)
	})

	it('should be constructable without a name and a code', () => {
		const message = 'This is a bad error!'

		const error = new CodeError(message)

		strictEqual(error.message, message)
	})
})
