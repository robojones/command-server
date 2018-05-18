import { QueueItem } from './QueueItem'

export class Queue<T> {
	private items: Array<QueueItem<T>> = []

	/**
	 * Adds an item to the queue.
	 * @param item The value of the item.
	 * @param expiresIn The time until the item expires in milliseconds.
	 */
	public add(item: T, expiresIn: number): void {
		this.items.push(new QueueItem(item, expiresIn))
	}

	/**
	 * Returns true if the queue contains no items.
	 */
	public get isEmpty(): boolean {
		let i = this.items.length
		while (i--) {
			const item = this.items[i]

			if (item.isExpired) {
				// Remove expired item.
				this.items.splice(i, 1)
			} else {
				// Found a valid item → The queue is not empty.
				return false
			}
		}

		// No item found → the queue is empty.
		return true
	}

	/**
	 * Returns the oldest item of the queue.
	 * Returns null if the queue is empty.
	 */
	public pop(): QueueItem<T> | null {
		while (this.items.length) {
			const item = this.items.shift() as QueueItem<T>

			if (!item.isExpired) {
				return item
			}
		}

		return null
	}
}
