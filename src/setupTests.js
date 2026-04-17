// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

Object.defineProperty(HTMLMediaElement.prototype, "load", {
  configurable: true,
  value: jest.fn(),
});

Object.defineProperty(HTMLMediaElement.prototype, "play", {
  configurable: true,
  value: jest.fn(() => Promise.resolve()),
});

Object.defineProperty(HTMLMediaElement.prototype, "pause", {
  configurable: true,
  value: jest.fn(),
});
