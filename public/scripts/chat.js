$(function() {
	
	// confirm nickname
	var nickname,
		$confirm = $('.confirm'),
		$nickname = $('.nickname'),
		$input = $('.input');
	
	$confirm.on('click', function(event) {
		event.preventDefault();
		checkNN();
	});
	
	$nickname.on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
			checkNN();
		}
	});
	
	$input.on('keydown', function(event) {
		if (event.keyCode === 13) {
			event.preventDefault();
		}
		if (event.keyCode === 13 && event.ctrlKey) {
			$(this).val($input.val() + '\n');
		}
	});
	
	
	function checkNN() {
		var nn = $('.nickname').val();
		if (nn === '') {
			alert('Please enter you nickname!');
		} else {
			nickname = nn;
			$('.enter_nickname').hide();
		}
	}
	
});