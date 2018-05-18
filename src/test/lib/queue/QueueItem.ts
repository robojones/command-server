import { strictEqual } from 'assert'
import * as assert from 'assert'
import { QueueItem } from '../../../lib/queue/QueueItem'

describe('QueueItem', () => {
	describe('constructor', () => {
		it('should set the value', () => {
			const item = new QueueItem('test', 0)
			strictEqual(item.value, 'test')
		})
	})

	describe('#isExpired', () => {
		it('should return false if the time has not passed', () => {
			const item = new QueueItem('test', 100)
			strictEqual(item.isExpired, false)
		})

		it('should return true if the time has passed', () => {
			// A negative value means that it already is expired.
			const item = new QueueItem('test', -100)
			strictEqual(item.isExpired, true)
		})
	})

	describe('#expiresIn', () => {
		it('should be the remaining time in ms', () => {
			const item = new QueueItem('test', 100)
			assert(item.expiresIn <= 100, 'should be smaller than the original time')
			assert(item.expiresIn >= 90, 'should not derive by more than 10 ms')
		})
	})
})
