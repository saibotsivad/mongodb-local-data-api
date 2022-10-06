# mongodb-local-data-api

Run your own version of the [MongoDB Atlas Data API](https://docs.atlas.mongodb.com/api/data-api/) for local development and testing.

This is a simple HTTP server that *simulates* the [Data API endpoints](https://docs.atlas.mongodb.com/api/data-api-resources/). It was designed for exact parity with the Atlas version, it was not designed for use in production.

> **v1 Update!** MongoDB's "Data API" is out of beta, so this library is now v1 as well! 🎉

## Example

Suppose you have a MongoDB instance running locally, following [these Docker instructions](https://www.mongodb.com/compatibility/docker), and you want to also run a local version of the Data API for development:

```bash
mongodb-local-data-api --username=AzureDiamond \
  --password=hunter2 \
  --mongodbPort=27017 \
  --apiPort=3001 \
  --key=battery-horse-staple
```

That starts this mock-Data-API with the [base URL](https://www.mongodb.com/docs/atlas/api/data-api-resources/#base-url) as `http://localhost:3001`, so e.g. to [find a single document](https://www.mongodb.com/docs/atlas/api/data-api-resources/#find-a-single-document) (which is the `/action/findOne` path) with `cURL` you would do:

```bash
curl --request POST \
  'http://localhost:3000/action/findOne' \
  --header 'Content-Type: application/json' \
  --header 'api-key: battery-horse-staple' \
  --data-raw '{
      "dataSource": "Cluster0",
      "database": "todo",
      "collection": "tasks",
      "filter": {
        "text": "Do the dishes"
      }
  }'
```

You can make any request to this API that is in the [official documentation](https://www.mongodb.com/docs/atlas/api/data-api-resources/#run-an-aggregation-pipeline).

You can interact with this library programmatically, if you'd rather:

```js
import { setup } from 'mongodb-local-data-api'
const database = setup({
	// the URL to access the locally-running MongoDB instance
	url: 'mongodb://AzureDiamond:hunter2@localhost:27017',
})
// correlates to the MongoDB action, e.g. find, findOne, aggregate, ...
const action = 'insertOne'
// these are the parameters as you would send them to the Data API
const parameters = {
	dataSource: 'Cluster0',
	database: 'todo',
	collection: 'tasks',
	document: {
		status: 'open',
		text: 'Do the dishes'
	}
}
const { status, body } = await database(action, parameters)
```

## Options

These are the options you can pass to the `setup` function:

- `url: String` - The fully qualified URL to the MongoDB instance. This would look like `mongodb://AzureDiamond:hunter2@localhost:27017` or similar. If you set this property, the remaining MongoDB-related options will be ignored.
- `username: String` - The username to access the MongoDB instance.
- `password: String` - The password to access the MongoDB instance.
- `dbDomain: String` - The domain of the MongoDB instance. (Default: `localhost`)
- `dbPort: Integer` - The port of the MongoDB instance. (Default: `27017`)
- `retryCount: Integer` - By default any interrupted connections to MongoDB will be retried indefinitely. Set to `0` to disable, or set to a limit. (Default: `Infinity`)
- `verbose: Boolean` - Whether to print out additional information to the console. (Default: `false`)

The options you can pass to the CLI are the same as above, but include these options:

- `apiPort: Integer` - The port used to access this Data API instance. (Default: `3007`)
- `key: String` - Authentication keys to look for on the `API-Key` request header, to access the local API. Set this option multiple times for multiple keys. Default: no `API-Key` required.

For the CLI tool, all options ***except `key`*** can also be set using the environment variable version instead, which is simply the prefix `MONGODBLOCAL_` followed by the option name, e.g. `MONGODBLOCAL_URL`. The environment variable is case-insensitive, so e.g. `MONGODBLOCAL_url` or `MongoDBLocal_url` would also work.

## Example

Here's an example of how I've used this library to run a local environment, with MongoDB in a Docker container, and an `npm` run script to coordinate.

I set up a container with services, using `docker compose`. (In most of my applications I had additional other services in the same container.)

```yaml
# $REPO/docker/docker-compose.yaml
version: '3.8'
services:
  mongodb-local:
    image: mongo:5.0
    ports:
      - "27017:27017"
    # this is how you get MongoDB to stop spewing out so many logs
    command: mongod --quiet --logpath /dev/null
    environment:
      - MONGO_INITDB_ROOT_USERNAME=AzureDiamond
      - MONGO_INITDB_ROOT_PASSWORD=hunter2
    volumes: # this persists MongoDB data between restarts
      - "./mongodb:/data/db"
```

Then in my repo root, in the `package.json` file I have these relevant parts:

```json
{
  "scripts": {
    "local": "run-p local:*",
    "local:docker": "cd deploy && docker compose up",
    "local:mongodb-data-api": "mongodb-local-data-api --username=AzureDiamond --password=hunter2 --apiKey=battery-horse-staple --apiPort=3007"
  },
  "devDependencies": {
    "mongodb-local-data-api": "^1.0.0",
    "npm-run-all": "^4.0.0"
  }
}
```

Then when you do `npm run local` it launches the Docker container (using docker-compose) and the local Data API, in parallel.

## Related

You might also be interested in [`@saibotsivad/mongodb`](https://github.com/saibotsivad/mongodb) which is a thin wrapper to interact with a MongoDB Atlas Data API instance:

```js
import { mongodb } from '@saibotsivad/mongodb'

const db = initializeMongodb({
	apiUrl: process.env.MONGODB_API_URL,
	apiKey: process.env.MONGODB_API_KEY,
	dataSource: process.env.MONGODB_DATA_SOURCE,
	database: process.env.MONGODB_DATABASE_NAME,
	collection: process.env.MONGODB_COLLECTION_NAME,
})

const { documents } = await db.findOne({
	filter: {
		text: 'Do the dishes',
	},
})
```

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=mongodb-local-data-api).
