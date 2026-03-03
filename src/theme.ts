// ui-lib/theme.ts

export const Theme = {
    colors: {
        accent: 'var(--ui-accent, #3b82f6)',
        bgPrimary: 'var(--ui-bg-primary, #09090b)',
        bgSecondary: 'var(--ui-bg-secondary, rgba(24, 24, 27, 0.5))',
        bgTertiary: 'var(--ui-bg-tertiary, #27272a)',
        border: 'var(--ui-border, rgba(255, 255, 255, 0.1))',
        textMain: 'var(--ui-text-main, #e4e4e7)',
        textMuted: 'var(--ui-text-muted, #71717a)',
        success: 'var(--ui-success, #22c55e)',
        warning: 'var(--ui-warning, #f59e0b)',
        error: 'var(--ui-error, #ef4444)',
        info: 'var(--ui-info, #3b82f6)',
        bgHover: 'var(--ui-bg-hover, rgba(255, 255, 255, 0.05))',
    },
    spacing: {
        xs: 'var(--ui-spacing-xs, 4px)',
        sm: 'var(--ui-spacing-sm, 8px)',
        md: 'var(--ui-spacing-md, 12px)',
        lg: 'var(--ui-spacing-lg, 20px)',
        xl: 'var(--ui-spacing-xl, 32px)',
    },
    radius: 'var(--ui-radius, 8px)',
    font: {
        family: 'var(--ui-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif)',
        sizeBase: 'var(--ui-font-size-base, 13px)',
    },

    injectVariables(): void {
        const id = 'ui-lib-theme-vars';
        if (document.getElementById(id)) return;

        const style = document.createElement('style');
        style.id = id;
        style.textContent = `
            :root {
                --ui-accent: #3b82f6;
                --ui-bg-primary: #09090b;
                --ui-bg-secondary: rgba(24, 24, 27, 0.5);
                --ui-bg-tertiary: #27272a;
                --ui-border: rgba(255, 255, 255, 0.1);
                --ui-text-main: #e4e4e7;
                --ui-text-muted: #71717a;
                --ui-success: #22c55e;
                --ui-warning: #f59e0b;
                --ui-error: #ef4444;
                --ui-info: #3b82f6;
                --ui-bg-hover: rgba(255, 255, 255, 0.05);
                --ui-spacing-xs: 4px;
                --ui-spacing-sm: 8px;
                --ui-spacing-md: 12px;
                --ui-spacing-lg: 20px;
                --ui-spacing-xl: 32px;
                --ui-radius: 8px;
                --ui-font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                --ui-font-size-base: 13px;
            }
        `;
        document.head.appendChild(style);
    }
};