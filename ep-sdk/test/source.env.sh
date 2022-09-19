#
# Environment for tests
#
# Usage:
#   source source.env.sh && {run-tests} && unset_source_env

unset_source_env() {
    # env vars for tests
    unset EP_SDK_TEST_EP_API_BASE_URL
    unset EP_SDK_TEST_LOG_LEVEL
    unset EP_SDK_TEST_ENABLE_API_CALL_LOGGING
    # unset this function
    unset -f unset_source_env
}
export EP_SDK_TEST_EP_API_BASE_URL="https://ian-dev-api.mymaas.net"
# export enum EEpSdkLogLevel {
#   Silent = 0,
#   FatalError = 1,
#   Error = 2,
#   Warn = 3,
#   Info = 4,
#   Debug = 5,
#   Trace = 6,
# }
export EP_SDK_TEST_LOG_LEVEL=6
export EP_SDK_TEST_ENABLE_API_CALL_LOGGING="false"

######################################################

NOLOG_EP_SDK_TEST_SOLACE_CLOUD_TOKEN=$EP_SDK_TEST_SOLACE_CLOUD_TOKEN
export EP_SDK_TEST_SOLACE_CLOUD_TOKEN="***"

logName='[source.env.sh]'
echo "$logName - test environment:"
echo "$logName - EP_SDK_TEST:"
export -p | sed 's/declare -x //' | grep EP_SDK_TEST_

export EP_SDK_TEST_SOLACE_CLOUD_TOKEN=$NOLOG_EP_SDK_TEST_SOLACE_CLOUD_TOKEN
