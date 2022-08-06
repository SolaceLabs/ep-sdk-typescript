#!/usr/bin/env bash

scriptDir=$(cd $(dirname "$0") && pwd);
scriptName=$(basename $(test -L "$0" && readlink "$0" || echo "$0"));

# generate tsdocs
cd $scriptDir/../ep-sdk
  code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi
npm run build:tsdocs
  code=$?;
  # run npm install and try again
  if [[ $code != 0 ]]; then
    npm install;
    npm run build:tsdocs;
    code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi    
  fi

# generate rst docs
cd $scriptDir
make clean html
  code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make html"; exit 1; fi

make linkcheck
  code=$?; if [[ $code != 0 ]]; then echo ">>> XT_ERROR - $code make linkcheck"; exit 1; fi

###
# The End.
