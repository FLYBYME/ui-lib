// ui-lib/BaseComponent.ts

import { Theme } from './theme';

export interface BaseComponentProps {
    className?: string;
}

export abstract class BaseComponent<TProps = any> {
    protected element: HTMLElement;
    protected _props: TProps;
    protected disposables: { dispose: () => void }[] = [];
    protected childComponents: Set<BaseComponent> = new Set();

    /**
     * @param tagName The HTML tag to create (e.g., 'div', 'button')
     * @param props The configuration properties for this component
     */
    constructor(tagName: string, props: TProps = {} as TProps) {
        this.element = document.createElement(tagName);
        this._props = props;

        // Inject theme and global styles
        Theme.injectVariables();
        BaseComponent.injectGlobalStyles();
        BaseComponent.injectGlobalAnimations();

        const p = props as any;
        if (p && typeof p === 'object' && p.className && typeof p.className === 'string') {
            this.addClasses(...p.className.split(' '));
        }
        BaseComponent.injectGlobalAnimations();
    }

    private static animationsInjected = false;
    private static injectGlobalAnimations(): void {
        if (BaseComponent.animationsInjected) return;
        BaseComponent.animationsInjected = true;

        const style = document.createElement('style');
        style.id = 'ui-lib-global-animations';
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInUp {
                from { transform: translateY(10px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            .animate-fadeIn, .fade-in { animation: fadeIn 0.3s ease-out; }
            .animate-slideInUp, .slide-in-from-bottom { animation: slideInUp 0.3s ease-out; }
            .animate-pulse { animation: pulse 2s infinite ease-in-out; }
            .animate-spin, .spin { animation: spin 1s infinite linear; }
        `;
        document.head.appendChild(style);
    }

    private static globalStylesInjected = false;
    private static injectGlobalStyles(): void {
        if (BaseComponent.globalStylesInjected) return;
        BaseComponent.globalStylesInjected = true;

        const style = document.createElement('style');
        style.id = 'ui-lib-global-styles';
        style.textContent = `
            .ui-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                border-radius: var(--ui-radius);
                border: 1px solid transparent;
                font-family: inherit;
                font-weight: 500;
                outline: none;
                user-select: none;
                transition: all 0.15s ease-in-out;
            }
            .ui-button:disabled { cursor: not-allowed; opacity: 0.5; }
            .ui-button:not(:disabled) { cursor: pointer; }
            .ui-button-sm { padding: var(--ui-spacing-xs) var(--ui-spacing-sm); font-size: 11px; gap: 4px; }
            .ui-button-base { padding: var(--ui-spacing-xs) var(--ui-spacing-sm); font-size: var(--ui-font-size-base); gap: var(--ui-spacing-sm); }
            .ui-button-lg { padding: 8px 16px; font-size: 15px; gap: 10px; }
            .ui-button-primary { background-color: var(--ui-accent); color: #ffffff; border: 1px solid var(--ui-accent); }
            .ui-button-secondary { background-color: var(--ui-bg-tertiary); color: var(--ui-text-main); border: 1px solid var(--ui-border); }
            .ui-button-ghost { background-color: transparent; color: var(--ui-text-main); border: 1px solid transparent; }
            .ui-button-danger { background-color: rgba(239, 68, 68, 0.15); color: var(--ui-error); border: 1px solid rgba(239, 68, 68, 0.2); }
            .ui-button-accent { background-color: var(--ui-accent); color: #ffffff; border: 1px solid var(--ui-accent); }
            .ui-button:not(:disabled):hover { filter: brightness(1.15); }
            .ui-button-ghost:not(:disabled):hover { background-color: var(--ui-bg-hover); filter: none; }
            .ui-button-secondary:not(:disabled):hover { background-color: var(--ui-border); border-color: var(--ui-text-muted); filter: none; }
            .ui-button:not(:disabled):active { transform: scale(0.98); }
        `;
        document.head.appendChild(style);
    }

    /**
     * Core render method to be implemented by subclasses.
     * This is where you map props to the DOM structure.
     */
    public abstract render(): void;

    /**
     * Returns the underlying DOM element.
     */
    public getElement(): HTMLElement {
        return this.element;
    }

    /**
     * Mounts the component to a parent DOM element.
     */
    public mount(parent: HTMLElement): void {
        parent.appendChild(this.element);
    }

    /**
     * Alias for appendChildren(child) for single child appends.
     */
    public appendChild(child: BaseComponent<any> | Node | string): BaseComponent<any> {
        this.appendChildren(child);
        return this;
    }

    /**
     * Utility to safely append children (either BaseComponents, DOM nodes, or text).
     */
    public appendChildren(...children: (BaseComponent<any> | Node | string)[]): BaseComponent<any> {
        children.forEach(child => {
            if (child instanceof BaseComponent) {
                this.childComponents.add(child);
                this.element.appendChild(child.getElement());
            } else if (typeof child === 'string') {
                this.element.appendChild(document.createTextNode(child));
            } else {
                this.element.appendChild(child);
            }
        });
        return this;
    }

    /**
     * Get children of the component.
     */
    public getChildren(): BaseComponent<any>[] {
        return Array.from(this.childComponents);
    }

    /**
     * Clears all children from the element and disposes of tracked child components.
     */
    public clear(): BaseComponent<any> {
        this.childComponents.forEach(child => child.dispose());
        this.childComponents.clear();
        this.element.innerHTML = '';
        return this;
    }

    /**
     * Applies inline styles safely.
     * @deprecated Use CSS classes and variables where possible for CSP compliance.
     */
    public applyStyles(styles: Partial<CSSStyleDeclaration>): BaseComponent<any> {
        Object.assign(this.element.style, styles);
        return this;
    }

    /**
     * Adds CSS classes to the root element.
     */
    protected addClasses(...classNames: string[]): BaseComponent<any> {
        this.element.classList.add(...classNames.filter(Boolean));
        return this;
    }

    /**
     * Updates props and triggers a re-render. 
     * Useful for dynamic components.
     */
    public updateProps(newProps: Partial<TProps>): BaseComponent<any> {
        const oldClassName = (this._props as any)?.className;
        this._props = { ...this._props, ...newProps };
        const newClassName = (this._props as any)?.className;

        if (newClassName !== oldClassName) {
            if (oldClassName && typeof oldClassName === 'string') {
                this.element.classList.remove(...oldClassName.split(' '));
            }
            if (newClassName && typeof newClassName === 'string') {
                this.addClasses(...newClassName.split(' '));
            }
        }

        // Safe clear before re-rendering
        this.clear();
        this.render();
        return this;
    }

    public get props(): TProps {
        return this._props;
    }

    /**
     * Safe event binding utility that automatically registers the listener to disposables.
     */
    protected addEventListener(
        element: HTMLElement,
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void {
        element.addEventListener(type, listener, options);
        this.disposables.push({
            dispose: () => element.removeEventListener(type, listener, options)
        });
    }

    /**
     * Utility to set ARIA attributes.
     */
    protected setAria(attributes: Record<string, string>): void {
        Object.entries(attributes).forEach(([key, value]) => {
            this.element.setAttribute(`aria-${key}`, value);
        });
    }

    /**
     * Lifecycle method for cleanup. Remove event listeners here.
     */
    public destroy(): void {
        this.element.remove();
    }

    /**
     * Alias for destroy to match IDE naming conventions.
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.childComponents.forEach(child => child.dispose());
        this.childComponents.clear();
        this.destroy();
    }
}