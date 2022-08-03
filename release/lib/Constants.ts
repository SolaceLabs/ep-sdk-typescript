
export class Constants {
  private readonly _scriptDir: string;
  private readonly _workingDir: string;
  private readonly _epSdkDir: string;
  private readonly _workingEpSdkDir: string;
  private readonly _skipping: string;

  constructor(scriptDir: string) {
    this._scriptDir = scriptDir;
    this._skipping = '+++ SKIPPING +++';
    this._workingDir = `${scriptDir}/working_dir`;
    this._epSdkDir = `${scriptDir}/../ep-sdk`;
    this._workingEpSdkDir = `${this._workingDir}/ep-sdk`;
  }
  public log() {
    console.log(`${Constants.name} = ${JSON.stringify(this, null, 2)}`);
  }
  public get ScriptDir() { return this._scriptDir; }
  public get WorkingDir() { return this._workingDir; }
  public get EpSdkDir() { return this._epSdkDir; }
  public get WorkingEpSdkDir() { return this._workingEpSdkDir; }
  public get Skipping() { return this._skipping; }
}
