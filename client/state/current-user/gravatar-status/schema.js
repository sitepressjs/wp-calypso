export const itemsSchema = {
	type: [ 'object', 'null' ],
	additionalProperties: false,
	properties: {
		expiration: { type: 'integer' },
		tempImage: { type: 'string' }
	}
};
