var checkPermission = require('./notify')();
require('smoothscroll-polyfill').polyfill();

module.exports = {
	MAX_WINDOW_HEIGHT: 380,
	MAX_IMAGE_SIZE: 1024 * 1024 * 2,

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
	},

	/**
	 * Other functions
	 */
	preloadImage: function(src, fn) {
		var image = new Image();
		image.onload = fn;
		image.src = src;
	},

	getEmojiName: function(emoji) {
		return emoji.replace(/(\[|\])/g, '');
	},

	smoothScroll: function() {
		var scroller = document.querySelector('.inner'),
				diffHeight = scroller.scrollHeight - this.MAX_WINDOW_HEIGHT;
		if (diffHeight <= 0) {
			return;
		}
		scroller.scrollBy({
			left: 0,
			top: diffHeight,
			behavior: 'smooth'
		});
	},

	alertMessage: function(user, body) {
		if (checkPermission === 'granted') {
			var notify = new Notification(user, {
				body: body,
				icon: '/dist/img/notify.png',
				eventTime: 800
			});
		}
	}

}
