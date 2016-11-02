var sql_query = {
	select_user: 'SELECT * FROM user',
	select_save_chat: 'SELECT * FROM save_chat',
	select_user_where_email: 'SELECT * FROM user WHERE email = ?'
}

module.exports = sql_query;