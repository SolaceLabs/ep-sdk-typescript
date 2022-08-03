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
  SchemaResponse, 
  SchemasService
} from '@solace-iot-team/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError 
} from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkSchemaVersionTask, IEpSdkSchemaVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkSchemaVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let SchemaId: string | undefined;
const SchemaVersionName = `${TestSpecId}`;
let SchemaVersionId: string | undefined;

const SchemaContent = `
{
  "description": "Generic message header.",
  "type": "object",
  "properties": {
    "sentAt": {
      "type": "string",
      "format": "date-time",
      "description": "Date and time when the message was sent."
    },
    "transactionId": {
      "type": "string",
      "description": "The transaction id."
    },
    "storeId": {
      "type": "string",
      "description": "The store id."
    }
  },
  "required": [
    "sentAt",
    "transactionId",
    "storeId"
  ]
}
`;

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
        contentType: EEpSdkSchemaContentType.APPLICATION_JSON,
        schemaType: EEpSdkSchemaType.JSON_SCHEMA,
      }
    });
    SchemaId = schemaResponse.data.id;
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

  it(`${scriptName}: schema version present: checkmode create`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: schema version present: create`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      
      SchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create idempotency`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.id, message).to.eq(SchemaVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: checkmode update`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'updated description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.id, message).to.eq(SchemaVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: update`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'updated description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.schemaId, message).to.eq(SchemaId);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.version, message).to.eq('1.2.1');

      SchemaVersionId = epSdkSchemaVersionTask_ExecuteReturn.epObject.id;
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: update , catch not semver error`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: 'not-semver',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'updated description again',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version absent`, async () => {
    try {

      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: '1.2.0',
        schemaVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: SchemaVersionName,
          description: 'updated description',
          content: SchemaContent
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });

});

