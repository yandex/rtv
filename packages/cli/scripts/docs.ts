/**
 * Inserts output of 'rtv help' command into README.md between '<!-- help -->' and  '<!-- helpstop -->'
 */
/* eslint-disable no-console */
import fs from 'fs';
import util from 'util';
import childProcess from 'child_process';

const exec = util.promisify(childProcess.exec);
const FILENAME = 'README.md';
const REGEXP = /(<!-- help -->\s+)([^]*)(<!-- helpstop -->)/;

insertHelp().catch((e) => {
  console.error(e);
  process.exit(1);
});

async function insertHelp() {
  const oldContent = fs.readFileSync(FILENAME, 'utf8');
  if (!REGEXP.test(oldContent)) {
    throw new Error(`Can not match ${FILENAME} with regexp: ${REGEXP}`);
  }

  const { stdout } = await exec('ts-node ./src/cli -h');
  const newContent = oldContent.replace(REGEXP, `$1\`\`\`bash\n${stdout}\`\`\`\n$3`);
  if (newContent !== oldContent) {
    fs.writeFileSync(FILENAME, newContent, 'utf8');
    console.log(`Changes written to ${FILENAME}`);
  } else {
    console.log(`No changes in ${FILENAME}`);
  }
}
