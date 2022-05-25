#!/usr/bin/env node

import { readFileSync } from 'node:fs'
import sade from 'sade'
import Koa from 'koa'
import koaRouter from 'koa-router'
import koaBody from 'koa-body'
import { setup } from './src/index.js'

const optionNames = [
	'apiPort',
	'url',
	'username',
	'password',
	'dbDomain',
	'dbPort',
]

const mixWithEnv = callback => options => {
	const envOptions = {}
	for (const envName in process.env) {
		const tidyName = envName.toUpperCase()
		if (tidyName.startsWith('MONGODBLOCAL_')) envOptions[tidyName] = process.env[envName]
	}
	for (const opt of optionNames) {
		if (options[opt] === undefined && envOptions[`MONGODBLOCAL_${opt.toUpperCase()}`]) {
			options[opt] = envOptions[`MONGODBLOCAL_${opt.toUpperCase()}`]
		}
	}
	if (options.apiPort) options.apiPort = parseInt(options.apiPort, 10)
	if (options.dbPort) options.dbPort = parseInt(options.dbPort, 10)
	if (options.retryCount) options.retryCount = parseInt(options.retryCount, 10)
	callback(options)
}

sade('mongodb-local-data-api', true)
	.version(JSON.parse(readFileSync('./package.json', 'utf8')).version)
	.describe('Start an instance of a Data API server. Use environment variables instead by prefixing `MONGODBLOCAL_` to the option, e.g. `MONGODBLOCAL_PORT` for `port`.')
	.option('--apiPort', 'Change the port this Data API uses. (Default: 3007)')
	.option('--key', 'The API key to require on all requests. The default is no authentication required. Set the flag multiple times for multiple keys.')
	.option('--url', 'The complete MongoDB URL, e.g. `mongodb://AzureDiamond:hunter2@localhost:27017`. If set, this will override all other related properties.')
	.option('--username', 'The MongoDB username, e.g. `AzureDiamond`.')
	.option('--password', 'The MongoDB password, e.g. `hunter2`.')
	.option('--dbDomain', 'Change the port used to connect to MongoDB. (Default: localhost)')
	.option('--dbPort', 'Change the port used to connect to MongoDB. (Default: 27017)')
	.option('--retryCount', 'By default interrupted MongoDB connections will retry indefinitely. Set to `0` to disable, or an integer for a retry limit. (Default: Infinity)')
	.option('--verbose', 'If this flag is set, all request and response bodies will also be logged.')
	.example('--username=AzureDiamond --password=hunter2 # normal')
	.example('--url=mongodb://user:pass@localhost:27017/?serverSelectionTimeoutMS=5000 # connection options')
	.example('--key=abc123 --key=def456 # multiple keys')
	.action(mixWithEnv(({ apiPort, url, username, password, dbDomain, dbPort, key: keys, verbose, retryCount }) => {
		if (!Array.isArray(keys)) keys = keys ? [ keys ] : []
		if (!apiPort) apiPort = 3007
		if (!dbPort) dbPort = 27017
		if (!dbDomain) dbDomain = 'localhost'
		if (!url) url = `mongodb://${username}:${password}@${dbDomain}:${dbPort}`
		const database = setup({ url, verbose, retryCount })
		const app = new Koa()
		const router = koaRouter()
		let requestCounter = 0
		router
			.post('/action/:action', koaBody(), async context => {
				const action = context.request.params.action
				const requestId = (++requestCounter).toString().padStart(4, '0')
				if (verbose) console.log(requestId, new Date(), action, context.request.body)
				if (keys.length && !keys.includes(context.request.headers['api-key'])) {
					console.log(requestId, new Date(), 'Provided API key was not authorized:', context.request.headers['api-key'])
					context.status = 401
					context.body = {
						error: 'invalid session: error finding user for endpoint',
						error_code: 'InvalidSession',
						link: 'https://realm.mongodb.com/groups/611be2cf39b99f2a25556d10/apps/61df4d50cb330d69cb2b7822/logs?co_id=61f1c4aaa37cb8585dbdd69c',
					}
				} else {
					await database(action, context.request.body)
						.then(({ status, body }) => {
							context.status = status
							context.body = body
							if (body?.documents?.length > 1000) console.error(requestId, new Date(), `${action} => ${status}`, `[ERROR: Returned Objects has gone above 1000: ${body.documents.length}]`)
							else if (body?.documents?.length) console.log(requestId, new Date(), `${action} => ${status}`, `[Returned Objects: ${body.documents.length}]`)
							else console.log(requestId, new Date(), `${action} => ${status}`)
							if (verbose) console.log(body)
						})
						.catch(error => {
							console.error('The database request failed for an unexpected reason:', error)
							process.exit(1)
						})
				}
			})
		app.use(router.routes())
		app.listen(apiPort, () => {
			console.log(new Date(), `Data API running on port ${apiPort}`)
		})
	}))
	.parse(process.argv)
