export interface CameraXProPluginPlugin {
  echo(options: { value: string }): Promise<{ value: string }>;
}
