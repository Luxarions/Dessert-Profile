// Type definitions for DESSERT v2.0.0

export interface DessertOptions {
  autoInit?: boolean;
  debug?: boolean;
  closeOnEscape?: boolean;
}

export type AlertType = 'info' | 'success' | 'warning' | 'danger';

export interface LoadItem {
  type: string;
  url: string;
  opts?: Record<string, unknown>;
}

export type ProgressFn<T = string | LoadItem> = (
  done: number,
  total: number,
  item: T
) => void;

export interface Plugin {
  name: string;
  version?: string;
  install?(core: DESSERT, priv: unknown): void;
  init?(core: DESSERT): void;
}

export interface ModalAPI {
  open(el: HTMLElement): void;
  close(el: HTMLElement): void;
}

export interface LoaderAPI {
  (url: string): Promise<unknown>;
  (type: string, url: string, opts?: Record<string, unknown>): Promise<unknown>;
  css(url: string): Promise<HTMLLinkElement>;
  js(url: string, opts?: { async?: boolean; module?: boolean; target?: HTMLElement }): Promise<HTMLScriptElement>;
  img(url: string): Promise<HTMLImageElement>;
  font(url: string): Promise<HTMLLinkElement>;
  json<T = unknown>(url: string): Promise<T>;
  html(url: string): Promise<string>;
  video(url: string): Promise<HTMLVideoElement>;
  audio(url: string): Promise<HTMLAudioElement>;
  parallel(items: Array<string | LoadItem>, onProgress?: ProgressFn): Promise<unknown[]>;
  sequence(items: Array<string | LoadItem>, onProgress?: ProgressFn): Promise<unknown[]>;
  all(map: Record<string, string>, onProgress?: ProgressFn): Promise<Record<string, unknown>>;
  preload(urls: string[]): void;
  clearCache(): void;
  cache: Map<string, Promise<unknown>>;
  version: string;
}

export interface ComponentsAPI {
  modal: (el: HTMLElement) => void;
  dropdown: (el: HTMLElement) => void;
  tabs: (el: HTMLElement) => void;
  accordion: (el: HTMLElement) => void;
}

export interface DESSERT {
  readonly version: string;
  readonly prefix: string;
  components: ComponentsAPI;
  modal: ModalAPI;
  load?: LoaderAPI;
  init(opts?: DessertOptions): this;
  autoInit(root?: ParentNode): void;
  destroy(el: HTMLElement): void;
  use(plugin: Plugin): this;
  register(name: string, plugin: Plugin): this;
  addClass(el: HTMLElement, name: string): HTMLElement;
  removeClass(el: HTMLElement, name: string): HTMLElement;
  toggleClass(el: HTMLElement, name: string, force?: boolean): HTMLElement;
  setData(el: HTMLElement, key: string, value: string): HTMLElement;
  getData(el: HTMLElement, key: string): string | null;
  alert(msg: string, type?: AlertType, duration?: number): void;
}

export interface DESSERTConstructor {
  new (cfg?: DessertOptions & { force?: boolean }): DESSERT;
  readonly version: string;
  create(cfg?: DessertOptions): DESSERT;
}

declare const DESSERT_INSTANCE: DESSERT;

export default DESSERT_INSTANCE;
export { DESSERT_INSTANCE };
