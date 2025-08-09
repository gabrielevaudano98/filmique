import { WebPlugin } from '@capacitor/core';

import type { CameraXProPluginPlugin } from './definitions';

export class CameraXProPluginWeb extends WebPlugin implements CameraXProPluginPlugin {
  async echo(options: { value: string }): Promise<{ value: string }> {
    console.log('ECHO', options);
    return options;
  }
}
