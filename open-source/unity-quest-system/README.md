# Unity Quest System

A lightweight Unity C# quest system for RPGs, simulators, farming games, and adventure prototypes.

## What It Shows

- ScriptableObject quest definitions
- Objective progress tracking
- Quest state transitions
- Event-based updates
- Save/load friendly runtime snapshots
- Clean separation between data and runtime logic

## Files

- `QuestDefinition.cs` - quest and objective data
- `QuestRuntime.cs` - runtime state and progress logic
- `QuestManager.cs` - Unity component for accepting, updating, completing, and saving quests

## Example

```csharp
questManager.AcceptQuest(farmingQuest);
questManager.AddProgress("harvest_wheat", 1);
```

## Notes

This is a compact sample meant to be easy to copy into an existing project and extend.
