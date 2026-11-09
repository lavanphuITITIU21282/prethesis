import { JSDOM } from 'jsdom';

// Initialize browser globals before React DOM chooses its event implementation.
export const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:4173',
});
for (const [key, value] of Object.entries({
  window: dom.window,
  self: dom.window,
  document: dom.window.document,
  navigator: dom.window.navigator,
  HTMLElement: dom.window.HTMLElement,
  localStorage: dom.window.localStorage,
  IS_REACT_ACT_ENVIRONMENT: true,
}))
  Object.defineProperty(globalThis, key, { value, configurable: true, writable: true });
