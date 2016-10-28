/**
 * `AccountRecovery` constructor.
 *
 * @constructor
 * @param {WPCOM} wpcom
 * @public
 */

function AccountRecovery( userData, wpcom ) {
	if ( ! ( this instanceof AccountRecovery ) ) {
		return new AccountRecovery( wpcom );
	}

	this._userData = userData;
	this.wpcom = wpcom;
}

/**
 * Do an account recovery look up
 * @param  {Object} params  An object containing either user or firstname, lastname and url
 * @return {Promise}        Resolves to the response containing the transfer status
 */
AccountRecovery.prototype.lookup = function() {
	return this.wpcom.req.get( {
		body: this._userData,
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/lookup',
	} );
};

export default AccountRecovery;
