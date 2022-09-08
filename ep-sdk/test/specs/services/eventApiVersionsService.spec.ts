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
  EventApiVersion,
  EventApiVersionResponse,
} from '@solace-labs/ep-openapi-node';
import { EpSdkError, EpSdkServiceError, EpSdkValidationError } from '../../../src/utils/EpSdkErrors';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import EpSdkStatesService from '../../../src/services/EpSdkStatesService';
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version string`, async () => {
      try {
        const latestVersionString: string = await EpSdkEventApiVersionsService.getLatestVersionString({ eventApiId: EventApiId });
        expect(latestVersionString, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version for event api name`, async () => {
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ 
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName
        });
        expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion === undefined')).to.not.be.undefined;
        expect(eventApiVersion.version, TestLogger.createApiTestFailMessage('version string mismatch')).to.eq(EventApiNextVersionString);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get latest version for event api name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const eventApiVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ 
          applicationDomainId: ApplicationDomainId,
          eventApiName: NonExistentName
        });
        expect(eventApiVersion, TestLogger.createApiTestFailMessage('eventApiVersion !== undefined')).to.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkValidationError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        const epSdkValidationError: EpSdkValidationError = e;
        expect(epSdkValidationError.toString(), TestLogger.createEpSdkTestFailMessage(`error does not contain ${DisplayName}`, epSdkValidationError)).to.contain(DisplayName);
      }
    });

    it(`${scriptName}: should create 10 event api versions & get latest version string them using paging`, async () => {
      const PagingName = 'Paging-Object';
      const VersionQuantity = 10;
      const PageSize = 2;
      try {
        const response: EventApiResponse = await EventApIsService.createEventApi({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: PagingName,
            shared: false
          }
        });
        EventApiId = response.data.id;

        let VersionString = '';
        for(let i=0; i<VersionQuantity; i++) {
          VersionString = `3.0.${i}`;
          const versionResponse: EventApiVersionResponse = await EventApIsService.createEventApiVersionForEventApi({
            eventApiId: EventApiId,
            requestBody: {
              description: 'paging version',
              version: VersionString,
            }
          });
        }
        // // DEBUG
        // expect(false, 'check 1000 enum versions created').to.be.true;
        const versionList: Array<EventApiVersion> = await EpSdkEventApiVersionsService.getVersionsForEventApiId({ 
          eventApiId: EventApiId,
          pageSize: PageSize
        });
        expect(versionList.length, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionQuantity);

        let latestObjectVersion: EventApiVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiId({ eventApiId: EventApiId, applicationDomainId: ApplicationDomainId });
        expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

        latestObjectVersion = await EpSdkEventApiVersionsService.getLatestVersionForEventApiName({ eventApiName: PagingName, applicationDomainId: ApplicationDomainId });
        expect(latestObjectVersion.version, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

        const latestObjectVersionString: string = await EpSdkEventApiVersionsService.getLatestVersionString({ eventApiId: EventApiId });
        expect(latestObjectVersionString, TestLogger.createApiTestFailMessage('failed')).to.eq(VersionString);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

