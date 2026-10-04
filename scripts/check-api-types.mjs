import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const checkedInOutput = join(projectRoot, 'src/shared/api/generated')
const temporaryOutput = await mkdtemp(join(projectRoot, '.api-types-check-'))

try {
  execFileSync(
    resolve(projectRoot, 'node_modules/.bin/openapi-ts'),
    ['--file', 'openapi-ts.config.mjs', '--output', temporaryOutput],
    { cwd: projectRoot, stdio: 'inherit' },
  )
  execFileSync(resolve(projectRoot, 'node_modules/.bin/prettier'), ['--write', temporaryOutput], {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  const [checkedInFiles, generatedFiles] = await Promise.all([
    readdir(checkedInOutput),
    readdir(temporaryOutput),
  ])
  if (checkedInFiles.sort().join('\n') !== generatedFiles.sort().join('\n')) {
    throw new Error('Generated API type files differ; run npm run api:types')
  }

  for (const filename of generatedFiles) {
    const [checkedIn, generated] = await Promise.all([
      readFile(join(checkedInOutput, filename), 'utf8'),
      readFile(join(temporaryOutput, filename), 'utf8'),
    ])
    if (checkedIn !== generated) {
      throw new Error(`Generated API types are outdated; run npm run api:types (${filename})`)
    }
  }
} finally {
  await rm(temporaryOutput, { recursive: true, force: true })
}
