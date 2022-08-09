# Release Notes

Solace Event Portal SDK.

## Version 0.8.0-alpha

**Enhancements:**
* **VersionsServices**
  - added paging when retrieving latest version to:
    - EpSdkEnumVersionsService
    - EpSdkEpEventVersionsService
    - EpSdkEventApiVersionsService
    - EpSdkSchemaVersionsService

**Tests:**
- added test coverage using nyc

**License**
- moved to apache 2.0

## Version 0.7.0-alpha

**Documentation:**
  * added generation of tsdocs and linked into doc site

## Version 0.6.0-alpha

**Core:**
- **@solace-labs/ep-openapi-node**
  - switched to using new npm package


## Version 0.5.0-alpha

**Enhancements:**
- **EpSdkStatesService**
  - added a validation method for testing

## Version 0.5.0-alpha

**Core:**
- **EpSdkClient**
  - re-factored so an OpenAPI instance is passed as parameter to initialize() method
  - this allows to use a global OpenAPI instance
  - works now with `npm link` (for dev) as well


## Version 0.4.1-alpha

**Packaging:**
- fixed index.ts

## Version 0.4.0-alpha

**Packaging:**
- refactored packaging with index.js and index.d.ts for ease of import & support of npm link

## Version 0.3.0-alpha

**Core:**
- **ep-openapi-node**
  - switched to packaged ep-openapi-node and removed from repo

## Version 0.2.9-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**Enhancements:**
- **EpSdkVersionTaskStrategyValidationError**
  - added typed details: `TEpSdkVersionTaskStrategyValidationError_Details` for error handling


## Version 0.2.8-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**Enhancements:**
- **EpSdkVersionTasks**
  - added 'EEpSdk_VersionTaskStrategy.EXACT_VERSION' to version strategy
    - creates the exact version as defined in the `versionString` config if required
    - aborts with `EpSdkVersionTaskStrategyValidationError` if `versionString` is not greater than existing version

## Version 0.2.7-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**Fixes:**
- fixed spelling mistakes in method names

## Version 0.2.6-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Services**
  - added: **EpSdkEventApisService**
  - added: **EpSdkEventApiVersionsService**
- **Tasks**
  - added: **EpSdkEventApiTask**
  - added: **EpSdkEventApiVersionTask**

## Version 0.2.5-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Services**
  - added: **EpSdkEpEventsService**
  - added: **EpSdkEpEventVersionsService**
- **Tasks**
  - added: **EpSdkEpEventTask**
  - added: **EpSdkEpEventVersionTask**


## Version 0.2.4-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Services**
  - added: **EpSdkSchemasService**
  - added: **EpSdkSchemaVersionsService**
- **Tasks**
  - added: **EpSdkSchemaTask**
  - added: **EpSdkSchemaVersionTask**

## Version 0.2.3-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Services**
  - added: **EpSdkEnumsService**
  - added: **EpSdkEnumVersionsService**
- **Tasks**
  - added: **EpSdkEnumTask**
  - added: **EpSdkEnumVersionTask**

## Version 0.2.2-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

- **EpTask: transaction log**
  - added object keys to transaction log

## Version 0.2.1-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Tasks**
  - added: **EpSdkApplicationDomainTask**

**Core:**
- **Task Framework**
  - added task framework to sdk


## Version 0.2.0-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**New Features:**
- **Services**
  - added services framework
  - added `EpSdkApplicationDomainsService`
- **Logger**
  - added `EpSdkLogger` - allows user to initialize the sdk with their own logger
  - default: `EpSdkConsoleLogger` - uses console to log
- **Errors**
  - added `EpSdkErrors` - a collection of sdk specific errors


## Version 0.1.0-alpha
  * [Solace Event Portal OpenAPI](https://github.com/solace-iot-team/ep-sdk/blob/main/resources/sep-openapi-spec.2.0.0-ea.json): '2.0.0-ea'

**Initial Alpha Release.**


---
