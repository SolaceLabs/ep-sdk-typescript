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
      /* istanbul ignore next */
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

  protected getEpObjectVersionFromList = ({ epObjectVersionList, versionString }: {
    epObjectVersionList: Array<any>;
    versionString: string;
  }): any | undefined => {
    const funcName = 'getEpObjectVersionFromList';
    const logName = `${EpSdkVersionService.name}.${funcName}()`;
    const found = epObjectVersionList.find( (epObjectVersion) => {
      /* istanbul ignore next */
      if(epObjectVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObjectVersion.version === undefined', {
        epObjectVersion: epObjectVersion
      });
      return epObjectVersion.version === versionString;
    });
    return found;
  }


}


