export class CodeError extends Error {
	public code: string
	public name: string

	constructor(message: string, code?: string, name?: string) {
		super(message)
		if (typeof code === 'string') {
			this.code = code
		}
		if (typeof name === 'string') {
			this.name = name
		}
	}
}
