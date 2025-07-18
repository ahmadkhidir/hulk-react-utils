import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill for TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock Response API for tests
global.Response = class Response {
  ok: boolean;
  status: number;
  statusText: string;
  url: string;
  private _body: string;

  constructor(body: string = '', init: { status?: number; statusText?: string; url?: string } = {}) {
    this._body = body;
    this.ok = (init.status || 200) >= 200 && (init.status || 200) < 300;
    this.status = init.status || 200;
    this.statusText = init.statusText !== undefined ? init.statusText : 'OK';
    this.url = init.url || '';
  }

  async text(): Promise<string> {
    return this._body;
  }

  async json(): Promise<any> {
    return JSON.parse(this._body);
  }
} as any;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  redirect: jest.fn(),
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock DOM methods
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
  },
  writable: true,
});

// Mock URL constructor for Node.js environment
global.URL = class URL {
  searchParams: URLSearchParams;
  href: string;
  origin: string;
  pathname: string;

  constructor(url: string, base?: string) {
    if (base) {
      this.href = base + url;
    } else {
      this.href = url;
    }
    this.origin = 'http://localhost:3000';
    this.pathname = url;
    this.searchParams = new URLSearchParams();
  }

  toString() {
    return this.href;
  }
} as any;

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  private params: Map<string, string> = new Map();

  append(name: string, value: string) {
    this.params.set(name, value);
  }

  get(name: string) {
    return this.params.get(name) || null;
  }

  toString() {
    return Array.from(this.params.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
  }
} as any;

// Setup console.error to throw in tests to catch React warnings
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
  document.body.innerHTML = '';
});