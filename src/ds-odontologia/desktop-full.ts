import {
  getSection01Desktop,
  getSection02Desktop,
  getSection03Desktop,
  getSection04Desktop,
  getSection05Desktop
} from './components.js';

export function getDesktopFull(): string {
  return `
  <div class="desktop-full-wrapper">
    ${getSection01Desktop()}
    ${getSection02Desktop()}
    ${getSection03Desktop()}
    ${getSection04Desktop()}
    ${getSection05Desktop()}
  </div>
  `;
}
