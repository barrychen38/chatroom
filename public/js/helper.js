module.exports = {

	/**
	 * LocalStorage methods
	 * // - setItem
	 * // - getItem
	 * // - removeItem
	 */
	setItem: function(key, value) {
		value = JSON.stringify(value);
		window.localStorage.setItem(key, value);
	},

	getItem: function(key) {
		var value = window.localStorage.getItem(key);
		if (value) {
			return JSON.parse(value);
		}
		return '';
	},

	removeItem: function(key) {
		window.localStorage.removeItem(key);
	}

}
