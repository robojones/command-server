export class IdManager {
	public ids: Array<true | false> = []
	private index: number = 0
	private maxIndex: number

	constructor(maxIndex: number) {
		this.maxIndex = maxIndex
	}

	/**
	 * Releases an id if it is not needed anymore.
	 * It can the be reused.
	 * @param id The id that is no longer needed.
	 */
	public release(id: number) {
		if (id < 0 || id > this.maxIndex) {
			throw new TypeError(`Id must be between 0 and ${this.maxIndex} but it is ${id}`)
		}

		this.ids[id] = false
	}

	/**
	 * Reserves and returns an id that is currently not in use.
	 */
	public reserve(): number {
		const startIndex = this.index

		while (true) {
			const i = this.index

			if (!this.ids[i]) {
				this.ids[i] = true
				return i
			}

			// Set next index.
			if (this.index >= this.maxIndex) {
				this.index = 0
			} else {
				this.index ++
			}

			if (this.index === startIndex) {
				// Arrived at the start again. All Ids in use.
				throw new Error('All ids are reserved! Make sure to release ids they are no longer used.')
			}
		}
	}
}
