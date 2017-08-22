var axios = require('axios');
var helper = require('./helper');
var Promise = require('es6-promise').Promise;

module.exports = {

	/**
	 * Upload image and get server link
	 *
	 * @return Promise
	 */
	uploadImage: function(file) {
		var url = '/upload';
		return axios.post(url, {
			file: file
		})
	},

	/**
	 * Get the lastest chat messages(10)
	 *
	 * @return Promise
	 */
	getLastestMsg: function() {

		if (!helper.getItem('id')) {
			return new Promise(function(resolve, reject) {
				resolve('No history before.');
			});
		}

		let url = '/messages';
		return axios.get(url);

	}

}
