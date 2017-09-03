var axios = require('axios');

describe('Check the server', () => {

	let url = 'http://127.0.0.1:2261/';

	describe('when success', () => {
		it('should return HTTP code 200', () => {
			axios.get(url)
				.then((res) => {
					expect(res.status).toEqual(200);
				});
		});
	});

	describe('when failed', () => {
		it('should no response', () => {
			axios.get(url)
				.catch((err) => {
					expect(Boolean(err.response)).toBeFalsy();
				});
		});
	});

});
