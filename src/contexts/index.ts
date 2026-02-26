import { IndiaContext } from './india';
import { GlobalContext } from './global';
import type { GeopoliticalContext } from './types';

// Registry of available contexts
const contexts: Record<string, GeopoliticalContext> = {
    'india': IndiaContext,
    'global': GlobalContext,
};

// Current active context (defaulting to India as per project requirements)
let activeContext: GeopoliticalContext = IndiaContext;

export const setContext = (id: string): void => {
    if (contexts[id]) {
        activeContext = contexts[id];
        console.log(`[ContextEngine] Switched to ${activeContext.name}`);
        // A production app would emit an event here so the map re-renders
        window.dispatchEvent(new CustomEvent('context-changed', { detail: { context: activeContext } }));
    } else {
        console.warn(`[ContextEngine] Context '${id}' not found`);
    }
};

export const getContext = (): GeopoliticalContext => {
    return activeContext;
};

// Export context references
export { IndiaContext, GlobalContext };
export type { GeopoliticalContext };
