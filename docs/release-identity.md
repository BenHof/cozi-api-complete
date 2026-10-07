# Release identity evidence

Initial identity audit: October 7, 2026 UTC (October 6 ET), against public main
`a8d1b6722993b6b486245cb6b1ff9703a2078793` before the metadata/CI repair.

## Distribution decision

On October 7, 2026, Ben selected **GitHub/local installation only**.
There is no planned npm registry package, and npm authentication or ownership
verification is not an outstanding task for this distribution path.
`cozi-api-client` is retained as the local package/import identifier. Keep
`private: true` and `npmPublish: false` enabled.

PR #1 was merged. Main-branch CI run `37569062453` passed both Node 22.x and
Node 24.x jobs and the release job. That workflow created GitHub release
`v1.0.0` on October 7, 2026 UTC; its logs explicitly state that npm publishing
was skipped because `npmPublish` is false. The GitHub release currently provides
source archives, with no separately uploaded npm tarball. Build and pack the
source locally using the README instructions.

## Initial audit evidence

| Coordinate | Evidence | Decision |
| --- | --- | --- |
| Public source repository | GitHub identifies `BenHof/cozi-api-complete` as public, default branch `main`. Full clone and `git ls-remote --tags origin` returned no tags; the GitHub releases API returned an empty collection. | Use this repository for active metadata, documentation and semantic-release. |
| Local package name | Source manifest and lockfile use `cozi-api-client` at `1.0.0`. | Retain the local/import name for GitHub/local distribution. It is not a registry install target. |
| Unscoped npm package | `GET https://registry.npmjs.org/cozi-api-client` returned HTTP 404. | Remove registry install instructions and npm version badge. A 404 is not proof of name availability or ownership. |
| Existing scoped npm package | `@brandcast_app/cozi-api-client` has one published version, `0.1.0`, created October 6, 2025 UTC. Registry metadata points to `BrandCast-Signage/cozi-api-client`, lists maintainer/publisher `jamieeduncan`, and records `gitHead` `d2db34935c7cc89dd41624412e9ed23811b1785b`. | Identify it as the upstream client, not this enhanced repository's release or a namespace we have verified rights to publish into. |
| Inherited history | Earlier repository metadata and tag inspection found a separate `v1.0.0`; the inherited changelog contains earlier commit URLs. None of those tags appear in this public repository. | Preserve historical URLs with an explicit provenance note; do not rewrite them to nonexistent public-repository commits or import old tags. |
| npm authentication | `npm whoami --registry=https://registry.npmjs.org/` returned `ENEEDAUTH` in the current workspace. | npm account identity and publishing rights were unverified; they are not required for the chosen GitHub/local distribution. |

## Safe distribution now

Build and pack the checked-out source, then install the resulting local tarball.
`cozi-api-client` remains its import identifier and `cozi` remains its CLI binary.
The README provides both source-checkout and installed-tarball CLI examples.

`private: true` blocks manual registry publication. `npmPublish: false` separately
keeps semantic-release from publishing to npm while allowing metadata preparation
and GitHub release handling. Semantic-release uses the canonical repository
explicitly and includes the lockfile in version commits. Pre-merge validation
executed no publishing or release command. The successful post-merge workflow
created the GitHub release and skipped npm publication, as recorded above.

## Only if the distribution decision changes

These steps are not pending work. They apply only if Ben later chooses npm
distribution.

1. Choose the intended npm package name. Do not assume GitHub account ownership
   implies ownership of a same-named npm account or scope.
2. Verify the authenticated npm account and its access to that package/scope.
   Inspect existing package history and maintainers again; for a new package,
   verify the namespace is usable by that account.
3. Update the manifest and lockfile name, installation and import examples, CLI
   invocation examples and npm badge together.
4. After ownership verification, explicitly remove `private: true` and enable
   `npmPublish`; configure the intended registry authentication.
5. Run build, tests and a local pack/install smoke check before publishing.

## Validation of this repair

- Node.js `24.19.0`, npm `11.9.0`.
- `npm ci` succeeded with Puppeteer's browser download skipped; these checks do
  not require launching a browser or accessing a real Cozi account.
- `npm run build` succeeded.
- `npm test -- --runInBand`: 5 suites, 98 tests passed.
- Local `npm pack` succeeded. The tarball installed into a clean consumer with
  lifecycle scripts skipped; requiring `cozi-api-client`, constructing its client
  and invoking the installed `cozi --help` all succeeded.
- Metadata assertions confirmed canonical URLs, the `main` release branch,
  both publishing guards, inclusion of the lockfile in release commits, and
  manifest/lockfile name and version consistency.
- The repaired workflow's commands passed locally: lint (zero errors, 12 existing
  explicit-any warnings), build, all 98 tests with coverage, CLI help and package
  inspection. Overall line coverage is 62.26%; the CLI has no unit coverage, so
  this project does not claim 100% overall coverage.
- Workflow YAML parsing and event/runtime/publishing-guard checks passed.
- `git diff --check` succeeded. No publishing or release command was run during
  pre-merge validation.

## CI repair

CI now watches TypeScript source, examples, package/lockfile metadata,
compiler/lint/release configuration, workflow files, scripts and the packaged
documentation. Both push and pull-request events target the actual `main` branch.

The test matrix uses Node 22.x and 24.x. Each job installs dependencies, lints,
builds, runs the suite once with coverage, checks CLI help and inspects the local
package contents. Puppeteer's browser download is skipped because these checks
do not use browser automation.

Checkout and Node setup use the current official v7 actions. The release job uses
Node 24.x and fetches complete commit/tag history. It runs only after successful
main-push checks, receives its GitHub token, and uses the installed semantic-release
binary. It receives no npm publishing token; both npm publishing guards remain
in effect. Pull requests have read-only default token permissions and skip the
release job. Main releases are not cancelled mid-flight by newer pushes.

## Sources

- https://github.com/BenHof/cozi-api-complete
- https://api.github.com/repos/BenHof/cozi-api-complete/releases
- https://registry.npmjs.org/cozi-api-client
- https://registry.npmjs.org/@brandcast_app%2Fcozi-api-client
- https://github.com/BrandCast-Signage/cozi-api-client
- https://github.com/semantic-release/npm#options
- https://github.com/actions/setup-node/tree/v7
- https://github.com/actions/checkout/tree/v7
- https://github.com/BenHof/cozi-api-complete/releases/tag/v1.0.0
- https://github.com/BenHof/cozi-api-complete/actions/runs/37569062453
