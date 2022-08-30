# Release Notes

Solace Event Portal SDK.

## Version 0.9.7-alpha

**Workarounds:**
  - added brokerType='solace' to Application create as a workaround

## Version 0.9.6-alpha

**Fixes:**
- **EpSdkEventApiVersionTask & EpSdkApplicationVersionTask**
  - fixed compare method to sort arrays of event version ids before comparision

## Version 0.9.5-alpha
**New Features:**
- Added support to define `declaredConsumedEventVersionIds` and `declaredProducedEventVersionIds` when creating a new ApplicationVersion


## Version 0.9.4-alpha

**Fixes:**
- **index.ts**
  - added: export * from './tasks/EpSdkApplicationTask';
  - added: export * from './tasks/EpSdkApplicationVersionTask';
- **EpSdkApplicationVersionTask**
  - fixed objectType in EpSdkApplicationVersionTask

## Version 0.9.3-alpha

**Refactor:**
- **EpSdk{xxx}VersionTask - manage versions strategy**
  - `version_strategy=bump_patch|bump_minor`: version in task config is a starting point, tasks will create new version by bumping latest version on any settings changes
  - `version_strategy=exact_version`: task must be able to create this exact version, which must not be lower than latest version, regardless of any settings changes

## Version 0.9.2-alpha
**Typos:**
- Fixed typo: createNotEpSdkErrorMesssage --> createNotEpSdkErrorMessage

## Version 0.9.1-alpha

**New Features:**
 - Added support for Application and Application Version management

**Enhancements:**
- **EpSdkTask**
  - made `execute()` public to allow for wrappers & task lists to execute any tasks
- **EpSdk{xxx}VersionTask**
  - for checkmode=true & versionStrategy=exact version
    - tasks return action=`WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT` instead of throwing `EpSdkVersionTaskStrategyValidationError`

**Fixes:**
- **EpSdkSchemaVersionTask**
  - fixed object type
- **EpSdk{xxx}VersionTask**
  - fixed `IEpSd{xxx}VersionTask_ExecuteReturn` to extend `IEpSdkTask_ExecuteReturn` instead of `IEpSdkEnumTask_ExecuteReturn`

**Documentation:**
- **devel/README**
  - added notes on how to use npm link for downstream projects

## Version 0.8.3-alpha

**Dependencies:**
 - updated: "@solace-labs/ep-openapi-node": "^2.0.0-alpha.2"

## Version 0.8.2-alpha

**Release**
- moved package to [@solace-labs/ep-sdk](https://www.npmjs.com/package/@solace-labs/ep-sdk)


## Version 0.8.1-alpha

**Release**
- moved package to [@solace-labs/ep-sdk-typescript](https://www.npmjs.com/package/@solace-labs/ep-sdk-typescript)

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

**Enhancements:**
- **EpSdkVersionTaskStrategyValidationError**
  - added typed details: `TEpSdkVersionTaskStrategyValidationError_Details` for error handling


## Version 0.2.8-alpha

**Enhancements:**
- **EpSdkVersionTasks**
  - added 'EEpSdk_VersionTaskStrategy.EXACT_VERSION' to version strategy
    - creates the exact version as defined in the `versionString` config if required
    - aborts with `EpSdkVersionTaskStrategyValidationError` if `versionString` is not greater than existing version

## Version 0.2.7-alpha

**Fixes:**
- fixed spelling mistakes in method names

## Version 0.2.6-alpha

**New Features:**
- **Services**
  - added: **EpSdkEventApisService**
  - added: **EpSdkEventApiVersionsService**
- **Tasks**
  - added: **EpSdkEventApiTask**
  - added: **EpSdkEventApiVersionTask**

## Version 0.2.5-alpha

**New Features:**
- **Services**
  - added: **EpSdkEpEventsService**
  - added: **EpSdkEpEventVersionsService**
- **Tasks**
  - added: **EpSdkEpEventTask**
  - added: **EpSdkEpEventVersionTask**


## Version 0.2.4-alpha

**New Features:**
- **Services**
  - added: **EpSdkSchemasService**
  - added: **EpSdkSchemaVersionsService**
- **Tasks**
  - added: **EpSdkSchemaTask**
  - added: **EpSdkSchemaVersionTask**

## Version 0.2.3-alpha

**New Features:**
- **Services**
  - added: **EpSdkEnumsService**
  - added: **EpSdkEnumVersionsService**
- **Tasks**
  - added: **EpSdkEnumTask**
  - added: **EpSdkEnumVersionTask**

## Version 0.2.2-alpha

- **EpTask: transaction log**
  - added object keys to transaction log

## Version 0.2.1-alpha

**New Features:**
- **Tasks**
  - added: **EpSdkApplicationDomainTask**

**Core:**
- **Task Framework**
  - added task framework to sdk


## Version 0.2.0-alpha

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

**Initial Alpha Release.**


---
