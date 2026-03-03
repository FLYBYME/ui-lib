// ui-lib/navigation/CommandPalette.ts

import { BaseComponent } from '../BaseComponent';
import { QuickPickDialog, QuickPickItem } from '../overlays/QuickPickDialog';

export interface Command extends QuickPickItem {
    shortcut?: string;
    action: () => void;
    category?: string;
}

export interface CommandPaletteProps {
    commands: Command[];
    placeholder?: string;
}

export class CommandPalette extends BaseComponent<CommandPaletteProps> {
    constructor(props: CommandPaletteProps) {
        super('div', props);
    }

    public render(): void {
        // This is a global singleton-like component that shows a modal
    }

    public async show(): Promise<void> {
        const selected = await QuickPickDialog.show<Command>(this.props.commands, {
            placeholder: this.props.placeholder || 'Type a command or search...',
            title: 'Command Palette'
        });

        if (selected) {
            selected.action();
        }
    }
}
