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
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError, 
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details
} from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkSchemaVersionTask, IEpSdkSchemaVersionTask_ExecuteReturn, TEpSdkSchemaVersionTask_Settings } from '../../../src/tasks/EpSdkSchemaVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';
import { IEpSdkTask_TransactionLogData } from '../../../src/tasks/EpSdkTask_TransactionLog';
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from '../../../src/utils/EpSdkSemVerUtils';
import EpSdkSchemaVersionsService from '../../../src/services/EpSdkSchemaVersionsService';


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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn', epSdkSchemaVersionTask_ExecuteReturn);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkSchemaVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
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

  it(`${scriptName}: schema version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkSchemaVersionTask = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
        checkmode: true,
      });
      const epSdkSchemaVersionTask_ExecuteReturn: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask.execute();
      expect(epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage('wrong action', epSdkSchemaVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema version present: create version without updates to settings`, async () => {
    const settings: TEpSdkSchemaVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: 'description',
      displayName: 'displayName',
      content: SchemaContent
    }
    try {
      // create a reference version
      const epSdkSchemaVersionTask_Ref = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn_Ref: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask_Ref.execute();
      const referenceVersionString: string = epSdkSchemaVersionTask_ExecuteReturn_Ref.epObject.version ? epSdkSchemaVersionTask_ExecuteReturn_Ref.epObject.version : 'not-a-version';
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkSchemaVersionTask_New = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkSchemaVersionTask_ExecuteReturn_New: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask_New.execute();
      const message_New = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn_New', epSdkSchemaVersionTask_ExecuteReturn_New);
      // get the latest version to check
      const latestVersionString = await EpSdkSchemaVersionsService.getLatestVersionString({ schemaId: SchemaId });
      expect(latestVersionString, message_New).to.eq(newVersion);
      expect(epSdkSchemaVersionTask_ExecuteReturn_New.epSdkTask_TransactionLogData.epSdkTask_Action, message_New).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);

      // now test exact match fail in checkmode going back to referenceVersion
      const epSdkSchemaVersionTask_WouldFail = new EpSdkSchemaVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaId: SchemaId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        schemaVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      const epSdkSchemaVersionTask_ExecuteReturn_WouldFail: IEpSdkSchemaVersionTask_ExecuteReturn = await epSdkSchemaVersionTask_WouldFail.execute();
      const message_WouldFail = TestLogger.createLogMessage('epSdkSchemaVersionTask_ExecuteReturn_WouldFail', epSdkSchemaVersionTask_ExecuteReturn_WouldFail);
      expect(epSdkSchemaVersionTask_ExecuteReturn_WouldFail.epSdkTask_TransactionLogData.epSdkTask_Action, message_WouldFail).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
      // DEBUG
      // expect(false, message_WouldFail).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

