
# Remote display server
This is a websocket-based remote display built in NodeJS. It is currently in development, and is generally unusable as of right now


## Installing
1) Clone the repo with `git clone https://github.com/blewert/remote-display-system`.
2) Run `npm install`
3) Alter `config/settings.json` with the relevant details (most importantly, the authentication token)
4) Alter `carousel.json` to what payloads you wish to send
5) Run `node server.js` to start the server


## An important note
Please, please, *please* change your authentication token in `config/settings.json` to something else. The default is just `password`, and you will be given if you try run this server with the default value.


## Changelog
| Version | Date         | Notes |
|---------|--------------|-------|
| `1.0.0`   | n/a          | First initial upload
| `1.0.1`   | 16/11/21     | Working logger & basis for carousel system
| `1.0.2`   | 16/11/21     | Added basic authentication

