'use strict'

const GCM_API_URL = 'https://android.googleapis.com/gcm/send'
const GCM_API_KEY = 'AIzaSyCdiN1gXE3_-fnsxpgRtnKB4sEX5SS0kmw'
const MESSAGE_CHANNEL = 'notifications'

var koa = require('koa'),
	request = require('co-request'),
	router = require('koa-router')(),
	coRedis = require('co-redis'),
	json = require('koa-json'),
	bodyParser = require('koa-bodyparser'),
	redis = require('redis'),
	redisPubClient = redis.createClient(8001, 'localhost'),
	redisSubClient = redis.createClient(8001, 'localhost'),
	redisClient = redis.createClient({database: 1}),
	app = koa();

redisClient = coRedis(redisClient)

redisSubClient.on('message', function *(channel, message) {
	if(channel != MESSAGE_CHANNEL)
		return 

	let data = JSON.parse(message)
	let userId = data.user_id
	let body = data.body
	let title = data.title
	let userToken = yield redisClient.get(`notifications:users:${userId}`)

	request({
		url: GCM_API_URL,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': 'key=${GCM_API_KEY}'
		},
		body: {
			title: title,
			message: body,
			registration_ids: [userToken]
		}
	})
})

redisSubClient.subscribe('notifications')

/**
 * list of users.
 */
router.get('/users', function *() {
	let key = 'push-notifications:users:*';
	let items = yield redisClient.keys(key);

	this.body = items;
})

/**
 * subscribing new user.
 */
router.post('/subscribe', function *() {
	let params = this.request.body;
	let userId = params.user_id;
	let userToken = params.user_token;
	let response = {success: false};

	if(userId && userToken) {
		let key = `push-notifications:users:${userId}`
		redisClient.set(key, userToken)
		response.success = true
	}

	this.body = response
})

/**
 * method is used only for testing, notifies user by its id
 */
router.post('/notify', function *() {
	let ids = redisClient.keys('notifications:users:*')
	let data = JSON.stringify({
		user_id: ids[0],
		title: 'Title goes here',
		body: 'Message body goes here'
	})

	redisPubClient.publish(MESSAGE_CHANNEL, data)
	this.body = {success: true}
})

// middleware
app.use(bodyParser())
app.use(json())
app.use(router.routes())

app.listen(3004);