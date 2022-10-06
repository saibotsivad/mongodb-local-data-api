import { post } from 'httpie'
import { mongodb } from '@saibotsivad/mongodb'

import { setTimeout as delay } from 'node:timers/promises'
await delay(1000) // artificial wait time until the local API starts

const API_URL = 'http://localhost:9001'
const API_KEY = 'abc123'

/*

You can call the locally running API manually, with a plain ol' HTTP request:

 */
post(API_URL + '/action/insertOne', {
	headers: {
		'Content-Type': 'application/json',
		'Api-Key': API_KEY,
	},
	body: JSON.stringify({
		dataSource: 'Cluster0',
		database: 'office',
		collection: 'people',
		document: { name: 'John Jacob Jingleheimerschmidt' },
	}),
})
	.then(response => {
		console.log('done', {
			status: response.statusCode,
			type: response.headers['content-type'],
			data: response.data,
		})
	})
	.catch(error => {
		console.log('bad request', {
			status: error.statusCode,
			type: error.headers['content-type'],
			data: error.data,
		})
	})

/*
 Ignore this, it's a small shim to make `httpie` behave closer to the `fetch` specs.
 */
const postFetchShim = response => ({
	status: response.statusCode,
	json: async () => response.data,
	text: async () => response.data,
})
const fetch = async (url, parameters) => post(url, parameters).then(postFetchShim, postFetchShim)
/*

You can also use handy dandy tooling to make it easier:

 */
const db = mongodb({
	apiUrl: API_URL,
	apiKey: API_KEY,
	dataSource: 'Cluster0',
	database: 'office',
	collection: 'people',
	fetch,
})
db
	.insertOne({
		document: { name: 'John Jacob Jingleheimerschmidt' },
	})
	.then(out => {
		console.log('huzza!', out)
	})
	.catch(error => {
		console.log('oh no!', error)
	})
