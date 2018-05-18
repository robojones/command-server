import { strictEqual } from 'assert'
import { IBeforeAndAfterContext, ITestCallbackContext } from 'mocha'
import { Queue } from '../../../lib/queue/Queue'
import { QueueItem } from '../../../lib/queue/QueueItem'

describe('Queue', () => {
	interface Context extends IBeforeAndAfterContext, ITestCallbackContext {
		queue: Queue<string>
	}

	function initQueue(this: Context) {
		this.queue = new Queue()
	}

	describe('#add() & #pop()', () => {
		beforeEach(initQueue)

		it('should add and remove items', function (this: Context) {
			const item = 'test'
			const item2 = 'huhn'

			this.queue.add(item, 100)
			this.queue.add(item2, 100)

			strictEqual((this.queue.pop() as QueueItem<string>).value, item)
			strictEqual((this.queue.pop() as QueueItem<string>).value, item2)
		})

		it('should not pop expired items', function (this: Context) {
			const item = 'test'
			const item2 = 'huhn'

			this.queue.add(item, -100)
			this.queue.add(item2, 100)

			strictEqual((this.queue.pop() as QueueItem<string>).value, item2)
			strictEqual((this.queue.pop() as QueueItem<string>), null)
		})
	})

	describe('#isEmpty', () => {
		beforeEach(initQueue)

		it('should be true if the queue is empty', function(this: Context) {
			strictEqual(this.queue.isEmpty, true)
		})

		it('should be true if the queue only contains expired items', function (this: Context) {
			this.queue.add('hi', -100)
			strictEqual(this.queue.isEmpty, true)
		})

		it('should be false if the queue contains an item', function (this: Context) {
			this.queue.add('hi', 100)
			strictEqual(this.queue.isEmpty, false)
		})
	})
})
