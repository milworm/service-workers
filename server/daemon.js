'use strict'

/**
	to subscribe user to receive push-notifications:
	redisPubClient.publish('webpush:subscribe', {
		user_id: 1,
		subscription: {...}
	})

	to unsubscribe user to receive push-notifications:
	redisPubClient.publish('webpush:unsubscribe', {
		user_id: 1
	})

	to emit push notification:
	redisPubClient.publish('webpush:notify', {
		user_id: 1,
		title: 'Title',
		body: 'Message'
	})

*/

const GCM_API_KEY = 'AIzaSyCdiN1gXE3_-fnsxpgRtnKB4sEX5SS0kmw'

let co = require('co')
let redis = require('redis')
let coRedis = require('co-redis')
let webpush = require('web-push-encryption')
let redisClient = redis.createClient({database: 1})
let redisSubClient = redis.createClient(8001, 'localhost')

webpush.setGCMAPIKey(GCM_API_KEY)
redisClient = coRedis(redisClient)

let onNotify = co.wrap(function *(data) {
	let key = `webpush:users:${data.user_id}`
	let subscription = yield redisClient.get(key)
	subscription = JSON.parse(subscription)
	data = JSON.stringify(data)

	try {
		let result = webpush.sendWebPush(data, subscription)
	} catch(e) {
		console.log(e)
	}
})

let onSubscribe = co.wrap(function *(data) {
	let userId = data.user_id;
	let subscription = data.subscription;
	let key = `webpush:users:${userId}`;

	redisClient.set(key, JSON.stringify(subscription))
})

let onUnsubscribe = co.wrap(function *(data) {
	let userId = data.user_id;
	let key = `webpush:users:${userId}`;

	redisClient.del(key)
})

let onMessage = co.wrap(function *(pattern, channel, message) {
	let data = JSON.parse(message)

	switch(channel) {
		case 'webpush:notify': 
			onNotify(data)
			break

		case 'webpush:subscribe':
			onSubscribe(data)
			break

		case 'webpush:unsubscribe':
			onUnsubscribe(data)
			break
	}
})

redisSubClient.on('pmessage', onMessage)
redisSubClient.psubscribe('webpush:*')