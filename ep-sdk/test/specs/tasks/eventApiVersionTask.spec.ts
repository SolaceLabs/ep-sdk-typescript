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
  // EventResponse, 
  // EventsService,
  // SchemaResponse,
  // SchemasService,
  // SchemaVersion, 
 } from '../../../src/sep-openapi-node';
import { 
  EpSdkError, 
  EpSdkFeatureNotSupportedError, 
  EpSdkInvalidSemVerStringError, 
  EpSdkVersionTaskStrategyValidationError
} from '../../../src/EpSdkErrors';
import { EEpSdkTask_Action, EEpSdkTask_TargetState } from '../../../src/tasks/EpSdkTask';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import { EEpSdk_VersionStrategy } from '../../../src/EpSdkSemVerUtils';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkEventApiVersionTask, IEpSdkEventApiVersionTask_ExecuteReturn } from '../../../src/tasks/EpSdkEventApiVersionTask';
import { EEpSdk_VersionTaskStrategy } from '../../../src/tasks/EpSdkVersionTask';

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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
      expect(e instanceof EpSdkFeatureNotSupportedError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
        versionTaskStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
      
      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
        versionTaskStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
      
      EventApiVersionId = epSdkEventApiVersionTask_ExecuteReturn.epObject.id;

      // // DEBUG
      // expect(false, message).to.be.true;

    } catch(e) {
      if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
      expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
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
        versionTaskStrategy: EEpSdk_VersionTaskStrategy.EXACT_VERSION,
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
      expect(e instanceof EpSdkVersionTaskStrategyValidationError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
    }
  });


});

