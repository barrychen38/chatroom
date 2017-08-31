const axios = require('axios');

const baseUrl = 'http://127.0.0.1:2261';

const base64Image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJAAAACQBAMAAAAVaP+LAAAAGFBMVEUAAABTU1NNTU1TU1NPT09SUlJSUlJTU1O8B7DEAAAAB3RSTlMAoArVKvVgBuEdKgAAAJ1JREFUeF7t1TEOwyAMQNG0Q6/UE+RMXD9d/tC6womIFSL9P+MnAYOXeTIzMzMzMzMzaz8J9Ri6HoITmuHXhISE8nEh9yxDh55aCEUoTGbbQwjqHwIkRAEiIaG0+0AA9VBMaE89Rogeoww936MQrWdBr4GN/z0IAdQ6nQ/FIpRXDwHcA+JIJcQowQAlFUA0MfQpXLlVQfkzR4igS6ENjknm/wiaGhsAAAAASUVORK5CYII=';

describe('Upload API test start', () => {
	describe('POST /upload', () => {
		it('Should returns readyState 1', (done) => {
			axios.post(`${baseUrl}/upload`, {
				file: base64Image
			})
				.then((res) => {
					expect(res.data.readyState).toEqual(1);
					done();
				})
				.catch((err) => {
					throw new Error(err);
				});
		});
	});
});
