# mongodb-local-data-api

Run your own version of the [MongoDB Atlas Data API](https://docs.atlas.mongodb.com/api/data-api/).

This is a simple HTTP server that *simulates* the [Data API endpoints](https://docs.atlas.mongodb.com/api/data-api-resources/) for local development and testing. It should not be considered secure, aka not meant for use in production!

> Note: this is meant to be an *accurate* copy of the MongoDB Atlas Data API, warts and all. See this [open issue](https://github.com/saibotsivad/mongodb-local-data-api/issues/1) for weird bits that are from their implementation.

## Example

Suppose you have a MongoDB instance running locally, following [these instructions](https://www.mongodb.com/compatibility/docker), and you want to also run a local version of the Data API for development:

```shell
mongodb-local-data-api --username=AzureDiamond \
  --password=hunter2 \
  --mongodbPort=27017 \
  --apiPort=3001
```

You can interact with it from code:

```js
import { setup } from 'mongodb-local-data-api'
const database = setup({ url: 'mongodb://AzureDiamond:hunter2@localhost:27017' })
const { status, body } = await database('insertOne', {
	dataSource: 'Cluster0',
	database: 'todo',
	collection: 'tasks',
	document: {
		status: 'open',
		text: 'Do the dishes'
	}
})
```

## Options

These are the options you can pass to the `setup` function:

- `url: String` - The fully qualified URL to the MongoDB instance. This would look like `mongodb://AzureDiamond:hunter2@localhost:27017` or similar. If you set this property, the remaining MongoDB options will be ignored.
- `username: String` - The username to access the MongoDB instance.
- `password: String` - The password to access the MongoDB instance.
- `dbDomain: String` - The domain of the MongoDB instance. (Default: `localhost`)
- `dbPort: Integer` - The port of the MongoDB instance. (Default: `27017`)

The options you can pass to the CLI are the same as above, but include these options:

- `apiPort: Integer` - The port used to access this Data API instance. (Default: `3007`)

For the CLI tool, all options can also be set using the environment variable version instead, which is simply the prefix `MONGODBLOCAL_` followed by the option name, e.g. `MONGODBLOCAL_URL`. The environment variable is case-insensitive, so e.g. `MongoDBLocal_url` would also work.

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=mongodb-local-data-api).
