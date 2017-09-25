module.exports = function() {

	/**
	 * Ask sure to leave
	 */
	// window.onbeforeunload = function() {
	// 	return 1;
	// }

	/**
	 * Check Notification
	 */
	if ('Notification' in global) {
		global.Notification.requestPermission();
		return global.Notification.permission;
	}

}
