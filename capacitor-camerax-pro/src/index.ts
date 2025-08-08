import { registerPlugin } from '@capacitor/core';

import type { CameraXProPluginPlugin } from './definitions';

const CameraXProPlugin = registerPlugin<CameraXProPluginPlugin>('CameraXProPlugin', {
  web: () => import('./web').then((m) => new m.CameraXProPluginWeb()),
});

export * from './definitions';
export { CameraXProPlugin };
