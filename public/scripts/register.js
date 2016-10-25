$(function() {
	
	var $name = $('.name'),
		$sex = $('.sex:checked'),
		$age = $('.age'),
		$mobile = $('.mobile'),
		$email = $('.email'),
		$password = $('.pwd'),
		$rPassword = $('.rPwd'),
		$submit = $('.submit');
	
	$submit.on('click', function() {
		if (checkPwd($password, $rPassword)) {
			submit({
				name: $name.val(),
				sex: $sex.val(),
				age: +$age.val(),
				mobile: $mobile.val(),
				email: $email.val(),
				password: $password.val()
			}, function(data) {
				var result = data.result;
				if (result === 1) {
					alert('Signup success.')
				}
				if (result === 0) {
					$('.errMsg').html('Email or Mobile has been registered.');
				}
			});
		} else {
			alert('Two pwds are not same!');
		}
	});
	
	function checkPwd(pwd1, pwd2) {
		if (pwd1.val() === pwd2.val()) {
			return true;
		}
		return false;
	}
	
	function submit(data, fn) {
		$.ajax({
			url: '/register',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function(data) {
				fn && fn(data);
			}
		});
	}
	
});