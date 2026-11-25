// main.ts — hands the Sate Arang Senja entry in.
//
// Copies game/ and screenshots/ from this repository into the output
// directory and writes /output/dossier.json with buildDossier from
// vendor/makefun-game.ts. Standard library only; runs on Node 22.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)));

function outputDir(): string {
  const fromEnv = process.env.MAKEFUN_OUTPUT_DIR;
  if (fromEnv && fromEnv.trim() !== '') return resolve(fromEnv);
  return '/output';
}

function copyTreeInto(sourceDir: string, targetDir: string): void {
  // cpSync with force overwrites stale files from an earlier run, and
  // dereference follows any symlink in the source instead of copying it.
  cpSync(sourceDir, targetDir, { recursive: true, force: true, dereference: true });
}

function main(): void {
  const out = outputDir();
  // The output directory may already exist with files in it: never delete
  // or recreate it, only make sure it is there.
  mkdirSync(out, { recursive: true });

  const gameSource = join(repoRoot, 'game');
  const shotsSource = join(repoRoot, 'screenshots');
  if (!existsSync(gameSource)) throw new Error('main.ts: game/ is missing from ' + repoRoot);
  if (!existsSync(shotsSource)) throw new Error('main.ts: screenshots/ is missing from ' + repoRoot);

  copyTreeInto(gameSource, join(out, 'game'));
  copyTreeInto(shotsSource, join(out, 'screenshots'));

  const dossier = buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 48 * 1024 * 1024,
    game_path_max_bytes: 1000
  });
  const dossierPath = join(out, 'dossier.json');
  writeFileSync(dossierPath, dossier);
  if (dossier.length === 0) throw new Error('main.ts: buildDossier wrote an empty dossier');
  // A short, human-readable summary of what was handed in.
  console.log('sate-arang-senja -> ' + out);
  console.log('game/ + screenshots/ copied, dossier.json ' + dossier.length + ' bytes');
}

main();
