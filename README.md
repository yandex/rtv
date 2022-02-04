# Remote TV control for developers
Tools for Smart TV developers.

![scheme](img/scheme.png)

## Supported platforms

* Samsung Tizen
* LG WebOs

## Setup
1. Install and configure [rtv-server](packages/server/README.md)
2. Install and configure [rtv-cli](packages/cli/README.md)
3. For programmatic usage with Node.js please Install [rtv-client](packages/client/README.md)

## Run RTV in container
On Linux:
```bash
   docker run -it \
      -e USER=rtv \
      -e WEBOS_ACCOUNT_LOGIN={your_login} \
      -e WEBOS_ACCOUNT_PASSWORD={your_password} \
      --network=host \
      -v tvdata:/home/developer \
      kinopoisk/rtv
```

On MacOS:
```bash
   docker run -it \
      -e USER=rtv \
      -e WEBOS_ACCOUNT_LOGIN={your_login} \
      -e WEBOS_ACCOUNT_PASSWORD={your_password} \
      -p=3000:3000 \
      -v tvdata:/home/developer \
      kinopoisk/rtv
```
Note: NETWORK_MODE=host allows to scan and wake on LAN TVs, but doesn't work on MacOS.

Note: `WEBOS_ACCOUNT_LOGIN` and `WEBOS_ACCOUNT_PASSWORD` are required only for WebOS TVs.
They should be created [here](https://us.lgaccount.com/) and are used for login in WebOS Developer Mode application.

## Usage

### List all connected TVs
```bash
> rtv list

platform  ip           alias     name            modelYear  resolution  developerMode  developerIP  hasAccess  lastUsed
--------  -----------  --------- --------------  ---------  ----------  -------------  -----------  ---------  ----------------------
tizen     192.168.0.2  tizen23   [TV] Tizen 2.3  17         1920x1080   true           92.168.0.1   false      unknown
tizen     192.168.0.3  tizen24   [TV] Tizen 2.4  17         1920x1080   true           92.168.0.1   false      user (/api/tv/logs 1m)
```

### Get TV info by IP or alias
```bash
> rtv info 192.168.0.4

key            value
-------------  ------------
platform       tizen
ip             192.168.0.4
alias          tizen4
name           [TV] Tizen 4
modelName      UE49K5500
modelYear      16
resolution     1920x1080
developerMode  true
developerIP    192.168.0.1
hasAccess      true
osVersion      2.4.0
```

### List all TV apps
```bash
> rtv app-list 192.168.0.4

appId        name
-----------  -----------
11091000000  Facebook
11101000410  Vimeo
11101200001  Netflix
11101302013  Dailymotion
...
```

### Install app on TV
* From packaged file (`.wgt` for Tizen, `.ipk` for WebOS):
   ```bash
   > rtv app-install 192.168.0.4 App.wgt
   ```
* From ZIP file:
   ```bash
   > rtv app-install 192.168.0.4 App.zip
   ```
* From directory:
   ```bash
   > rtv app-install 192.168.0.4 ./path/to/app
   ```

### Launch app on TV
```bash
> rtv app-launch 192.168.0.4 TESTABCDEF.App
```

Launch with params:
```bash
> rtv app-launch 192.168.0.4 TESTABCDEF.App "{\"param\": \"...\"}"
```

### Debug app on TV with devtools
```bash
> rtv app-debug 192.168.0.4 TESTABCDEF.App

key       value
--------  ----------------------------------------------------------------------------------------------------------------
debugUrl  https://rtv-server-host/devtools/inspector.html?page=1&host=rtv-server-host/proxy/http/192.168.0.4/7011/
```
Open provided link in Chrome and debug app with devtools.

### More commands
```bash
> rtv help
```

## Development
`npm install` - installs dependencies
`npm run bootstrap` - does lerna bootstrap
`npm run dev` - builds packages and runs server in watch mode

#### Development in docker
1. Install [docker-compose](https://docs.docker.com/compose/install/)
2. Build image: `npm run docker:build`
3. Run docker container: `npm run docker:up`
4. Open RTV UI locally: http://localhost:3000

## Release
Releases goes separately to npm and docker registry.
Try keep them in sync.

#### Release to npm
1. Run tests: `npm t`
2. Bump version: `npm run release-minor` | `npm run release-patch`
3. Publish to npm: `npm run publish`
4. Push to GitHub: `git push`

#### Release Docker image
1. Build image: `npm run docker:build`
2. Run tests in container: `npm run docker:test`
3. Tag image: `docker tag rtv:latest kinopoisk/rtv:latest`
4. Push image to registry: `IMAGE=kinopoisk/rtv:latest npm run docker:push`
