import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, ApplicationDomainResponse, ApplicationDomainsService, EnumResponse, EnumsService
 } from '../../../src/sep-openapi-node';
import { EpSdkError, EpSdkFeatureNotSupportedError, EpSdkInvalidSemVerStringError } from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkEnumVersionTask, IEpSdkEnumVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkEnumVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';


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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });

});

