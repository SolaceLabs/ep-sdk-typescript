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
  ApplicationDomainsService
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkEnumTask,
  IEpSdkEnumTask_ExecuteReturn,
  EEpSdkTask_Action,
  EEpSdkTask_TargetState,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const EnumName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let EnumId: string | undefined;

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

  it(`${scriptName}: enum present: checkmode create`, async () => {
    try {
      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: enum present: create`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        }
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      
      EnumId = epSdkEnumTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum present: create: nothing to do`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        }
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();

      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum present: checkmode update`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum present: update`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum present: no action`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        enumObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum absent: checkmode with existing`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);

      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum absent`, async () => {
    try {

      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        enumName: EnumName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkEnumTask_ExecuteReturn.epObject.id, message).to.eq(EnumId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: enum absent: checkmode with non-existing`, async () => {
    try {

      const NonExisting = 'non-existing';


      const epSdkEnumTask = new EpSdkEnumTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        enumName: NonExisting,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEnumTask_ExecuteReturn: IEpSdkEnumTask_ExecuteReturn = await epSdkEnumTask.execute();
      
      const message = TestLogger.createLogMessage('epSdkEnumTask_ExecuteReturn', epSdkEnumTask_ExecuteReturn);
      expect(epSdkEnumTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

