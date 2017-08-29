module.exports = function() {

	/**
	 * Ask sure to leave
	 */
	window.onbeforeunload = function() {
		return 1;
	}

}
