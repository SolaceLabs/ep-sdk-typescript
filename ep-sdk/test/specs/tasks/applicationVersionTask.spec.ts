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
  EpSdkInvalidSemVerStringError 
} from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkApplicationVersionTask, IEpSdkApplicationVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkApplicationVersionTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';


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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkInvalidSemVerStringError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });

});

