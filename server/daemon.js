'use strict'

const GCM_API_URL = 'https://android.googleapis.com/gcm/send'
const GCM_API_KEY = 'AIzaSyCdiN1gXE3_-fnsxpgRtnKB4sEX5SS0kmw'
const MESSAGE_CHANNEL = 'notifications'

var redis = require('redis'),
	co = require('co'),
	request = require('co-request'),
	coRedis = require('co-redis'),
	redisSubClient = redis.createClient(8001, 'localhost'),
	redisClient = redis.createClient({database: 1});

redisClient = coRedis(redisClient)

let onMessage = co.wrap(function *(channel, message) {
	if(channel != MESSAGE_CHANNEL)
		return 

	let data = JSON.parse(message)
	let userId = data.user_id
	let body = data.body
	let title = data.title
	let userToken = yield redisClient.get(`push-notifications:users:${userId}`)
	let result = yield request({
		method: 'POST',
		url: GCM_API_URL,
		json: true,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `key=${GCM_API_KEY}`
		},
		body: {
			title: title,
			message: body,
			registration_ids: [userToken]
		}
	})

	console.log(result)
})

redisSubClient.on('message', onMessage)
redisSubClient.subscribe('notifications')