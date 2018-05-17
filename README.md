# command-server

Execute commands via a SSL encrypted connection.

[![CircleCI](https://circleci.com/gh/robojones/command-server.svg?style=svg)](https://circleci.com/gh/robojones/command-server)

[![Test Coverage](https://api.codeclimate.com/v1/badges/f74e4d181314dd0d1e31/test_coverage)](https://codeclimate.com/github/robojones/command-server/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/f74e4d181314dd0d1e31/maintainability)](https://codeclimate.com/github/robojones/command-server/maintainability)

This package allows you to define commands and execute them from another device via an encrypted connection.

## The Plan

- [x] Token Transmission Layer (token-server package)
- [x] Queue Layer (for client)
	- expiry timestamp
	- check when sending
	- is not in the messge but will be passed to the Client#enqueue(token, expiresIn)
	- enque until next "connect", then send.
- [ ] Response Layer
	- messages get ids
	- promises
	- reject promise when expired (use setTimeout)

