const axios = require('axios');

const baseUrl = 'http://127.0.0.1:2261/';

describe('Chat Server Start', () => {
	describe('Get /', () => {
		it('Should return status code 200', (done) => {
			axios.get(baseUrl)
				.then((res) => {
					expect(res.status).toEqual(200);
					done();
				})
				.catch((err) => {
					throw new Error(err);
				});
		});
	});
});
