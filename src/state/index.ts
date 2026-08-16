import { data } from './data.ts';
import { preferences } from './preferences.ts';
import { view } from './view.ts';

/** The whole application state: three buckets of signal leaves. */
export const state = { view, data, preferences };

export { predict } from './data.ts';
export { resetReactionPreferences } from './preferences.ts';
export { isHidden } from './view.ts';
export type { ResultsPanel } from './view.ts';
