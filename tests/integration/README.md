# Integration tests

## Configure

Copy `config/example.js` to `config/production.js`, `config/staging.js`, and
`config/development.js`. Fill in instance credentials for each.

By default the tests will run against production. To run against staging or development change

```js
} from "./config/production"
```

in `main.js` to

```js
} from "./config/staging"
```

or

```js
} from "./config/development"
```

## Run

    $ yarn lint:build:test

## WARNING

The tests completely wipe the instance on teardown -- so obviously don't do
this with an instance you're using for anything else!
