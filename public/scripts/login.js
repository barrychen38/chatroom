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
				switch (result) {
					case 1:
						$err_msg.html('');
						alert('Login Success.');
						break;
					case 2:
						$err_msg.html('No username.');
						break;
					case 3:
						$err_msg.html('Wrong password.');
						break;
					case 0:
						alert('ERROR.');
						break;
					default:
						break;
				}
			},
			complete: function() {
				that.removeAttr('disabled');
			}
		})
	});
	
});