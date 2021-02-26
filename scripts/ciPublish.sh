#!/bin/bash

set -e

removeLocalTags() {
    git tag -d $(git tag -l) > /dev/null
}

getPackageJsonVersion() {
    node -pe "require('./package.json').version"
}

versionNewRelease() {
    NEWVERSION=$(npm version minor)
    echo "New release version: $NEWVERSION"
}

publishNewRelease() {
    npm publish
}

acceptUnknownKeyHostPairs() {
    export GIT_SSH_COMMAND="ssh -o UserKnownHostsFile=/dev/null -o StrictHostKeyChecking=no"
}

pushNewTaggedVersionToGithub() {
    git push origin tags/$NEWVERSION
}

pushUpdatedPackageJsonToGitHub() {
    git push origin HEAD:master
}

removeLocalTags
versionNewRelease
publishNewRelease
acceptUnknownKeyHostPairs
pushNewTaggedVersionToGithub
pushUpdatedPackageJsonToGitHub
