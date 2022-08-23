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
  ApplicationResponse, 
  ApplicationsService
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError, 
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details
} from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkApplicationVersionTask, IEpSdkApplicationVersionTask_ExecuteReturn, TEpSdkApplicationVersionTask_Settings } from '../../../src/tasks/EpSdkApplicationVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';
import { IEpSdkTask_TransactionLogData } from '../../../src/tasks/EpSdkTask_TransactionLog';
import EpSdkSemVerUtils, { EEpSdk_VersionStrategy } from '../../../src/utils/EpSdkSemVerUtils';
import EpSdkApplicationVersionsService from '../../../src/services/EpSdkApplicationVersionsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const ApplicationName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let ApplicationId: string | undefined;
const ApplicationVersionName = `${TestSpecId}`;
let ApplicationVersionId: string | undefined;

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
    const applicationResponse: ApplicationResponse = await ApplicationsService.createApplication({ 
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: ApplicationName,
        applicationType: "standard"
      }
    });
    ApplicationId = applicationResponse.data.id;
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

  it(`${scriptName}: application version present: checkmode create`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings:{
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'description',
        },
        checkmode: true,
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: application version present: create`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      
      ApplicationVersionId = epSdkApplicationVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: create idempotency`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: checkmode update`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: update`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.applicationId, message).to.eq(ApplicationId);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq('1.2.1');

      ApplicationVersionId = epSdkApplicationVersionTask_ExecuteReturn.epObject.id;
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: update , catch not semver error`, async () => {
    try {

      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: 'not-semver',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description again',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: application version absent`, async () => {
    try {
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: '1.2.0',
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: create exact version match`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
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

  it(`${scriptName}: application version present: create exact version match with checkmode: should return would fail`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkApplicationVersionTask = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          displayName: ApplicationVersionName,
          description: 'updated description',
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });
      const epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask.execute();
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage('wrong action', epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: application version present: create version without updates to settings`, async () => {
    const settings: TEpSdkApplicationVersionTask_Settings = {
      stateId: EpSdkStatesService.releasedId,
      description: 'description',
      displayName: 'displayName',
    }
    try {
      // create a reference version
      const epSdkApplicationVersionTask_Ref = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        // versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkApplicationVersionTask_ExecuteReturn_Ref: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask_Ref.execute();
      const referenceVersionString: string = epSdkApplicationVersionTask_ExecuteReturn_Ref.epObject.version ? epSdkApplicationVersionTask_ExecuteReturn_Ref.epObject.version : 'not-a-version';
      // bump the version
      const newVersion = EpSdkSemVerUtils.createNextVersionByStrategy({
        fromVersionString: referenceVersionString,
        strategy: EEpSdk_VersionStrategy.BUMP_MINOR,
      });
      // create new version even no other updates to settings
      const epSdkApplicationVersionTask_New = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: newVersion,
        // versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      let epSdkApplicationVersionTask_ExecuteReturn: IEpSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask_New.execute();
      let message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      // get the latest version to check
      let latestVersionString = await EpSdkApplicationVersionsService.getLatestVersionString({ applicationId: ApplicationId });
      // expect no change in version
      expect(latestVersionString, message).to.eq(referenceVersionString);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);

      // now test exact match, checkmode=true for newVersion: should return Would create new version
      const epSdkApplicationVersionTask_NewCreatedCheck = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      epSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask_NewCreatedCheck.execute();
      message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq(newVersion);

      // now test exact match, checkmode=false for newVersion: should create it
      const epSdkApplicationVersionTask_NewCreated = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: newVersion,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      epSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask_NewCreated.execute();
      message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq(newVersion);
      latestVersionString = await EpSdkApplicationVersionsService.getLatestVersionString({ applicationId: ApplicationId });
      expect(latestVersionString, message).to.eq(newVersion);

      // now test exact match, checkmode=true going back to reference version: should return Would fail
      const epSdkApplicationVersionTask_RefCheck = new EpSdkApplicationVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        applicationId: ApplicationId,
        versionString: referenceVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        applicationVersionSettings: settings,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      epSdkApplicationVersionTask_ExecuteReturn = await epSdkApplicationVersionTask_RefCheck.execute();
      message = TestLogger.createLogMessage('epSdkApplicationVersionTask_ExecuteReturn', epSdkApplicationVersionTask_ExecuteReturn);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
      expect(epSdkApplicationVersionTask_ExecuteReturn.epObject.version, message).to.eq(referenceVersionString);
      latestVersionString = await EpSdkApplicationVersionsService.getLatestVersionString({ applicationId: ApplicationId });
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

