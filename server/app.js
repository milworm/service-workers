'use strict'

var koa = require('koa'),
	co = require('co'),
	router = require('koa-router')(),
	coRedis = require('co-redis'),
	json = require('koa-json'),
	bodyParser = require('koa-bodyparser'),
	redis = require('redis'),
	redisPubClient = redis.createClient(8001, 'localhost'),
	redisClient = redis.createClient({database: 1}),
	app = koa();

redisClient = coRedis(redisClient)

/**
 * subscribing new user.
 */
router.post('/subscribe', function *() {
	let params = this.request.body;
	let message = JSON.stringify(params);
	let result = redisPubClient.publish('webpush:subscribe', message)

	this.body = {success: result}
})

router.post('/unsubscribe', function *() {
	let params = this.request.body;
	let message = JSON.stringify(params);
	let result = redisPubClient.publish('webpush:unsubscribe', message)

	this.body = {success: result}
})

router.get('/notify', function *() {
	let keys = yield redisClient.keys('webpush:users:*')

	keys.forEach((key) => {
		let id = key.split('users:')[1]
		let data = JSON.stringify({
			user_id: id,
			title: 'Super title' + (+new Date),
			body: 'Message body goes here'
		})

		redisPubClient.publish('webpush:notify', data)
	})

	this.body = {success: true}
})

// middleware
app.use(bodyParser())
app.use(json())
app.use(router.routes())

app.listen(8081);