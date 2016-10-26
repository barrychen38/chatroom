$(function() {
	
	var $name = $('.name'),
		$mobile = $('.mobile'),
		$email = $('.email'),
		$password = $('.pwd'),
		$rPassword = $('.rPwd'),
		$submit = $('.submit');
	
	var uid = getQueryString('uid');
	
	if (uid === null) {
		uid = '';
	}
	
	$submit.on('click', function() {
		if (checkPwd($password, $rPassword)) {
			submit({
				name: $name.val(),
				mobile: $mobile.val(),
				email: $email.val(),
				password: $password.val(),
				uid: uid
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
	
	function getQueryString(name) {
		var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"),
			r = window.location.search.substr(1).match(reg);
		if (r != null) return decodeURIComponent(r[2]);
		return null;
	}
	
});