// eslint-disable-next-line import/no-extraneous-dependencies
import { defineManifest } from '@crxjs/vite-plugin';

import packageData from '../package.json';


export default defineManifest({
  manifest_version: 3,
  name: packageData.displayName,
  version: packageData.version,
  description: packageData.description,
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module',
  },
  options_page: 'src/options/index.html',
  action: {
    default_popup: 'src/popup/index.html',
    default_icon: {
      16: 'icon16.png',
      32: 'icon32.png',
      48: 'icon48.png',
      128: 'icon128.png',
    },
  },
  icons: {
    16: 'icon16.png',
    32: 'icon32.png',
    48: 'icon48.png',
    128: 'icon128.png',
  },
  permissions: ['alarms', 'activeTab', 'storage', 'tabs', 'contextMenus', 'unlimitedStorage', 'downloads'],
  host_permissions: ['<all_urls>'] ,
  web_accessible_resources: [
    {
      resources: ['icon16.png', 'icon32.png', 'icon48.png', 'icon128.png'],
      matches: [],
    },
  ],
});
