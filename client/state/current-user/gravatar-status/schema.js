export const tempImageSchema = {
	type: [ 'object', 'null' ],
	additionalProperties: false,
	properties: {
		expiration: { type: 'integer' },
		src: { type: 'string' }
	}
};
