// ui-lib/core/Store.ts

export type Listener<T> = (newValue: T, oldValue: T) => void;

export class Store<T> {
    private state: T;
    private listeners: Set<Listener<T>> = new Set();

    constructor(initialState: T) {
        this.state = initialState;
    }

    public get(): T {
        return this.state;
    }

    public set(newState: Partial<T> | ((state: T) => T)): void {
        const oldValue = this.state;
        if (typeof newState === 'function') {
            this.state = (newState as (state: T) => T)(this.state);
        } else {
            this.state = { ...this.state, ...newState };
        }

        if (this.state !== oldValue) {
            this.listeners.forEach(listener => listener(this.state, oldValue));
        }
    }

    public subscribe(listener: Listener<T>): () => void {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
}

// Global registry for stores
const stores: Map<string, Store<any>> = new Map();

export function createStore<T>(name: string, initialState: T): Store<T> {
    if (stores.has(name)) {
        return stores.get(name)!;
    }
    const store = new Store(initialState);
    stores.set(name, store);
    return store;
}

export function getStore<T>(name: string): Store<T> | undefined {
    return stores.get(name);
}
