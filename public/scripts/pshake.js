$(function() {
	
	$(document.body).on('touchmove', function(event) {
		event.preventDefault();
	});
	
	var hash, people, uuid;
	
	if (location.hash) {
		hash = location.hash.substr(1).split('=')[1];
		people = hash.split('_')[0];
		uuid = hash.split('_')[1];
	}
	
	var socket = io();
	
	// socket.emit('phone_online');
	
	var myShakeEvent = new Shake({
	    threshold: 8,
	    timeout: 800
	});
	
	myShakeEvent.start();
	
	window.addEventListener('shake', shakeEventDidOccur, false);
	
	function shakeEventDidOccur () {
		socket.emit('pshake', {
			people: people,
			uuid: uuid
		});
	}
	
});

window.onload = function() {
	$('.inner p').addClass('animated shake');
}