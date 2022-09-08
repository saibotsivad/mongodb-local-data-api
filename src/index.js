import { MongoClient } from 'mongodb'

const supportedActions = [
	'aggregate',
	'deleteOne',
	'deleteMany',
	'find',
	'findOne',
	'insertOne',
	'insertMany',
	'replaceOne',
	'updateOne',
	'updateMany',
]

const actionValidation = {
	insertOne: ({ document }) => {
		if (!document) return {
			status: 400,
			body: "Failed to insert document: must provide a 'document' field",
		}
	},
}

const specialAction = {
	aggregate: (coll, params) => coll.aggregate(params.pipeline || []).toArray(),
	deleteMany: (coll, params) => {
		const { filter, ...remaining } = params
		return coll.deleteMany(filter || {}, remaining || {})
	},
	find: (coll, params) => {
		const { filter, ...remaining } = params
		return coll.find(filter, remaining || {}).toArray().then(documents => ({ documents }))
	},
	findOne: (coll, params) => {
		const { filter, ...remaining } = params
		return coll.findOne(filter, remaining).then(document => ({ document }))
	},
	insertMany: async (coll, params) => {
		const { documents, ...remaining } = params
		const { insertedIds } = await coll.insertMany(documents, remaining)
		return { insertedIds: Object.values(insertedIds).map(o => o.toString()) }
	},
	insertOne: async (coll, params) => coll.insertOne(params.document),
	replaceOne: async (coll, params) => {
		const { filter, replacement, ...remaining } = params
		const { matchedCount, modifiedCount, upsertedId } = await coll.replaceOne(filter, replacement, remaining)
		const out = { matchedCount, modifiedCount }
		if (upsertedId) out.upsertedId = upsertedId
		return out
	},
	updateOne: async (coll, params) => {
		const { filter, update, ...remaining } = params
		const { matchedCount, modifiedCount, upsertedId } = await coll.updateOne(filter, update, remaining)
		const out = { matchedCount, modifiedCount }
		if (upsertedId) out.upsertedId = upsertedId
		return out
	},
	updateMany: async (coll, params) => {
		const { filter, update, ...remaining } = params
		const { matchedCount, modifiedCount, upsertedId } = await coll.updateMany(filter, update, remaining)
		const out = { matchedCount, modifiedCount }
		if (upsertedId) out.upsertedId = upsertedId
		return out
	},
}

const endpointsThatIncorrectlyReturnText = [
	'deleteOne',
	'deleteMany',
	'find',
	'findOne',
	'insertOne',
	'insertMany',
	'replaceOne',
	'updateOne',
	'updateMany',
]

const tidyResults = (actionName, body) => {
	if (body && body.acknowledged) delete body.acknowledged
	if (body && body.insertedCount) delete body.insertedCount
	return body && endpointsThatIncorrectlyReturnText.includes(actionName) ? JSON.stringify(body) : body
}

export const setup = ({ url, verbose, retryCount }) => {
	const databaseToConnection = {}
	return async (actionName, { dataSource, database, collection, ...params }) => {
		if (dataSource && verbose) console.warn('The property `dataSource` is currently ignored for local databases.')
		if (!supportedActions.includes(actionName)) return { status: 404, body: '' }

		const validationError = actionValidation[actionName] && actionValidation[actionName](params)
		if (validationError) return validationError

		let running
		const run = async () => {
			if (!databaseToConnection[database]) {
				console.log(`Attempting to connect to: ${database}`)
				const client = new MongoClient(url)
				await client.connect()
				databaseToConnection[database] = client.db(database)
			}
			const coll = databaseToConnection[database].collection(collection)
			const results = await (specialAction[actionName] ? specialAction[actionName](coll, params) : coll[actionName](params))
			running = true
			return {
				count: results?.documents?.length,
				status: actionName.startsWith('insert') ? 201 : 200,
				body: tidyResults(actionName, results),
			}
		}

		try {
			return await run()
		} catch (firstRunError) {
			if (firstRunError.message.includes('ECONNREFUSED')) {
				console.log('Connection to MongoDB was interrupted, trying again...')
				let retries = 1
				while (!running && (retries < retryCount || retryCount === undefined)) {
					try {
						return await run()
					} catch (retryError) {
						if (!retryError.message.includes('ECONNREFUSED')) throw retryError
						console.log(`Reconnect retry ${++retries} of ${retryCount === undefined ? '∞' : retryCount}...`)
					}
				}
			}
			console.log('Error handling request:', firstRunError.message)
			return {
				status: 400,
				body: firstRunError.message,
			}
		}
	}
}
