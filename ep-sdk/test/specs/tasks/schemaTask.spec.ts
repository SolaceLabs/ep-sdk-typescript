import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, ApplicationDomainResponse, ApplicationDomainsService
} from '@solace-labs/ep-openapi-node';
import { EpSdkError } from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import { EpSdkSchemaTask, IEpSdkSchemaTask_ExecuteReturn } from '../../../src/tasks/EpSdkSchemaTask';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const SchemaName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let SchemaId: string | undefined;

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

  it(`${scriptName}: schema present: checkmode create`, async () => {
    try {
      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: schema present: create`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE);
      
      SchemaId = epSdkSchemaTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema present: create: nothing to do`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: true,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema present: checkmode update`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);

      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_UPDATE);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema present: update`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.UPDATE);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema present: no action`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        schemaObjectSettings: {
          shared: false,
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema absent: checkmode with existing`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);

      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_DELETE);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema absent`, async () => {
    try {

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: SchemaName,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.DELETE);
      expect(epSdkSchemaTask_ExecuteReturn.epObject.id, message).to.eq(SchemaId);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: schema absent: checkmode with non-existing`, async () => {
    try {

      const NonExisting = 'non-existing';

      const epSdkSchemaTask = new EpSdkSchemaTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        schemaName: NonExisting,
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true
      });

      const epSdkSchemaTask_ExecuteReturn: IEpSdkSchemaTask_ExecuteReturn = await epSdkSchemaTask.execute();

      const message = TestLogger.createLogMessage('epSdkSchemaTask_ExecuteReturn', epSdkSchemaTask_ExecuteReturn);
      expect(epSdkSchemaTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

