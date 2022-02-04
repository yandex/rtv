import sinon, { SinonStub } from 'sinon';

import main from '../../src/main';
import * as clientOutput from '../../src/output';

export default (
  cmd: string
): Promise<{
  table: SinonStub;
  error: SinonStub;
  log: SinonStub;
  warn: SinonStub;
}> =>
  new Promise((resolve) => {
    const table = sinon.stub(clientOutput, 'table');
    const error = sinon.stub(clientOutput, 'error');
    const log = sinon.stub(clientOutput, 'log');
    const warn = sinon.stub(clientOutput, 'warn');

    const endCmd = () =>
      resolve({
        table,
        error,
        log,
        warn,
      });

    table.callsFake(endCmd);
    error.callsFake(endCmd);

    const argv = ['node', 'cli.js', ...cmd.split(' ')];
    main(argv);
  });
