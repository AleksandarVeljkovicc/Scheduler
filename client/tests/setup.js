// Vitest setup file
import { beforeEach, afterEach } from 'vitest';

// Clean up DOM after each test
afterEach(() => {
  document.body.innerHTML = '';
});
