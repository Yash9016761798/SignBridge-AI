if (typeof global.Response === 'undefined') {
  global.Response = class Response {
    status: number;
    ok: boolean;
    statusText: string;
    headers: Headers;
    url: string;
    redirected: boolean;
    type: ResponseType;
    private _bodyText: string;

    constructor(body?: BodyInit | null, init?: ResponseInit) {
      this._bodyText = body != null ? String(body) : '';
      this.status = init?.status ?? 200;
      this.ok = this.status >= 200 && this.status < 300;
      this.statusText = init?.statusText ?? 'OK';
      this.headers = new Headers(init?.headers);
      this.url = '';
      this.redirected = false;
      this.type = 'default';
    }

    json() {
      return Promise.resolve(JSON.parse(this._bodyText));
    }

    text() {
      return Promise.resolve(this._bodyText);
    }

    arrayBuffer() {
      return Promise.resolve(new ArrayBuffer(0));
    }

    clone() {
      const r = new Response(this._bodyText, {
        status: this.status,
        statusText: this.statusText,
      });
      return r;
    }

    blob() {
      return Promise.resolve(new Blob());
    }

    formData() {
      return Promise.resolve(new FormData());
    }

    static error() {
      return new Response(null, { status: 0, statusText: '' });
    }

    static redirect(url: string, status: number) {
      return new Response(null, { status, headers: { Location: url } });
    }
  } as unknown as typeof global.Response;
}

if (typeof global.Headers === 'undefined') {
  global.Headers = class Headers {
    private _map = new Map<string, string>();
    constructor(init?: HeadersInit) {
      if (init) {
        if (Array.isArray(init)) {
          init.forEach(([k, v]) => this._map.set(k.toLowerCase(), v));
        } else {
          Object.entries(init).forEach(([k, v]) =>
            this._map.set(k.toLowerCase(), v),
          );
        }
      }
    }
    append(name: string, value: string) {
      this._map.set(name.toLowerCase(), value);
    }
    delete(name: string) {
      this._map.delete(name.toLowerCase());
    }
    get(name: string) {
      return this._map.get(name.toLowerCase()) ?? null;
    }
    has(name: string) {
      return this._map.has(name.toLowerCase());
    }
    set(name: string, value: string) {
      this._map.set(name.toLowerCase(), value);
    }
    forEach(cb: (value: string, key: string) => void) {
      this._map.forEach(cb);
    }
    entries() {
      return this._map.entries();
    }
    keys() {
      return this._map.keys();
    }
    values() {
      return this._map.values();
    }
    [Symbol.iterator]() {
      return this._map[Symbol.iterator]();
    }
  } as unknown as typeof global.Headers;
}

if (typeof global.Request === 'undefined') {
  global.Request = class Request {
    url: string;
    method: string;
    headers: Headers;
    constructor(input: string | Request, init?: RequestInit) {
      this.url = typeof input === 'string' ? input : input.url;
      this.method = init?.method ?? 'GET';
      this.headers = new Headers(init?.headers);
    }
    json() {
      return Promise.resolve({});
    }
    text() {
      return Promise.resolve('');
    }
    clone() {
      return new Request(this.url, { method: this.method, headers: new Headers(this.headers) });
    }
  } as unknown as typeof global.Request;
}
