# Development ep-sdk

## Build

```bash
npm install
npm run build
```


## Run Tests

```bash
export EP_SDK_TEST_SOLACE_CLOUD_TOKEN={token}
npm test

```

### Run a Single Test
````bash
# set the env
source ./test/source.env.sh
# run test
# for example:
npx mocha --config test/.mocharc.yml test/specs/misc/pino.spec.ts
# pretty print server output:
npx mocha --config test/.mocharc.yml test/specs/misc/pino.spec.ts | npx pino-pretty
# unset the env
unset_source_env
````

## Link

```bash
npm run dev:build
npm link
```

### Consuming Link
```bash
cd {consuming project}
npm link @solace-labs/ep-sdk
npm list
```

#### Unlink Consuming Link
```bash
cd {consuming project}
npm unlink --no-save @solace-labs/ep-sdk
# NOTE: now install the released package
npm install
npm list
```


---

The End.
