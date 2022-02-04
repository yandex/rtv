## Installation

1. To support Tizen please install [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) and make the following commands available in terminal:

   - `tizen`
   - `sdb`

2. [Tizen certificates should be issued](https://developer.tizen.org/ko/development/tizen-studio/native-tools/cli?langredirect=1#Issuing_a_Tizen_Certificate) and [Tizen profile should be created](https://developer.tizen.org/ko/development/tizen-studio/native-tools/cli?langredirect=1#Managing_a_Security_Profile)

3. To support webOS please install [webOS SDK](http://webostv.developer.lge.com/sdk/installation/) and make the following commands available in terminal:
   - `ares-*`

## HTTP server

Acts as a proxy from developer machine to TV.
Includes web client to send commands from browser.

## Supported platforms

- Samsung Tizen
- LG webOS

## Install

```bash
npm install rtv-server
```

## Config .rtv-server

```json
{
  "port": 3000,
  "httpsPort": 3001,
  "httpsCert": "path/to/cert/file.crt",
  "httpsKey": "path/to/key/file.key",
  "sdbPath": "~/tizen-studio/tools",
  "tizenPath": "~/tizen-studio/tools/ide/bin",
  "aresPath": "~/webOS_TV_SDK/CLI/bin",
  "webosAccountLogin": "your_lg_login",
  "webosAccountPassword": "your_lg_password"
}
```

Note: `webosAccountLogin` and `webosAccountPassword` are required only for WebOS TVs.
They should be created [here](https://us.lgaccount.com/login/sign_in) and are used for login in WebOS Developer Mode application.

## Run server

```bash
rtv-server
```
