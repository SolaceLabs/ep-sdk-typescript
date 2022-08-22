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
  EventApiResponse,
  EventApIsService, 
  eventApiVersion as EventApiVersion,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkVersionTaskStrategyValidationError,
  TEpSdkVersionTaskStrategyValidationError_Details
} from '../../../src/utils/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkEventApiVersionTask, IEpSdkEventApiVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkEventApiVersionTask';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';
import { IEpSdkTask_TransactionLogData } from '../../../src/tasks/EpSdkTask_TransactionLog';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/tasks/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const EventApiName = `${TestConfig.getAppId()}-tasks-${TestSpecId}`;
let EventApiId: string | undefined;
let EventApiVersionId: string | undefined;

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

    const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({ 
      requestBody: {
        applicationDomainId: ApplicationDomainId,
        name: EventApiName,
      }
    });
    EventApiId = eventApiResponse.data.id;

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

  it(`${scriptName}: event api version present: checkmode create`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);

      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_FIRST_VERSION);

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });
    
  it(`${scriptName}: event api version present: create`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);

      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_FIRST_VERSION);
      
      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create idempotency`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);

      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.id, message).to.eq(EventApiVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: checkmode update`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);

      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.WOULD_CREATE_NEW_VERSION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.id, message).to.eq(EventApiVersionId);
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: update`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();

      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);

      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.eventApiId, message).to.eq(EventApiId);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.version, message).to.eq('1.2.1');

      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;
      
      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version absent`, async () => {
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.ABSENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: '1.2.0',
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
      // // DEBUG
      // const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.CREATE_NEW_VERSION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match: idempotency`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
      const message = TestLogger.createLogMessage('epSdkEventApiVersionTask_ExecuteReturn', epSdkEventApiVersionTask_ExecuteReturn);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, message).to.eq(EEpSdkTask_Action.NO_ACTION);
      expect(epSdkEventApiVersionTask_ExecuteReturn.epObject.version, message).to.eq(ExactVersionString);
      // // DEBUG
      // expect(false, message).to.be.true;
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

  it(`${scriptName}: event api version present: create exact version match: should catch error`, async () => {
    const ExactVersionString = '2.0.0';
    try {
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: false,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
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
      const epSdkEventApiVersionTask = new EpSdkEventApiVersionTask({
        epSdkTask_TargetState: EEpSdkTask_TargetState.PRESENT,
        applicationDomainId: ApplicationDomainId,
        eventApiId: EventApiId,
        versionString: ExactVersionString,
        versionStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
        eventApiVersionSettings: {
          stateId: EpSdkStatesService.releasedId,
          description: 'updated description',
          displayName: 'displayName',
          producedEventVersionIds: ([] as unknown) as EventApiVersion.producedEventVersionIds,
          consumedEventVersionIds: ([] as unknown) as EventApiVersion.consumedEventVersionIds,  
        },
        epSdkTask_TransactionConfig: {
          parentTransactionId: 'parentTransactionId',
          groupTransactionId: 'groupTransactionId'
        },
        checkmode: true,
      });
      const epSdkEventApiVersionTask_ExecuteReturn: IEpSdkEventApiVersionTask_ExecuteReturn = await epSdkEventApiVersionTask.execute();
      expect(epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData.epSdkTask_Action, TestLogger.createLogMessage('wrong action', epSdkEventApiVersionTask_ExecuteReturn.epSdkTask_TransactionLogData)).to.eq(EEpSdkTask_Action.WOULD_FAIL_CREATE_NEW_VERSION_ON_EXACT_VERSION_REQUIREMENT);
    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
      expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
    }
  });

});

