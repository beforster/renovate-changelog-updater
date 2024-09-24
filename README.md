# Renovate-changelog-updater

How to use it ?
```
npx renovate-changelog-updater --depName my-updated-package --current-version 1.0.0 --new-version 2.0.0 --isLockFileMaintenance false
```

How to configure renovate ?
```
{
  allowPostUpgradeCommandTemplating: true,
  allowedPostUpgradeCommands: ['^npx renovate-changelog-updater'],
  postUpgradeTasks: {
    commands: ['npx renovate-changelog-updater --depName {{{depName}}} --current-version {{{currentVersion}}} --new-version {{{newVersion}}} --isLockFileMaintenance {{{isLockFileMaintenance}}}'],
    fileFilters: ['CHANGELOG.md'],
    executionMode: 'update',
  }
}
```