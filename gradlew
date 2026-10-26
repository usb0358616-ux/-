#!/bin/sh
# Root gradlew delegator for GitHub Actions & CI/CD
# Directs commands to the android subproject
DIR="$(cd "$(dirname "$0")" && pwd)"
if [ -d "$DIR/android" ]; then
    cd "$DIR/android"
    if [ -x "./gradlew" ]; then
        exec ./gradlew "$@"
    elif which gradle >/dev/null 2>&1; then
        exec gradle "$@"
    else
        echo "ERROR: Gradle is not installed and gradlew could not be run."
        exit 1
    fi
else
    echo "ERROR: android directory not found in $DIR"
    exit 1
fi
