
# Remote display server
This is a websocket-based remote display built in NodeJS. It is currently in development, and is generally unusable as of right now.

## Installing
1) Clone the repo with `git clone https://github.com/blewert/remote-display-system`.
2) Run `npm install`
3) Alter `config/settings.json` with the relevant details (most importantly, the authentication token)
4) Alter `carousel.json` to what payloads you wish to send
5) Run `node server.js` to start the server

### An important note
Please, please, *please* change your authentication token in `config/settings.json` to something else. The default is just `password`, and you will be given if you try run this server with the default value.

## Connecting to the server
You can use your own custom websocket client to connect to the server, or use something like Postman for testing purposes. The remote display system waits for connections, and checks some criteria when a client connects. If all criteria are met, then a successful connection is made to the server. The criteria are as follows:

1) When attempting to connect, the client has passed an `authtoken` header.
2) The passed `authtoken` header matches the `authorisationToken` found in `config/settings.json`.
3) When attempting to connect, the client has passed a `displayid` header.
4) The `displayid` header is parseable as an int with `parseInt`.
5) The `displayid` passed is not already in use by another client.

If all of these are satisfied, a connection is made, otherwise, the client is immediately disconnected.

## Changelog
| Version | Date         | Notes |
|---------|--------------|-------|
| `1.0.0`   | n/a          | First initial upload
| `1.0.1`   | 16/11/21     | Working logger & basis for carousel system
| `1.0.2`   | 16/11/21     | Added basic authentication
| `1.0.3`   | 16/11/21     | Adds `displayID` identification
| `1.0.4`   | 16/11/21     | Adds some operating modes for carousel system
| `1.0.5`   | 19/11/21     | Full connection handshake & validation 