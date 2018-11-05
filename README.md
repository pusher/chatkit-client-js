# Chatkit JS

[![Read the docs](https://img.shields.io/badge/read_the-docs-92A8D1.svg)](https://docs.pusher.com/chatkit/reference/javascript)
[![Twitter](https://img.shields.io/badge/twitter-@Pusher-blue.svg?style=flat)](http://twitter.com/Pusher)
[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg)](https://github.com/pusher/chatkit-client-js/blob/master/LICENSE.md)
[![npm version](https://badge.fury.io/js/%40pusher%2Fchatkit-client.svg)](https://badge.fury.io/js/%40pusher%2Fchatkit-client)

The JavaScript client for Pusher Chatkit. If you aren't already here, you can find the source [on Github](https://github.com/pusher/chatkit-client-js).

For more information on the Chatkit service, [see here](https://pusher.com/chatkit). For full documentation, [see here](https://docs.pusher.com/chatkit)

## Installation

### Yarn

[yarn](https://yarnpkg.com/):

```sh
$ yarn add @pusher/chatkit-client
```

[npm](https://www.npmjs.com/):

```sh
$ npm install @pusher/chatkit-client
```

## Getting started

Head over to [our documentation](https://docs.pusher.com/chatkit/reference/javascript).

## Development

### Testing

Lint, build, and run the tests in electron with

```sh
yarn lint:build:test
```

or, to run the tests in chrome

```sh
yarn lint:build:test:chrome
```

Formatting should largely be delegated to prettier, which can be invoked manually with

```sh
yarn format
```

or you can set your editor up to run prettier on save.

### Publishing

Running `yarn publish-please` will walk you through the publishing steps.
