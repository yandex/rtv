import { KnownApp } from 'rtv-client';

import { ColumnsInfo } from 'components/Table/types';

const evalOnDebugPlaceholder = `// Use JavaScript ES5 here
// function evalOnDebug(params) {
//   console.log('Launch with params: ' + JSON.stringify(params));
// }`;

const defaultParamsPlaceholder = `// Use JSON5 here
// {
//   launchParam1: "value1"
// }`;

export const appColumns: ColumnsInfo<KnownApp> = {
  alias: { label: 'Alias', placeholder: 'Enter alias*' },
  tizenAppId: { label: 'Tizen ID', placeholder: 'Enter Tizen ID' },
  webosAppId: { label: 'Webos ID', placeholder: 'Enter Webos ID' },
  playstationAppId: { label: 'PS ID', placeholder: 'Enter PS ID' },
  orsayAppId: { label: 'Orsay ID', placeholder: 'Enter Orsay ID' },
  description: { label: 'Description', placeholder: 'Enter Description' },
  evalOnDebug: {
    label: 'Eval on debug',
    type: 'code',
    defaultValue: evalOnDebugPlaceholder,
    placeholder: 'Eval JavaScript ES5 code on debug',
  },
  defaultParams: {
    label: 'Params example',
    type: 'json5',
    defaultValue: defaultParamsPlaceholder,
    placeholder: 'Params example in JSON5 format',
  },
};
