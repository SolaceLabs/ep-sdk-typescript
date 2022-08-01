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
  SchemaObject, 
  SchemaResponse, 
  SchemasService 
} from '../../../src/sep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkError, EpSdkServiceError } from '../../../src/EpSdkErrors';
import EpSdkSchemasService, { EpSdkSchemaContentType, EpSdkSchemaType } from '../../../src/services/EpSdkSchemasService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const SchemaName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
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
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should create schema`, async () => {
      try {
        const schemaResponse: SchemaResponse = await SchemasService.createSchema({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: SchemaName,
            schemaType: EpSdkSchemaType.JSON_SCHEMA,
            contentType: EpSdkSchemaContentType.APPLICATION_JSON,
          }
        });
        SchemaId = schemaResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get schema by name`, async () => {
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName
        });
        expect(schemaObject, TestLogger.createApiTestFailMessage('schemaObject === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get schema by id`, async () => {
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.getById({
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId
        });
        expect(schemaObject.id, TestLogger.createApiTestFailMessage('failed')).to.eq(SchemaId);
        expect(schemaObject.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete schema by id`, async () => {
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.deleteById({
          applicationDomainId: ApplicationDomainId,
          schemaId: SchemaId
        });
        expect(schemaObject.id, TestLogger.createApiTestFailMessage('failed')).to.eq(SchemaId);
        expect(schemaObject.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create schema`, async () => {
      try {
        const schemaResponse: SchemaResponse = await SchemasService.createSchema({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: SchemaName,
            schemaType: EpSdkSchemaType.JSON_SCHEMA,
            contentType: EpSdkSchemaContentType.APPLICATION_JSON,
          }
        });
        SchemaId = schemaResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete schema by name`, async () => {
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: SchemaName
        });
        expect(schemaObject.name, TestLogger.createApiTestFailMessage('failed')).to.eq(SchemaName);
        expect(schemaObject.id, TestLogger.createApiTestFailMessage('failed')).to.eq(SchemaId);
        expect(schemaObject.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should catch delete schema by name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          schemaName: NonExistentName
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

    it(`${scriptName}: should catch delete schema by id that doesn't exist`, async () => {
      const NonExistentId = 'non-existent';
      try {
        const schemaObject: SchemaObject | undefined = await EpSdkSchemasService.deleteById({
          applicationDomainId: ApplicationDomainId,
          schemaId: NonExistentId
        });
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createApiTestFailMessage('not ApiError')).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createApiTestFailMessage('wrong status')).to.eq(404);
      }
    });

});

