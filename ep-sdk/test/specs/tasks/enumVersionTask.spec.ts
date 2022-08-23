import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, ApplicationDomainResponse, ApplicationDomainsService, EnumResponse, EnumsService
} from '@solace-labs/ep-openapi-node';
import { EpSdkError, EpSdkFeatureNotSupportedError, EpSdkInvalidSemVerStringError, EpSdkVersionTaskStrategyValidationError, TEpSdkVersionTaskStrategyValidationError_Details } from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkEnumVersionTask, IEpSdkEnumVersionTask_ExecuteReturn, TEpSdkEnumVersionTask_Settings } from '../../../src/tasks/EpSdkEnumVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';
import { IEpSdkTask_TransactionLogData } from '../../../src/tasks/EpSdkTask_TransactionLog';
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from '../../../src/utils/EpSdkSemVerUtils';
import EpSdkEnumVersionsService from '../../../src/services/EpSdkEnumVersionsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const EnumName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let EnumId: string | undefined;
const EnumVersionName = `${TestSpecId}`;
let EnumVersionId: string | undefined;

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
    const enumResponse: EnumResponse = await EnumsService.createEnum({ 
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EnumName,
      }
    });
    EnumId = enumResponse.data.id;
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

  it(`${scriptName}: enum version present: checkmode create`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        versionStrategy: EEpSdk_VersionTaskStrategy.BUMP_PATCH,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: enum version present: create`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      
      EnumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: create`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.id, message).to.eq(EnumVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: checkmode update`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.id, message).to.eq(EnumVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: update`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.enumId, message).to.eq(EnumId);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.version, message).to.eq('1.2.1');

      EnumVersionId = epSdkEnumVersionTask_ExecuteReturn.epObject.id;
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: update`, async () => {
    try {

      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: 'not-semver',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version absent`, async () => {
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: '1.2.0',
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: create exact version match`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
          description: 'description',
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
          description: 'description',
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn', epSdkEnumVersionTask_ExecuteReturn);
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEnumVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
          description: 'updated description',
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
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

  it(`${scriptName}: event api version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEnumVersionTask = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: EnumVersionName,
          description: 'updated description',
        },
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkEnumVersionTask_ExecuteReturn: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask.execute();
      expect(epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage('wrong action', epSdkEnumVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum version present: create version without updates to settings`, async () => {
    const settings: TEpSdkEnumVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: 'description',
      displayName: 'displayName',
    }
    try {
      // create a reference version
      const epSdkEnumVersionTask_Ref = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: settings,
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEnumVersionTask_ExecuteReturn_Ref: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask_Ref.execute();
      const referenceVersionString: string = epSdkEnumVersionTask_ExecuteReturn_Ref.epObject.version ? epSdkEnumVersionTask_ExecuteReturn_Ref.epObject.version : 'not-a-version';
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkEnumVersionTask_New = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: settings,
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEnumVersionTask_ExecuteReturn_New: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask_New.execute();
      const message_New = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn_New', epSdkEnumVersionTask_ExecuteReturn_New);
      // get the latest version to check
      const latestVersionString = await EpSdkEnumVersionsService.getLatestVersionString({ enumId: EnumId });
      expect(latestVersionString, message_New).to.eq(newVersion);
      expect(epSdkEnumVersionTask_ExecuteReturn_New.epSdkTask_TransactionLogData.epSdkTask_Action, message_New).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);

      // now test exact match fail in checkmode going back to referenceVersion
      const epSdkEnumVersionTask_WouldFail = new EpSdkEnumVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumId: EnumId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        enumVersionSettings: settings,
        enumValues: [ 'one', 'two', 'three'],
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      const epSdkEnumVersionTask_ExecuteReturn_WouldFail: IEpSdkEnumVersionTask_ExecuteReturn = await epSdkEnumVersionTask_WouldFail.execute();
      const message_WouldFail = TestLogger.createLogMessage('epSdkEnumVersionTask_ExecuteReturn_WouldFail', epSdkEnumVersionTask_ExecuteReturn_WouldFail);
      expect(epSdkEnumVersionTask_ExecuteReturn_WouldFail.epSdkTask_TransactionLogData.epSdkTask_Action, message_WouldFail).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
      // DEBUG
      // expect(false, message_WouldFail).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

