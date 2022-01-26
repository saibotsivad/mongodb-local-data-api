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

These are the options you can pass during setup:

- `url: String` - TODO

The options you can pass to the CLI are the same as the above, and include these additional options:

- `apiPort: Integer` - The port for the local Data API server.

## License

Published and released under the [Very Open License](http://veryopenlicense.com).

If you need a commercial license, [contact me here](https://davistobias.com/license?software=mongodb-local-data-api).
