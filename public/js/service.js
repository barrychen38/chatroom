var axios = require('axios');

module.exports = {

	/**
	 * Upload image and get server link
	 *
	 * @return Promise
	 */
	uploadImage: (file) => {
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
	getLastestMsg: () => {

	},

	/**
	 * Save the last chat messages(10)
	 *
	 * @return Promise
	 */
	saveLastMsg: () => {

	}

}
