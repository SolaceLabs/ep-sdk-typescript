# Development ep-sdk

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


---

The End.
