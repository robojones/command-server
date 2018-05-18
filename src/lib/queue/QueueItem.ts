export class QueueItem<T> {
	public value: T
	private expireTime: number

	constructor(value: T, expiresIn: number) {
		this.value = value

		this.expireTime = Date.now() + expiresIn
	}

	/**
	 * The time until the item expires in milliseconds.
	 * Is null if the item does not expire.
	 */
	public get expiresIn(): number {
		return this.expireTime - Date.now()
	}

	/**
	 * Is true if the item is expired.
	 */
	public get isExpired(): boolean {
		return Date.now() > this.expireTime
	}
}
