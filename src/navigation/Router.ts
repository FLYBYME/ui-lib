// ui-lib/navigation/Router.ts

import { BaseComponent } from '../BaseComponent';

export type RouteParams = Record<string, string>;
export type RouteComponent = new (props: any) => BaseComponent<any>;

export interface Route {
    path: string;
    component: RouteComponent;
    name?: string;
}

export class Router {
    private routes: Route[] = [];
    private container: HTMLElement;
    private currentComponent: BaseComponent<any> | null = null;
    private params: RouteParams = {};

    constructor(container: HTMLElement, routes: Route[]) {
        this.container = container;
        this.routes = routes;

        window.addEventListener('popstate', () => this.handleRoute());
        this.interceptLinks();
        this.handleRoute();
    }

    private interceptLinks(): void {
        document.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a');
            
            if (link && link.href && link.origin === window.location.origin) {
                const targetAttr = link.getAttribute('target');
                if (targetAttr && targetAttr !== '_self') return;
                
                e.preventDefault();
                this.navigate(link.pathname + link.search);
            }
        });
    }

    public navigate(path: string): void {
        window.history.pushState(null, '', path);
        this.handleRoute();
    }

    private handleRoute(): void {
        const path = window.location.pathname;
        const matched = this.matchRoute(path);

        if (matched) {
            this.renderRoute(matched.route, matched.params);
        } else {
            // Handle 404
            console.warn(`No route matched for path: ${path}`);
        }
    }

    private matchRoute(path: string): { route: Route, params: RouteParams } | null {
        for (const route of this.routes) {
            const routeParts = route.path.split('/').filter(p => p !== '');
            const pathParts = path.split('/').filter(p => p !== '');

            if (routeParts.length !== pathParts.length) continue;

            const params: RouteParams = {};
            let isMatch = true;

            for (let i = 0; i < routeParts.length; i++) {
                if (routeParts[i].startsWith(':')) {
                    params[routeParts[i].substring(1)] = pathParts[i];
                } else if (routeParts[i] !== pathParts[i]) {
                    isMatch = false;
                    break;
                }
            }

            if (isMatch) return { route, params };
        }

        // Special case for root
        if (path === '/') {
            const rootRoute = this.routes.find(r => r.path === '/');
            if (rootRoute) return { route: rootRoute, params: {} };
        }

        return null;
    }

    private renderRoute(route: Route, params: RouteParams): void {
        this.params = params;
        
        if (this.currentComponent) {
            this.currentComponent.dispose();
        }

        this.currentComponent = new route.component({ routeParams: params });
        this.currentComponent.mount(this.container);
        this.currentComponent.render();
    }

    public getParams(): RouteParams {
        return this.params;
    }
}
