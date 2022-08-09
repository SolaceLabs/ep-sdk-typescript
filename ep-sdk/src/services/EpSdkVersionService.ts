import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import EpSdkSemVerUtils from "../utils/EpSdkSemVerUtils";
import { EpSdkService } from "./EpSdkService";

export class EpSdkVersionService extends EpSdkService {

  protected getLatestEpObjectVersionFromList = ({ epObjectVersionList }: {
    epObjectVersionList: Array<any>;
  }): any | undefined => {
    const funcName = 'getLatestEpObjectVersionFromList';
    const logName = `${EpSdkVersionService.name}.${funcName}()`;

    let latestEpObjectVersion: any | undefined = undefined;
    let latestEpObjectVersionString: string = '0.0.0';
    for (const epObjectVersion of epObjectVersionList) {
      if(epObjectVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObjectVersion.version === undefined', {
        epObjectVersion: epObjectVersion
      });
      const newEpObjectVersionString: string = epObjectVersion.version;
      if (EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
        newVersionString: newEpObjectVersionString,
        oldVersionString: latestEpObjectVersionString,
      })) {
        latestEpObjectVersionString = newEpObjectVersionString;
        latestEpObjectVersion = epObjectVersion;
      }
    }
    return latestEpObjectVersion;
  }

}


