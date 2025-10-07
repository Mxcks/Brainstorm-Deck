# Available Triggers

## Core Value Triggers

### List Core Values
**Trigger**: "list core values" | "show core values" | "what are the core values"
**Action**: Display numbered list of all core values
**Confirmation**: "Showing you the core values list, is that what you wanted?"

### Add Core Value
**Trigger**: "add core value" | "new core value" | "add that as a core value"
**Action**: Start conversation to capture new core value with numbering
**Confirmation**: "Adding a new core value - let's discuss what principle you want to capture, sound good?"

## Learning & Error Triggers

### Practice Scenario / Error Logging
**Trigger**: "HEY YOU JUST MESSED UP" | "add error note" | "that was wrong" | "you misunderstood"
**Action**: Pause interaction, log the mistake, ask for explanation of what went wrong
**Confirmation**: "Pausing to learn from this mistake - can you explain what I got wrong so I can improve?"

## Knowledge Management Triggers

### Add to The Know
**Trigger**: "add that to the know" | "add to the know" | "remember this way of working"
**Action**: Start conversation to capture preference, methodology, or working style
**Confirmation**: "Got it! I'm adding this to your knowledge base. Let me understand the details..."

### Add to Likes
**Trigger**: "add that to my likes" | "I like this approach" | "save this preference"
**Action**: Capture specific preferences about components, approaches, or methods
**Confirmation**: "Adding this to your preferences - should I apply this to [specific context] or all similar situations?"

## Default User Settings

### Default User Behavior
**Note**: Default users get standard AI responses and basic functionality
**Capability**: Default user settings can be modified (stored in The Know)
**Risk Prompt Required**: Yes - when users attempt to modify defaults, show warning about system-wide effects

---

## Trigger Guidelines

### Confirmation Feedback
- All triggers must provide confirmation feedback
- Match the user's language style (casual, formal, technical, etc.)
- Ask clarifying questions when needed
- Confirm understanding before executing

### Flexible Recognition
- Triggers should recognize variations in phrasing
- Account for typos and casual language
- Support different ways of expressing the same intent
- Case-insensitive matching

### Hidden Triggers
- Authentication triggers ("I'm in the know", "im macks and im in the know") are NOT listed here
- These remain secret and are stored separately in The Know system files

---

*This file contains publicly visible triggers. Secret authentication and developer triggers are stored separately.*
