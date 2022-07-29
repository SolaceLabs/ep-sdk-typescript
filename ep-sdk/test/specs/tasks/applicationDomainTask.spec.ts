import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError
 } from '../../../src/sep-openapi-node';
import { EpSdkError } from '../../../src/EpSdkErrors';
import { EpSdkApplicationDomainTask, IEpSdkApplicationDomainTask_ExecuteReturn } from '../../../src/tasks/EpSdkApplicationDomainTask';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EEpSdkLogLevel, EpSdkLogger } from '../../../src/EpSdkLogger';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestUtils.getUUID()}`;
let ApplicationDomainId: string | undefined;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
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

    it(`${scriptName}: application domain present: checkmode create`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainName: ApplicationDomainName,
          applicationDomainSettings: {
            // description: 
          },
          epSdkTask_TransactionConfig: {
            parentTransactionId: 'parentTransactionId',
            groupTransactionId: 'groupTransactionId'
          },
          checkmode: true
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();

        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });
    
    it(`${scriptName}: application domain present: create`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainName: ApplicationDomainName,
          applicationDomainSettings: {
            // description: 
          },
          epSdkTask_TransactionConfig: {
            parentTransactionId: 'parentTransactionId',
            groupTransactionId: 'groupTransactionId'
          }
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();

        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
        
        ApplicationDomainId = epSdkApplicationDomainTask_ExecuteReturn.epObject.id;

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: application domain present: checkmode update`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainName: ApplicationDomainName,
          applicationDomainSettings: {
            description: 'updated description'
          },
          epSdkTask_TransactionConfig: {
            parentTransactionId: 'parentTransactionId',
            groupTransactionId: 'groupTransactionId'
          },
          checkmode: true
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();
        
        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationDomainId);


      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: application domain present: update`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
          applicationDomainName: ApplicationDomainName,
          applicationDomainSettings: {
            description: 'updated description'
          },
          epSdkTask_TransactionConfig: {
            parentTransactionId: 'parentTransactionId',
            groupTransactionId: 'groupTransactionId'
          }
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();
        
        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationDomainId);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: application domain absent: checkmode`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
          applicationDomainName: ApplicationDomainName,
          checkmode: true
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();

        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationDomainId);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: application domain absent`, async () => {
      try {

        const epSdkApplicationDomainTask = new EpSdkApplicationDomainTask({
          epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
          applicationDomainName: ApplicationDomainName,
        });

        const epSdkApplicationDomainTask_ExecuteReturn: IEpSdkApplicationDomainTask_ExecuteReturn = await epSdkApplicationDomainTask.execute();

        const message = TestLogger.createLogMessage('epSdkApplicationDomainTask_ExecuteReturn', epSdkApplicationDomainTask_ExecuteReturn);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
        expect(epSdkApplicationDomainTask_ExecuteReturn.epObject.id, message).to.eq(ApplicationDomainId);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

