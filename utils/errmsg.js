var sendErrMsg = {
	sql_connect_error: {
		result: 0,
		msg: 'MYSQL CONNECT ERROR'
	},
	sql_select_error: {
		result: 0,
		msg: 'SELECT SQL ERROR.'
	},
	sql_update_error: {
		result: 0,
		msg: 'UPDATE SQL ERROR.'
	}
}

module.exports = sendErrMsg;