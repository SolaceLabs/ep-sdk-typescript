import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventResponse, 
  EventsService,
  SchemaResponse,
  SchemasService,
  SchemaVersion, 
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError, 
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details
} from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkEpEventVersionTask, IEpSdkEpEventVersionTask_ExecuteReturn, TEpSdkEpEventVersionTask_Settings } from '../../../src/tasks/EpSdkEpEventVersionTask';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';
import EpSdkSchemaVersionsService from '../../../src/services/EpSdkSchemaVersionsService';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';
import { IEpSdkTask_TransactionLogData } from '../../../src/tasks/EpSdkTask_TransactionLog';
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from '../../../src/utils/EpSdkSemVerUtils';
import EpSdkEpEventVersionsService from '../../../src/services/EpSdkEpEventVersionsService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let SchemaId: string | undefined;
let SchemaVersionId: string | undefined;

const EventName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let EventId: string | undefined;
let EventVersionId: string | undefined;

describe(`${scriptName}`, () => {
    
  beforeEach(() => {
    TestContext.newItId();
  });

  before(async() => {
    const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
      requestBody: {
        name: ApplicationDomainName,
      }
    });
    ApplicationDomainId = applicationDomainResponse.data.id;

    const schemaResponse: SchemaResponse = await SchemasService.createSchema({
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: SchemaName,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        shared: true
      }
    });
    SchemaId = schemaResponse.data.id;

    const createSchemaVersion: SchemaVersion = {
      schemaId: SchemaId,
      displayName: 'displayName',
      description: `schema version for schema = ${SchemaName}, id=${SchemaId}`,        
      version: '1.0.0'
    };
    const createdSchemaVersion: SchemaVersion = await EpSdkSchemaVersionsService.createSchemaVersion({
      applicationDomainId: ApplicationDomainId,
      schemaId: SchemaId,
      schemaVersion: createSchemaVersion,
      targetLifecycleStateId: EpSdkStatesService.releasedId
    });
    SchemaVersionId = createdSchemaVersion.id;

    const eventResponse: EventResponse = await EventsService.createEvent({ 
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventName,
      }
    });
    EventId = eventResponse.data.id;

  });

  after(async() => {
    try {
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    } catch(e) {
      // noop
    }
  });

  it(`${scriptName}: setup`, async () => {
    // EpSdkLogger.getLoggerInstance().setLogLevel(EEpSdkLogLevel.Trace);
  });

  it(`${scriptName}: event version present: checkmode create`, async () => {
    try {

      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);

      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: event version present: create`, async () => {
    try {

      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      
      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create idempotency`, async () => {
    try {

      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);

      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.id, message).to.eq(EventVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: checkmode update`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);

      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.id, message).to.eq(EventVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: update`, async () => {
    try {

      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);

      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.eventId, message).to.eq(EventId);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq('1.2.1');

      EventVersionId = epSdkEpEventVersionTask_ExecuteReturn.epObject.id;
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: update , catch not semver error`, async () => {
    try {

      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: 'not-semver',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: event version absent`, async () => {
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: '1.2.0',
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create exact version match`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkVersionTaskStrategyValidationError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      const epSdkVersionTaskStrategyValidationError: EpSdkVersionTaskStrategyValidationError = e;
      const details: TEpSdkVersionTaskStrategyValidationError_Details = epSdkVersionTaskStrategyValidationError.details;
      expect(details.versionString, TestLogger.createEpSdkTestFailMessage('failed', e)).to.eq(ExactVersionString);
      expect(details.existingVersionString, TestLogger.createEpSdkTestFailMessage('failed', e)).to.eq(ExactVersionString);
      const transactionLogData: IEpSdkTask_TransactionLogData = epSdkVersionTaskStrategyValidationError.details.transactionLogData;
      expect(transactionLogData.epSdkTask_Action, TestLogger.createEpSdkTestFailMessage('failed', e)).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(transactionLogData.epSdkTask_IsUpdateRequiredFuncReturn.isUpdateRequired, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEpEventVersionTask = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        topicString: 'test/hello/world',
        eventVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          schemaVersionId: SchemaVersionId
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask.execute();
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage('wrong action', epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event version present: create version without updates to settings`, async () => {
    const settings: TEpSdkEpEventVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: 'description',
      displayName: 'displayName',
      schemaVersionId: SchemaVersionId
    }
    try {
      // create a reference version
      const epSdkEpEventVersionTask_Ref = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: 'test/hello/world',
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEpEventVersionTask_ExecuteReturn_Ref: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask_Ref.execute();
      const referenceVersionString: string = epSdkEpEventVersionTask_ExecuteReturn_Ref.epObject.version ? epSdkEpEventVersionTask_ExecuteReturn_Ref.epObject.version : 'not-a-version';
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkEpEventVersionTask_New = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: 'test/hello/world',
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      let epSdkEpEventVersionTask_ExecuteReturn: IEpSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask_New.execute();
      let message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      // get the latest version to check
      let latestVersionString = await EpSdkEpEventVersionsService.getLatestVersionString({ eventId: EventId });
      // expect no change in version
      expect(latestVersionString, message).to.eq(referenceVersionString);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);

      // now test exact match, checkmode=true for newVersion: should return Would create new version
      const epSdkEpEventVersionTask_NewCreatedCheck = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: 'test/hello/world',
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      epSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask_NewCreatedCheck.execute();
      message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq(newVersion);

      // now test exact match, checkmode=false for newVersion: should create it
      const epSdkEpEventVersionTask_NewCreated = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: 'test/hello/world',
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      epSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask_NewCreated.execute();
      message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq(newVersion);
      latestVersionString = await EpSdkEpEventVersionsService.getLatestVersionString({ eventId: EventId });
      expect(latestVersionString, message).to.eq(newVersion);

      // now test exact match, checkmode=true going back to reference version: should return Would fail
      const epSdkEpEventVersionTask_RefCheck = new EpSdkEpEventVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventId: EventId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventVersionSettings: settings,
        topicString: 'test/hello/world',
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      epSdkEpEventVersionTask_ExecuteReturn = await epSdkEpEventVersionTask_RefCheck.execute();
      message = TestLogger.createLogMessage('epSdkEpEventVersionTask_ExecuteReturn', epSdkEpEventVersionTask_ExecuteReturn);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
      expect(epSdkEpEventVersionTask_ExecuteReturn.epObject.version, message).to.eq(referenceVersionString);
      latestVersionString = await EpSdkEpEventVersionsService.getLatestVersionString({ eventId: EventId });
      expect(latestVersionString, message).to.eq(newVersion);

      // could also check the error for checkmode = false
      // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

