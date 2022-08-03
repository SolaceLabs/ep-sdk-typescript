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
} from '@solace-iot-team/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError 
} from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkEpEventVersionTask, IEpSdkEpEventVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkEpEventVersionTask';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';
import EpSdkSchemaVersionsService from '../../../src/services/EpSdkSchemaVersionsService';

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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });

});

