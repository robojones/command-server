import * as assert from 'assert'
import { AssertionError } from 'assert'
import ErrorSerializer from '../../command/ErrorSerializer'

function errorAssert (actual: any, expected: any) {
	const expectedProps = Object.keys(expected)
	expectedProps.push('name', 'message', 'stack')

	// Compare values.
	for (const prop of expectedProps) {
		if (actual[prop] !== expected[prop]) {
			throw new AssertionError({
				message: `"${actual}" errorAssert "${expected}". `
				+ `The property "${prop}" is different. `
				+ `actual: "${actual[prop]}" expected: "${expected[prop]}"`,
			})
		}
	}

	const actualProps = Object.keys(actual)
	// Compare values backwards.
	for (const prop of actualProps) {
		if (actual[prop] !== expected[prop]) {
			throw new AssertionError({
				message: `"${actual}" errorAssert "${expected}". `
				+ `The property "${prop}" is different. `
				+ `actual: "${actual[prop]}" expected: "${expected[prop]}"`,
			})
		}
	}
}

describe('ErrorSerializer', () => {
	describe('serialize', () => {
		it ('should serialize Error instances.', () => {
			const error = new Error('test error') as any
			error.customProperty = 'test'
			const data = ErrorSerializer.serialize(error)

			errorAssert(data, error)
		})
	})

	describe('deserialize', () => {
		it ('should correctly restore Errors.', () => {
			const error = new TypeError('test error') as any
			const newError = ErrorSerializer.deserialize(ErrorSerializer.serialize(error))

			assert(newError instanceof TypeError)
			errorAssert(newError, error)
		})

		it ('should create an Error instance if the error type is not global.', () => {
			const error = new TypeError('test error') as any
			const data = ErrorSerializer.serialize(error)
			data.name = 'UnknownError'
			const newError = ErrorSerializer.deserialize(data)

			assert(newError instanceof Error)
			errorAssert(newError, data)
		})

		it ('should create an Error instance if the error name does not end with "Error".', () => {
			const error = new TypeError('test error') as any
			const data = ErrorSerializer.serialize(error)
			data.name = 'Asdf'
			const newError = ErrorSerializer.deserialize(data)

			assert(!(newError instanceof TypeError), 'Is still a TypeError.')
			errorAssert(newError, data)
		})
	})
})
