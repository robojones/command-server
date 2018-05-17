export interface SerializedError {
	/** The name of the error (e.g. Error, TypeError, ...). */
	name: string,
	/** The error message. */
	message: string,
	/** The stack trace. */
	stack: string
	[prop: string]: any
}

export default class ErrorSerializer {
	/** Converts an Error into a standard object. */
	public static serialize (error: Error): SerializedError {
		const data = {
			message: error.message,
			name: error.name,
			stack: error.stack,
		}

		Object.assign(data, error)

		return data as SerializedError
	}

	/** Converts an object into an Error instance. */
	public static deserialize (data: SerializedError) {
		const Factory = this.getFactory(data)

		const error = new Factory(data.message)
		Object.assign(error, data)

		return error
	}

	/** Tries to find the global class for the error name. Returns Error if none is found. */
	private static getFactory (data: SerializedError): new (message: string) => Error {
		const name = data.name

		if (name.endsWith('Error') && global[name]) {
			return global[name]
		}

		return Error
	}
}
