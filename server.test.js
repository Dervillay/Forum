'use strict';

const request = require('supertest');
const app = require('./app.js');

let token;

// Tests POST /signIn
describe('Test /signIn route', () => {
	test('POST /signIn does not work if username does not exist', () => {
		const params = {signInUsername: 'SampleUser123', signInPassword: 'password123'};
		return request(app)
			.post('/signIn')
			.send(params)
			.expect(404);
	});

	test('POST /signIn does not work if entered password is incorrect', () => {
		const params = {signInUsername: 'SampleUser', signInPassword: 'passwrd123'};
		return request(app)
			.post('/signIn')
			.send(params)
			.expect(403);
	});

	test('POST /signIn does not work if user already signed in', () => {
		const params = {signInUsername: 'SampleUser', signInPassword: 'password123'};
		return request(app)
			.post('/signIn')
			.send(params)
			.expect(409);
	});

	test('POST /signIn succeeds', () => {
		const params = {signInUsername: 'SampleUser2', signInPassword: 'password123'};
		return request(app)
			.post('/signIn')
			.send(params)
			.expect((res) => {
				token = res.body.token;
			})
			.expect(200);
	});
});

// Tests POST /signOut
describe('Test /signOut route', () => {
	test('POST /signOut requires an access token', () => {
		const params = {user: 'SampleUser'};
		return request(app)
			.post('/signOut')
			.send(params)
			.expect(401);
	});

	test('POST /signOut fails to authenticate an invalid token', () => {
		const params = {user: 'SampleUser'};
		const header = {'x-access-token': 'abcdefgh1234567890'};
		return request(app)
			.post('/signOut')
			.send(params)
			.set(header)
			.expect(400);
	});

	test('POST /signOut succeeds', () => {
		const params = {user: 'SampleUser'};
		const header = {'x-access-token': token};
		return request(app)
			.post('/signOut')
			.send(params)
			.set(header)
			.expect(200);
	});
});

// Tests POST /googleSignIn
describe('Test /googleSignIn route', () => {
	test('POST /googleSignIn succeeds', () => {
		const params = {user: 'SampleUser'};
		return request(app)
			.post('/googleSignIn')
			.send(params)
			.expect(200);
	});
});

// Tests POST /googleSignOut
describe('Test /googleSignOut route', () => {
	test('POST /googleSignOut succeeds', () => {
		const params = {user: 'SampleUser'};
		return request(app)
			.post('/googleSignOut')
			.send(params)
			.expect(200);
	});
});

// Tests POST /addMessage
describe('Test /addMessage route', () => {
	test('POST /addMessage requires an access token', () => {
		const params = {postedBy: 'SampleUser', content: 'Jest test message.', datePosted: '1/01/2019'};
		return request(app)
			.post('/addMessage')
			.send(params)
			.expect(401);
	});

	test('POST /addMessage fails to authenticate an invalid token', () => {
		const params = {postedBy: 'SampleUser', content: 'Jest test message.', datePosted: '1/01/2019'};
		const header = {'x-access-token': 'abcdefgh1234567890'};
		return request(app)
			.post('/addMessage')
			.send(params)
			.set(header)
			.expect(400);
	});

	test('POST /addMessage succeeds', () => {
		const params = {postedBy: 'SampleUser', content: 'Jest test message.', datePosted: '1/01/2019'};
		const header = {'x-access-token': token};
		return request(app)
			.post('/addMessage')
			.send(params)
			.set(header)
			.expect(200);
	});
});

// Tests POST /signUp
describe('Test /signUp route', () => {
	test('POST /signUp fails if username already exists', () => {
		const params = {username: 'SampleUser', email: 'sample@user.com', password: 'password123'};
		return request(app)
			.post('/signUp')
			.send(params)
			.expect(409);
	});

	test('POST /signUp succeeds', () => {
		const params = {username: 'SampleUser3', email: 'sample@user3.com', password: 'password123'};
		return request(app)
			.post('/signUp')
			.send(params)
			.expect(200);
	});
});

// Tests GET /users
describe('Test /users route', () => {
	test('GET /users requires an access token', () => {
		return request(app)
			.get('/users')
			.expect(401);
	});

	test('GET /users fails to authenticate an invalid token', () => {
		const header = {'x-access-token': 'abcdefgh1234567890'};
		return request(app)
			.get('/users')
			.set(header)
			.expect(400);
	});

	test('GET /users succeeds', () => {
		const header = {'x-access-token': token};
		return request(app)
			.get('/users')
			.set(header)
			.expect(200);
	});

	test('GET /users returns JSON', () => {
		const header = {'x-access-token': token};
		return request(app)
			.get('/users')
			.set(header)
			.expect('Content-type', /json/);
	});
});

// Tests GET /messages
describe('Test /messages route', () => {
	test('GET /messages succeeds', () => {
		return request(app)
			.get('/messages')
			.expect(200);
	});

	test('GET /messages returns JSON', () => {
		return request(app)
			.get('/messages')
			.expect('Content-type', /json/);
	});
});

// Tests GET /signedIn
describe('Test /signedIn route', () => {
	test('GET /signedIn requires an access token', () => {
		return request(app)
			.get('/signedIn')
			.expect(401);
	});

	test('GET /signedIn fails to authenticate an invalid token', () => {
		const header = {'x-access-token': 'abcdefgh1234567890'};
		return request(app)
			.get('/signedIn')
			.set(header)
			.expect(400);
	});

	test('GET /signedIn succeeds', () => {
		const header = {'x-access-token': token};
		return request(app)
			.get('/signedIn')
			.set(header)
			.expect(200);
	});

	test('GET /signedIn returns JSON', () => {
		const header = {'x-access-token': token};
		return request(app)
			.get('/signedIn')
			.set(header)
			.expect('Content-type', /json/);
	});
});
