import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, ApplicationDomainResponse, ApplicationDomainsService
} from '@solace-iot-team/ep-openapi-node';
import { EpSdkError } from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { 
  EpSdkEventApiTask, 
  IEpSdkEventApiTask_ExecuteReturn 
} from '../../../src/tasks/EpSdkEventApiTask';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const EventApiName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let EventApiId: string | undefined;

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

  it(`${scriptName}: event api present: checkmode create`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: event api present: create`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      
      EventApiId = epSdkEventApiTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api present: create: idempotency`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api present: checkmode update`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api present: update`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api present: idempotency`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        eventApiObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api absent: checkmode with existing`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api absent`, async () => {
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: EventApiName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });

      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkEventApiTask_ExecuteReturn.epObject.id, message).to.eq(EventApiId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api absent: checkmode with non-existing`, async () => {
    const NonExisting = 'non-existing';
    try {
      const epSdkEventApiTask = new EpSdkEventApiTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventApiName: NonExisting,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false
      });
      const epSdkEventApiTask_ExecuteReturn: IEpSdkEventApiTask_ExecuteReturn = await epSdkEventApiTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiTask_ExecuteReturn', epSdkEventApiTask_ExecuteReturn);

      expect(epSdkEventApiTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

