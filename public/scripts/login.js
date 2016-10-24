$(function() {
	
	var $user = $('.user'),
		$pwd = $('.pwd'),
		$submit = $('.submit'),
		$err_msg = $('.errMsg');
	
	$submit.on('click', function() {
		var that = $(this);
		that.attr('disabled', 'disabled');
		$.ajax({
			url: '/loginConfirm',
			type: 'POST',
			dataType: 'json',
			data: {
				name: $user.val(),
				password: $pwd.val()
			},
			success: function(data) {
				var result = data.result;
				if (result === 1) {
					$err_msg.html('');
					alert('Login Success.');
				}
				if (result === 0) {
					$err_msg.html('Username or Password Error!');
				}
			},
			complete: function() {
				that.removeAttr('disabled');
			}
		})
	});
	
});