using System;
using System.Collections.Generic;
using System.Linq;
using UnityEngine;

namespace OpenSourceSamples.Quests
{
    public sealed class QuestManager : MonoBehaviour
    {
        [SerializeField] private List<QuestDefinition> knownQuests = new();

        private readonly Dictionary<string, QuestRuntime> activeQuests = new();
        private readonly HashSet<string> completedQuestIds = new();

        public event Action<QuestRuntime> QuestAccepted;
        public event Action<QuestRuntime> QuestUpdated;
        public event Action<QuestRuntime> QuestCompleted;

        public IReadOnlyCollection<QuestRuntime> ActiveQuests => activeQuests.Values;

        public bool AcceptQuest(QuestDefinition definition)
        {
            if (definition == null || activeQuests.ContainsKey(definition.Id) || completedQuestIds.Contains(definition.Id))
            {
                return false;
            }

            QuestRuntime runtime = new(definition);
            activeQuests[definition.Id] = runtime;
            QuestAccepted?.Invoke(runtime);
            return true;
        }

        public bool AddProgress(string objectiveId, int amount)
        {
            bool changedAny = false;
            foreach (QuestRuntime quest in activeQuests.Values.ToList())
            {
                if (!quest.AddProgress(objectiveId, amount))
                {
                    continue;
                }

                changedAny = true;
                QuestUpdated?.Invoke(quest);
            }

            return changedAny;
        }

        public bool TurnInQuest(string questId)
        {
            if (!activeQuests.TryGetValue(questId, out QuestRuntime quest) || !quest.TryComplete())
            {
                return false;
            }

            activeQuests.Remove(questId);
            completedQuestIds.Add(questId);
            QuestCompleted?.Invoke(quest);
            return true;
        }

        public List<QuestSnapshot> SaveActiveQuests()
        {
            return activeQuests.Values.Select(quest => quest.CreateSnapshot()).ToList();
        }

        public void LoadActiveQuests(IEnumerable<QuestSnapshot> snapshots)
        {
            activeQuests.Clear();
            if (snapshots == null)
            {
                return;
            }

            Dictionary<string, QuestDefinition> lookup = knownQuests.ToDictionary(quest => quest.Id, quest => quest);
            foreach (QuestSnapshot snapshot in snapshots)
            {
                if (snapshot == null || !lookup.TryGetValue(snapshot.questId, out QuestDefinition definition))
                {
                    continue;
                }

                QuestRuntime runtime = new(definition, snapshot);
                if (runtime.State == QuestState.Completed)
                {
                    completedQuestIds.Add(definition.Id);
                }
                else
                {
                    activeQuests[definition.Id] = runtime;
                }
            }
        }
    }
}
