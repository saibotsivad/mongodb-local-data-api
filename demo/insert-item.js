process.env.MONGODB_URL = 'http://localhost:3007'
process.env.MONGODB_API_KEY = 'abc123'

import { post } from 'httpie'
import { mongodb } from '@saibotsivad/mongodb'

/*

You can call it manually, with a plain ol' HTTP request:

 */
post(process.env.MONGODB_URL, {
	headers: {
		'Content-Type': 'application/json',
		'Api-Key': process.env.MONGODB_API_KEY,
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
		console.log('bad req', {
			status: error.statusCode,
			type: error.headers['content-type'],
			data: error.data,
		})
	})

/**
 * A small shim to make `httpie` behave closer to `fetch`.
 * @param {Object} response - The response from the `httpie` POST request.
 * @return {{ json: function(): Promise<Object>, text: function(): Promise<String>, status: number }} - The `fetch`-like response object.
 */
const postFetchShim = response => ({
	status: response.statusCode,
	json: async () => {
		// There is a bug with the Data API where it returns the `Content-Type` header
		// as `text/plain; charset=utf-8` and then `httpie` correctly translates the body
		// to a string. I'm trying to raise an issue with the @MongoDBDev team, so I'll
		// see if that gets anywhere...
		if (typeof response.data === 'string' && response.data.startsWith('{')) return JSON.parse(response.data)
		return response.data
	},
	text: async () => response.data,
})

/*

You can use handy dandy tooling to make it easier:

 */
const db = mongodb({
	apiUrl: process.env.MONGODB_URL,
	apiKey: process.env.MONGODB_API_KEY,
	cluster: 'Cluster0',
	database: 'office',
	collection: 'people',
	fetch: async (url, parameters) => post(url, parameters).then(postFetchShim, postFetchShim),
})
db.insertOne({ document: { name: 'John Jacob Jingleheimerschmidt' } }).then(out => {
	console.log(out)
}).catch(error => { console.log('oh no!', error) })
