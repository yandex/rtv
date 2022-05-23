import { KnownTv } from 'rtv-client';

import { ColumnsInfo } from 'components/Table/types';

export const tvColumns: ColumnsInfo<KnownTv> = {
  isVisible: { label: 'Visible', type: 'visibility', width: 80, alignment: 'center' },
  ip: { label: 'IP', placeholder: 'Enter IP*' },
  alias: { label: 'Alias', placeholder: 'Enter alias*' },
  platform: { label: 'Platform', placeholder: 'Platform*' },
  mac: { label: 'MAC', placeholder: 'Enter MAC' },
  webOSPassphrase: { label: 'Passphrase(webOS)', placeholder: 'Enter passphrase', width: 175 },
  streamUrl: { label: 'Stream URL', placeholder: 'Enter stream url' },
};
