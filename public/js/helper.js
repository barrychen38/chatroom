module.exports = {

	/**
	 * LocalStorage methods
	 * // - setItem
	 * // - getItem
	 * // - removeItem
	 */
	setItem: (key, value) => {
		value = JSON.stringify(value);
		window.localStorage.setItem(key, value);
	},

	getItem: (key) => {
		let value = window.localStorage.getItem(key);
		if (value) {
			return JSON.parse(value)
		}
		return '';
	},

	removeItem: (key) => {
		window.localStorage.removeItem(key);
	}

}
