# audiocommons
Audio Commons search interface using audiocommons API. This interface allow users to search audio files from audiocommons providers Jamendo, Europeana, Freesound, ...

## Configuration
- Create an app on https://m.audiocommons.org/ to get credentials in order to be able to use the audiocommons API.
- Set your audiocommons API credentials in the files /src/app/apiClient.ts and /tests/lib/audiocommons/api/client.ts
	- username
	- password
	- clientId

## Building & Running

If you're on Linux or MacOS, use either one of these commands:

- `npm start`
- `npm run-script docker start`
- `npm run-script watch` and `npm run-script watch-css:darwin:linux` (development only!)
- `npm run-script docker watch` (development only!)

If you're on Windows, you can run `npm start`. If you want to watch CSS files, run `npm start` first, then open another terminal and run `npm run-script watch-css:win32`.

The app will be available at [http://127.0.0.1:8080/](http://127.0.0.1:8080/) or [http://localhost:8080/](http://localhost:8080/) shortly after starting.

### Building & Running Production Containers

To build a fully self-contained version of the application, run:
```
npm run-script containerize-prod
```

To start the new container, you can use:
```
docker run -p 8080:8080 audiocommons_prod
```

The container will start the node.js server automatically. The server listens to port `8080` in the container; use Docker's `-p` flag as necessary.
