// @ts-check

const { Release, Change, parser: keepAChangelogParser } = require('keep-a-changelog');

const dependencyListTitle = 'Dependency updates\\';
const terraformMaintenanceTitle = 'Terraform lock file maintenance';

/**
 *
 * @param {string} depName
 * @param {string} currentVersion
 * @param {string} newVersion
 * @returns string
 */
function getChangeDescription(depName, currentVersion, newVersion) {
  return `${depName}: ${currentVersion} -> ${newVersion}\\`;
}

/**
 * @param {string} changelogRaw
 * @param {string} depName
 * @param {string} currentVersion
 * @param {string} newVersion
 * @param {boolean} isLockFileMaintenance
 * @returns {string} the updated changelog
 */
function keepAChangelogUpdater(changelogRaw, depName, currentVersion, newVersion) {
  const changelog = keepAChangelogParser(changelogRaw);
  const [firstRelease] = changelog.releases;
  let unReleased;
  if (!firstRelease || firstRelease.version) {
    unReleased = new Release();
    changelog.addRelease(unReleased);
  } else {
    unReleased = firstRelease;
  }

  // Handle lock file maintenance scenario
  if (isLockFileMaintenance) {
    const changedEntries = unReleased.changes.get('changed');
    let lockFileChange = changedEntries?.find(change => change.title === terraformMaintenanceTitle);

    if (!lockFileChange) {
      unReleased.addChange('changed', new Change(terraformMaintenanceTitle));
    }
    return changelog.toString();
  }

  // Regular behavior for other dependencies
  const changedEntries = unReleased.changes.get('changed');
  let dependendyChanged = changedEntries?.find((changed) => changed.title.match(new RegExp(`^${dependencyListTitle}\n?`)));
  if (!dependendyChanged) {
    dependendyChanged = new Change(`${dependencyListTitle}\n${getChangeDescription(depName, currentVersion, newVersion)}`);
    unReleased.addChange('changed', dependendyChanged);
  } else {
    let alreadyUpdated = false;
    const dependencyChangeRegex = /^(.*):\s(.*)\s->\s([^\\\s]*)\\?$/;
    const previousTitle = dependendyChanged.title;
    dependendyChanged.title = dependencyListTitle;
    for (const update of previousTitle.split('\n').slice(1)) {
      const regexResult = dependencyChangeRegex.exec(update);
      if (regexResult) {
        const [, updatedDepName, updateCurrentVersion, updatedVersion] = regexResult;
        if (updatedDepName !== depName) {
          dependendyChanged.title += `\n${getChangeDescription(updatedDepName, updateCurrentVersion, updatedVersion)}`;
        } else {
          dependendyChanged.title += `\n${getChangeDescription(depName, updateCurrentVersion, newVersion)}`;
          alreadyUpdated = true;
        }
      } else {
        dependendyChanged.title += `\n${update}`;
      }
    }
    if (!alreadyUpdated) {
      dependendyChanged.title += `\n${getChangeDescription(depName, currentVersion, newVersion)}`;
    }
  }
  dependendyChanged.title = dependendyChanged.title.replace(/\\$/g, '');
  return changelog.toString();
}

module.exports = {
  updater: keepAChangelogUpdater,
};
