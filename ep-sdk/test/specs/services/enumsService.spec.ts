import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { ApiError, ApplicationDomainResponse, ApplicationDomainsService, Enum, EnumResponse, EnumsService } from '../../../src/sep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import EpSdkEnumsService from '../../../src/services/EpSdkEnumsService';
import { EpSdkError, EpSdkServiceError } from '../../../src/EpSdkErrors';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const EnumName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
let EnumId: string | undefined;

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should create application domain`, async () => {
      try {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          }
        });
        ApplicationDomainId = applicationDomainResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create enum`, async () => {
      try {
        const enumResponse: EnumResponse = await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false
          }
        });
        EnumId = enumResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get enum by name`, async () => {
      try {
        const epEnum: Enum | undefined = await EpSdkEnumsService.getByName({ applicationDomainId: ApplicationDomainId, enumName: EnumName });
        expect(epEnum, TestLogger.createApiTestFailMessage('epEnum === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get enum by id`, async () => {
      try {
        const epEnum: Enum = await EpSdkEnumsService.getById({ applicationDomainId: ApplicationDomainId, enumId: EnumId });
        expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
        expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete ennum by id`, async () => {
      try {
        const epEnum: Enum = await EpSdkEnumsService.deleteById({ applicationDomainId: ApplicationDomainId, enumId: EnumId });
        expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
        expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create enum`, async () => {
      try {
        const enumResponse: EnumResponse = await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false
          }
        });
        EnumId = enumResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete enum by name`, async () => {
      try {
        const epEnum: Enum = await EpSdkEnumsService.deleteByName({ applicationDomainId: ApplicationDomainId, enumName: EnumName });
        expect(epEnum.name, TestLogger.createApiTestFailMessage(`epEnum.name !== ${EnumName}`)).to.eq(EnumName);
        expect(epEnum.id, TestLogger.createApiTestFailMessage(`epEnum.id !== ${EnumId}`)).to.eq(EnumId);
        expect(epEnum.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should catch delete enum by name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const epEnum: Enum = await EpSdkEnumsService.deleteByName({ applicationDomainId: ApplicationDomainId, enumName: NonExistentName });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

});

