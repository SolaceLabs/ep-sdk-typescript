# Development ep-sdk


## Download Solace Event Portal Open API Spec

```bash
cd resources
curl https://openapi-v2.solace.cloud/api-docs-v2.json --output ./sep-openapi-spec.{version}.json
ln -s sep-openapi-spec.{version}.json sep-openapi-spec.json
```

## Dev Build

```bash
npm install
npm run dev:build
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


---

The End.
