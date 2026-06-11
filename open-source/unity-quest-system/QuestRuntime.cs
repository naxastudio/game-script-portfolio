using System;
using System.Collections.Generic;
using System.Linq;

namespace OpenSourceSamples.Quests
{
    public enum QuestState
    {
        Active,
        ReadyToTurnIn,
        Completed
    }

    [Serializable]
    public sealed class QuestSnapshot
    {
        public string questId;
        public QuestState state;
        public List<ObjectiveSnapshot> objectives = new();
    }

    [Serializable]
    public sealed class ObjectiveSnapshot
    {
        public string objectiveId;
        public int currentAmount;
    }

    public sealed class QuestRuntime
    {
        private readonly QuestDefinition definition;
        private readonly Dictionary<string, int> progress = new();

        public QuestDefinition Definition => definition;
        public QuestState State { get; private set; } = QuestState.Active;

        public QuestRuntime(QuestDefinition definition)
        {
            this.definition = definition ?? throw new ArgumentNullException(nameof(definition));
            foreach (QuestObjectiveDefinition objective in definition.Objectives)
            {
                progress[objective.Id] = 0;
            }
        }

        public QuestRuntime(QuestDefinition definition, QuestSnapshot snapshot) : this(definition)
        {
            if (snapshot == null)
            {
                return;
            }

            State = snapshot.state;
            foreach (ObjectiveSnapshot objective in snapshot.objectives)
            {
                if (progress.ContainsKey(objective.objectiveId))
                {
                    progress[objective.objectiveId] = Math.Max(0, objective.currentAmount);
                }
            }
            RefreshState();
        }

        public bool AddProgress(string objectiveId, int amount)
        {
            if (State != QuestState.Active || amount <= 0 || !progress.ContainsKey(objectiveId))
            {
                return false;
            }

            QuestObjectiveDefinition objective = definition.Objectives.First(item => item.Id == objectiveId);
            int nextValue = Math.Min(objective.RequiredAmount, progress[objectiveId] + amount);
            bool changed = nextValue != progress[objectiveId];
            progress[objectiveId] = nextValue;
            RefreshState();
            return changed;
        }

        public int GetProgress(string objectiveId)
        {
            return progress.TryGetValue(objectiveId, out int value) ? value : 0;
        }

        public bool TryComplete()
        {
            if (State != QuestState.ReadyToTurnIn)
            {
                return false;
            }

            State = QuestState.Completed;
            return true;
        }

        public QuestSnapshot CreateSnapshot()
        {
            return new QuestSnapshot
            {
                questId = definition.Id,
                state = State,
                objectives = progress
                    .Select(item => new ObjectiveSnapshot { objectiveId = item.Key, currentAmount = item.Value })
                    .ToList()
            };
        }

        private void RefreshState()
        {
            if (State == QuestState.Completed)
            {
                return;
            }

            bool allDone = definition.Objectives.All(objective => GetProgress(objective.Id) >= objective.RequiredAmount);
            State = allDone ? QuestState.ReadyToTurnIn : QuestState.Active;
        }
    }
}
