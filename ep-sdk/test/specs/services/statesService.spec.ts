import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import { 
  ApiError, 
} from '@solace-labs/ep-openapi-node';
import { EpSdkError } from '../../../src/utils/EpSdkErrors';
import EpSdkStatesService, { EEpSdkStateDTONames } from '../../../src/services/EpSdkStatesService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should validate stateDTOs`, async () => {
      try {
        const xvoid: void = await EpSdkStatesService.validateStates();
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get Ids by Name`, async () => {
      try {
        let getId: string = EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: EEpSdkStateDTONames.DRAFT });
        expect(getId, TestLogger.createTestFailMessage(`getId=${getId} !== ${EpSdkStatesService.draftId}`)).to.eq(EpSdkStatesService.draftId);
        getId = EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: EEpSdkStateDTONames.RELEASED });
        expect(getId, TestLogger.createTestFailMessage(`getId=${getId} !== ${EpSdkStatesService.releasedId}`)).to.eq(EpSdkStatesService.releasedId);
        getId = EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: EEpSdkStateDTONames.RETIRED });
        expect(getId, TestLogger.createTestFailMessage(`getId=${getId} !== ${EpSdkStatesService.retiredId}`)).to.eq(EpSdkStatesService.retiredId);
        getId = EpSdkStatesService.getEpStateIdByName({ epSdkStateDTOName: EEpSdkStateDTONames.DEPRECATED });
        expect(getId, TestLogger.createTestFailMessage(`getId=${getId} !== ${EpSdkStatesService.deprecatedId}`)).to.eq(EpSdkStatesService.deprecatedId);
      } catch(e) {
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    
});

