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
  // EventVersion, 
  // SchemaResponse, 
  // SchemasService,
  // SchemaVersion
} from '../../../src/sep-openapi-node';
import { EpSdkError, EpSdkServiceError, EpSdkValidationError } from '../../../src/EpSdkErrors';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import EpSdkSchemaVersionsService from '../../../src/services/EpSdkSchemaVersionsService';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
import { EEpSdkSchemaContentType, EEpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';
import EpSdkEventApiVersionsService from '../../../src/services/EpSdkEventApiVersionsService';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const EventApiName = `${TestSpecId}`;
let EventApiId: string | undefined;
const EventApiVersionString = '1.1.1';
let EventApiVersionId: string | undefined;
const EventApiNextVersionString = '1.1.2';
let EventApiNextVersionId: string | undefined;


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
          name: EventApiName
        }
      });
      EventApiId = eventApiResponse.data.id;
    });

    after(async() => {
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should create event api version`, async () => {
      try {
        const create: EventApiVersion = {
          description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
          version: EventApiVersionString,
          displayName: EventApiName,
        };
        const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
          eventApiVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId
        });
        EventApiVersionId = created.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get event api version by version`, async () => {
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getVersionByVersion({ 
          eventApiId: EventApiId,
          eventApiVersionString: EventApiVersionString,
        });
        expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version mismatch')).to.eq(EventApiVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get event api versions for event api id`, async () => {
      try {
        const eventApiVersionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiId({ eventApiId: EventApiId });
        expect(eventApiVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
        const eventApiVersion: EventApiVersion = eventApiVersionList[0];
        expect(eventApiVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventApiVersionId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get event api versions for event api name`, async () => {
      try {
        const eventApiVersionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiName({ 
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName 
        });
        expect(eventApiVersionList.length, TestLogger.createApiTestFailMessage('length not === 1')).to.eq(1);
        const eventApiVersion: EventApiVersion = eventApiVersionList[0];
        expect(eventApiVersion.id, TestLogger.createApiTestFailMessage('id mismatch')).to.eq(EventApiVersionId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create new event api version`, async () => {
      try {
        const create: EventApiVersion = {
          description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
          version: EventApiNextVersionString,
          displayName: EventApiName,
        };
        const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
          eventApiVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId
        });
        EventApiNextVersionId = created.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version string`, async () => {
      try {
        const latestVersionString: string = await EpSdkEventApiVersionsService.getLastestVersionString({ eventApiId: EventApiId });
        expect(latestVersionString, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version for event api id`, async () => {
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ 
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId
        });
        expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version for event api name`, async () => {
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLastestVersionForEventApiName({ 
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName
        });
        expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion === undefined')).to.not.be.undefined;
        expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version for event api name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLastestVersionForEventApiName({ 
          applicationDomainId: ApplicationDomainId,
          eventApiName: NonExistentName
        });
        expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion !== undefined')).to.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

    it(`${scriptName}: should catch displayName validation`, async () => {
      const DisplayName = 'very, very, very, very, very, very, very, very, very, very, very, very, very long display name';
      try {
        const create: EventApiVersion = {
          description: `event api version for event = ${EventApiName}, id=${EventApiId}`,        
          version: EventApiNextVersionString,
          displayName: DisplayName,
        };
        const created: EventApiVersion = await EpSdkEventApiVersionsService.createEventApiVersion({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId,
          eventApiVersion: create,
          targetLifecycleStateId: EpSdkStatesService.releasedId
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkValidationError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        const epSdkValidationError: EpSdkValidationError = e;
        expect(epSdkValidationError.toString(), TestLogger.createEpSdkTestFailMessage(`error does not contain ${DisplayName}`, epSdkValidationError)).to.contain(DisplayName);
      }
    });

});

