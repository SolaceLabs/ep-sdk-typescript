# Release Notes

Solace Event Portal SDK.

## Version 0.27.0-alpha

**Enhancements:**
- **EpSdkEventApiProductVersionsService**
  - methods: `listAllLatestVersions()`, `listLatestVersions()`, `getVersionsForEventApiProductId()`, `getObjectAndVersionForEventApiProductId()`
    - changed parameter `stateId:string;` to `stateIds?: Array<string>;`
    - allows to search for 1 or multiple state ids 

## Version 0.26.0-alpha

**New Features:**
- **EpSdkMessagingService**
  - service for messaging services


## Version 0.25.1-alpha

**Fixes:**
- **EpSdkEventApiProductVersionsService.sortEpSdkEventApiProductAndVersionList()**
  - accepts now nested property names as field names to sort on, e.g. `propertyA.propertyB`

## Version 0.25.0-alpha

**Enhancements:**
- **EpSdkEventApiProductVersionsService**
  - new: `listAllLatestVersions()` - list all latest versions without paging or sorting
  - modified: `listLatestVersions()` - added sort info

## Version 0.24.0-alpha

**Maintenance:**
- upgrade to EP API 2.0.5
- replaced deprecated api calls

## Version 0.23.0-alpha

**Enhancements:**
- **EpSdkCustomAttributesQueryService**
  - added operator: `IS_EMPTY`
  - tests if attribute is empty or set

## Version 0.22.0-alpha

**New Features:**
- **EpSdkCustomAttributesQueryService**
  - simple query expression for attributes
  - supports list of `AND` comparisons with optional `OR` comparisons, operators: `isEqual` and `contains`
- **EpSdkEventApiVersionsService**
  - new method: `getObjectAndVersionForEventApiVersionId()`

**Enhancements:**
- **EpSdkEventApiProductVersionsService**
  - added argument: `objectAttributesQuery`
    - allows to filter list using query expressions on attributes
  - optional argument: `withAtLeastOnePlan`
    - select only versions with at least one plan
  - optional argument: `withAtLeastOneAMessagingService`
    - select only versions with at least one messaging service
  - methods:
    - `listLatestVersions()`,
    - `getVersionsForEventApiProductId()`,
    - `getObjectAndVersionForEventApiProductId()`,
    - `getLatestVersionForEventApiProductId()`
    - `listAll()`



**Breaking Changes:**
- **EpSdkEventApiProductVersionsService**
  - change name from `getVersionForEventApiProductId()` to `getObjectAndVersionForEventApiProductId()`


## Version 0.21.0-alpha

**Added Support for Event Portal Attributes:**
* **New: EpSdkCustomAttributeDefinitionsService**
* **New: EpSdkCustomAttributeDefinitionTask**
* **New methods: ApplicationsService**
  - `setCustomAttributes()`
  - `unsetCustomAttributes()`
  - `removeAssociatedEntityTypeFromCustomAttributeDefinitions()`
* **New methods: EpSdkEventApiProductsService**
  - `setCustomAttributes()`
  - `unsetCustomAttributes()`
  - `removeAssociatedEntityTypeFromCustomAttributeDefinitions()`
* **New methods: EpSdkEpEventsService**
  - `setCustomAttributes()`
  - `unsetCustomAttributes()`
  - `removeAssociatedEntityTypeFromCustomAttributeDefinitions()`

**New Service: EpSdkApplicationVersionsService**
  - support methods for application versions

## Version 0.20.0-alpha

**EP API**
- upgrade to use "@solace-labs/ep-openapi-node": "^2.0.1"

## Version 0.14.3-alpha

**Fixes:**
- EpSdk version objects types: added stateId to be mandatory

## Version 0.14.2-alpha

**Fixes:**
- export of types in index.ts & added imports to tests

## Version 0.14.1-alpha

**Fixes:**
- export of types in index.ts

## Version 0.14.0-alpha

**New Features:**
- **EpSdkEpEventsService**
  - `listAll()`: lists all events
- **EpSdkEpEventVersionsService**
  - `listLatestVersions()`: lists latest event versions

**Fixes:**
- added brokerType to various calls - now mandatory in EP API

## Version 0.13.0-alpha

**New Features:**
- **Copy latest version from / to application domain if no version exists in target application domain:**
  - **EpSdkEnumVersionsService.copyLastestVersionById_IfNotExists()**
  - **EpSdkSchemaVersionsService.copyLastestVersionById_IfNotExists()**

- **Deep copy of latest version from / to application domain if not version exists in target application domain**
  - **EpSdkEpEventVersionsService.deepCopyLastestVersionById_IfNotExists()**
    - copies referenced schema version and enum versions for latest event version
    - copies latest event version
  - **EpSdkEventApiVersionsService.deepCopyLastestVersionById_IfNotExists()**
    - deep copies referenced event versions (see above)
    - copies latest event api version

**Changes:**
  - Tasks do not set a default description any more

## Version 0.12.0-alpha

**New Features:**
- **EpSdkEventApiProductsService**
  - services for event api products
- **EpSdkEventApiProductVersionsService**
  - services for event api product versions

## Version 0.11.0-alpha

**Enhancements:**
- **EpSdkSchemasService**
  - added `avro` schema type to `EEpSdkSchemaType`

## Version 0.10.1-alpha

**Enhancements:**
- version tasks: **EpSdk{object}VersionTask**
  - create truncated version display name if provided display name exceeds max length defined in EP OpenAPI spec.
  - adds elipses (...) to indicate truncation to user

## Version 0.10.0-alpha

**Core:**

- **Upgrade to @solace-labs/ep-openapi-node@2.3.0.beta.1**

- removed **EpSdkAbstractMethodError**, declared methods as abstract instead

**Breaking Changes:**
- Release contains breaking changes.

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
