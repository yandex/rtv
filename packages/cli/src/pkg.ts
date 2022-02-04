/**
 * Reads own package.json
 */

import readPackageUp from 'read-pkg-up';

export default readPackageUp.sync({ cwd: __dirname })?.package;
