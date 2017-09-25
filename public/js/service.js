var axios = require('axios');
var util = require('./util');
var Promise = require('es6-promise').Promise;

module.exports = {

	/**
	 * Upload image and get server link
	 */
	uploadImage: function(file) {
		var url = '/upload';
		return axios.post(url, {
			file: file
		})
	},

	/**
	 * Get the lastest chat messages(10)
	 */
	getLatestMsg: function() {

		if (!util.getItem('chatId')) {
			return new Promise(function(resolve) {
				resolve({data: []});
			});
		}

		var url = '/messages';
		return axios.get(url);

	}

}
