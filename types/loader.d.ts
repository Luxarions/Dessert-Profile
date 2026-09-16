// Type definitions for DESSERT Loader v2.0.0

import type { DESSERT, Plugin, LoaderAPI } from './dessert';

export interface LoaderPluginShape extends Plugin {
  name: 'loader';
  version: string;
  install(core: DESSERT, priv: unknown): void;
  init(core: DESSERT): void;
}

export declare const LoaderPlugin: {
  new (): LoaderPluginShape;
  name: string;
  version: string;
};

export declare const loaderPlugin: LoaderPluginShape;

export declare const load: LoaderAPI;
export declare const css: LoaderAPI['css'];
export declare const js: LoaderAPI['js'];
export declare const img: LoaderAPI['img'];
export declare const font: LoaderAPI['font'];
export declare const json: LoaderAPI['json'];
export declare const html: LoaderAPI['html'];
export declare const parallel: LoaderAPI['parallel'];
export declare const sequence: LoaderAPI['sequence'];
export declare const all: LoaderAPI['all'];
export declare const preload: LoaderAPI['preload'];

export default loaderPlugin;
