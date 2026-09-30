import '@testing-library/jest-dom';

// jsdom does not implement browser scrolling; components may call this in effects.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
