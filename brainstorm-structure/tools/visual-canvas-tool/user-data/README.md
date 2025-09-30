# User Data Directory

This directory simulates user data storage for the Visual Canvas Tool. In a production environment, this would typically be stored in the user's application data directory.

## Structure

```
user-data/
├── projects.json           # All user projects and their canvas states
├── settings.json          # User preferences and application settings
├── templates/             # Component templates
│   ├── feature-template.json
│   ├── task-template.json
│   └── ...
├── backups/              # Automatic backups (created as needed)
└── exports/              # Exported project files (created as needed)
```

## Files Description

### `projects.json`
Contains all user projects with their complete canvas states, including:
- Project metadata (name, dates, etc.)
- Canvas viewport settings (zoom, pan position)
- All components with positions, properties, and relationships

### `settings.json`
User preferences and application configuration:
- UI theme and display preferences
- Canvas behavior settings
- Auto-save and backup configurations
- Component default styles and colors

### `templates/`
Reusable component templates that define:
- Default properties for different component types
- Form fields for component creation/editing
- Validation rules and constraints

## Sample Data

The included sample data provides:
- **3 demo projects** with various components and states
- **Realistic component layouts** showing different use cases
- **Template definitions** for features and tasks
- **User preferences** with sensible defaults

## Usage in Development

During development, the app will:
1. Load projects from `projects.json` on startup
2. Save changes back to the JSON file
3. Use templates for creating new components
4. Respect user settings for UI behavior

This simulates a real file-based storage system while keeping everything contained within the project for easy development and testing.
