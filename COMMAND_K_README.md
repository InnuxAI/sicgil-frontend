# Command K - System-Wide Command Palette

## Overview

The Command K feature provides a system-wide command palette that can be accessed from anywhere in the application using the keyboard shortcut `Ctrl+K` (Windows/Linux) or `⌘K` (Mac).

## Features

- **Quick Navigation**: Navigate to any page in the application
- **Theme Switching**: Quickly switch between light, dark, and system themes
- **Search**: Fuzzy search through all available commands
- **Keyboard Shortcuts**: All actions are accessible via keyboard for power users

## Usage

### Opening the Command Palette

Press `Ctrl+K` (or `⌘K` on Mac) from anywhere in the application to open the command palette.

A hint is displayed in the bottom-right corner of the screen on desktop devices.

### Available Commands

#### Navigation
- **Home** (`⌘H`) - Navigate to the home page
- **Dashboard** (`⌘D`) - Navigate to the dashboard
- **Test Blob** - Navigate to the blob testing page

#### Authentication
- **Login** - Navigate to the login page
- **Sign Up** - Navigate to the sign-up page

#### Theme
- **Light** - Switch to light theme
- **Dark** - Switch to dark theme
- **System** - Use system theme preference

#### Quick Actions
- **View Source Code** - Open the GitHub repository in a new tab
- **Reload Page** (`⌘R`) - Reload the current page

## Customization

To add new commands, edit the `CommandMenu` component at:
```
src/components/CommandMenu.tsx
```

### Adding a New Command

```tsx
<CommandItem
  onSelect={() => runCommand(() => router.push("/your-page"))}
>
  <YourIcon className="mr-2 h-4 w-4" />
  <span>Your Command</span>
  <CommandShortcut>⌘Y</CommandShortcut>
</CommandItem>
```

### Creating a New Command Group

```tsx
<CommandSeparator />
<CommandGroup heading="Your Group Name">
  {/* Your commands here */}
</CommandGroup>
```

## Implementation Details

### Components Used
- `CommandDialog` - The main dialog component from shadcn/ui
- `CommandInput` - Search input with fuzzy matching
- `CommandList` - Scrollable list of commands
- `CommandGroup` - Grouped commands with headings
- `CommandItem` - Individual command items
- `CommandShortcut` - Keyboard shortcut display
- `Kbd` - Styled keyboard key display

### Dependencies
- `cmdk` - The underlying command palette library
- `lucide-react` - Icons
- `next-themes` - Theme switching
- `next/navigation` - Routing

## Accessibility

- Full keyboard navigation support
- Screen reader friendly
- Respects system theme preferences
- Clear visual feedback for all interactions

## Browser Support

Works in all modern browsers that support:
- ES6+
- CSS Grid and Flexbox
- Keyboard event handling
