import { deepEqual, throws } from 'assert'
import { IBeforeAndAfterContext, ITestCallbackContext } from 'mocha'
import { IdManager } from '../../command/IdManager'

describe('IdManager', () => {
	interface Context extends IBeforeAndAfterContext, ITestCallbackContext {
		manager: IdManager
	}

	function init(this: Context) {
		this.manager = new IdManager(2)
	}

	beforeEach(init)

	it('should reserve ids in accending order', function (this: Context) {
		const results: number[] = []

		throws(() => {
			while (true) {
				results.push(this.manager.reserve())
				console.log(results)
			}
		})

		deepEqual(results, [0, 1, 2])
	})

	it('should reuse released ids', function (this: Context) {
		const results: number[] = []

		// Reserve 0 so it does never occur in results
		this.manager.reserve()
		this.manager.reserve()

		for (let i = 0; i < 3; i++) {
			const id = this.manager.reserve()
			this.manager.release(id)
			results.push(id)
		}

		deepEqual(results, [2, 2, 2])
	})

	it('should throw if the id is not in range', function (this: Context) {
		throws(() => {
			this.manager.release(-1)
		})

		throws(() => {
			this.manager.release(3)
		})
	})
})
