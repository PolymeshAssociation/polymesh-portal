#!/usr/bin/env node
/**
 * Stage a locally built Polymesh package so the Portal can consume it without publishing.
 *
 * Currently that is only `@polymeshassociation/polymesh-sdk`, whose Ethereum signing support is
 * unreleased. `@polymeshassociation/eth-signing-manager` used to be staged here too and is now
 * installed from the registry; adding another package back is a matter of another `DEFAULTS` entry.
 *
 * The SDK is published with the contents of `dist/` flattened to the package root, so
 * `@polymeshassociation/polymesh-sdk/types` resolves to `<root>/types`. A local checkout keeps that
 * same tree one level down, under `dist/`. This script bridges the difference: it writes
 * `local-packages/<name>/` containing a package.json with the correct entry points plus a copy of
 * the built `dist` tree.
 *
 * The tree is copied rather than symlinked deliberately. A symlink would leave the files inside the
 * source checkout, so Node and TypeScript would resolve their imports against that checkout's
 * `node_modules` — producing duplicate copies of shared packages (`@apollo/client`, `@polkadot/*`)
 * and a wall of "two different types with this name exist" errors. Copying reproduces exactly what
 * installing the published package would give.
 *
 * Because it is a copy, re-run this after rebuilding the source package, or leave `--watch` running.
 *
 * Usage:
 *   yarn link:local                       stage once
 *   yarn link:local --watch               stage, then re-stage whenever the source dist changes
 *   yarn link:local --sdk <path>          override the checkout location
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const stagingDir = path.join(rootDir, 'local-packages');

const DEFAULTS = {
  'polymesh-sdk': path.resolve(rootDir, '..', 'polymesh-sdk'),
};

const parseArgs = () => {
  const args = process.argv.slice(2);
  const overrides = {};
  let watch = false;

  args.forEach((arg, index) => {
    if (arg === '--watch') {
      watch = true;
      return;
    }

    if (arg !== '--sdk') return;

    const value = args[index + 1];
    if (!value || value.startsWith('--')) {
      throw new Error(`Missing path argument for ${arg}`);
    }
    overrides['polymesh-sdk'] = path.resolve(value);
  });

  return { sources: { ...DEFAULTS, ...overrides }, watch };
};

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));

/**
 * Build the package.json for a staged package.
 *
 * `dependencies` are copied verbatim from the source package so Yarn installs everything the
 * package needs. Entry points are rewritten to the flattened, published layout.
 */
const buildManifest = (sourceManifest) => ({
  name: sourceManifest.name,
  version:
    sourceManifest.version === '0.0.0' ? '0.0.0-local' : sourceManifest.version,
  description: sourceManifest.description,
  license: sourceManifest.license,
  main: './index.js',
  types: './index.d.ts',
  dependencies: sourceManifest.dependencies ?? {},
  peerDependencies: sourceManifest.peerDependencies,
  engines: sourceManifest.engines,
});

const resolveSourceDist = (label, sourceRoot) => {
  const sourceManifestPath = path.join(sourceRoot, 'package.json');
  if (!fs.existsSync(sourceManifestPath)) {
    throw new Error(
      `No package.json found at ${sourceRoot}. Pass the checkout path with --${
        label === 'polymesh-sdk' ? 'sdk' : label
      } <path>`,
    );
  }

  const sourceDist = path.join(sourceRoot, 'dist');
  if (!fs.existsSync(sourceDist)) {
    throw new Error(
      `No dist directory found at ${sourceDist}. Run "yarn build:ts" in ${sourceRoot} first`,
    );
  }

  return { sourceDist, sourceManifest: readJson(sourceManifestPath) };
};

const stagePackage = (label, sourceRoot, { quiet = false } = {}) => {
  const { sourceDist, sourceManifest } = resolveSourceDist(label, sourceRoot);
  const targetDir = path.join(stagingDir, label);

  // Yarn installs the portal package's own dependencies into a node_modules directory here. Clear
  // everything else, but leave that alone — wiping it would require a fresh `yarn install` after
  // every re-stage, which is the common case when iterating on a source package.
  if (fs.existsSync(targetDir)) {
    fs.readdirSync(targetDir)
      .filter((entry) => entry !== 'node_modules')
      .forEach((entry) =>
        fs.rmSync(path.join(targetDir, entry), {
          recursive: true,
          force: true,
        }),
      );
  }
  fs.mkdirSync(targetDir, { recursive: true });

  // The source dist carries its own stale package.json in some checkouts; ours replaces it.
  fs.cpSync(sourceDist, targetDir, {
    recursive: true,
    filter: (src) => path.basename(src) !== 'package.json',
  });

  fs.writeFileSync(
    path.join(targetDir, 'package.json'),
    `${JSON.stringify(buildManifest(sourceManifest), null, 2)}\n`,
  );

  if (!quiet) {
    console.log(`staged ${sourceManifest.name} <- ${sourceDist}`);
  }

  return sourceDist;
};

const { sources, watch } = parseArgs();
fs.mkdirSync(stagingDir, { recursive: true });

const staged = Object.entries(sources).map(([label, sourceRoot]) => ({
  label,
  sourceRoot,
  sourceDist: stagePackage(label, sourceRoot),
}));

if (!watch) {
  console.log(
    '\nStaged into local-packages/. Run "yarn install" if a package\'s dependencies changed.',
  );
  process.exit(0);
}

console.log('\nWatching for rebuilds. Ctrl-C to stop.');

staged.forEach(({ label, sourceRoot, sourceDist }) => {
  let pending = null;

  fs.watch(sourceDist, { recursive: true }, () => {
    // A `tsc -b` run touches many files; debounce so we re-stage once it settles.
    clearTimeout(pending);
    pending = setTimeout(() => {
      try {
        stagePackage(label, sourceRoot, { quiet: true });
        console.log(`[${new Date().toLocaleTimeString()}] re-staged ${label}`);
      } catch (error) {
        console.error(`[${label}] ${error.message}`);
      }
    }, 400);
  });
});
