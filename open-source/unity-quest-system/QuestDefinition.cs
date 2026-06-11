using System;
using System.Collections.Generic;
using UnityEngine;

namespace OpenSourceSamples.Quests
{
    [CreateAssetMenu(menuName = "Open Source Samples/Quest Definition")]
    public sealed class QuestDefinition : ScriptableObject
    {
        [SerializeField] private string id = Guid.NewGuid().ToString("N");
        [SerializeField] private string displayName = "New Quest";
        [SerializeField] private string description = "";
        [SerializeField] private List<QuestObjectiveDefinition> objectives = new();

        public string Id => id;
        public string DisplayName => displayName;
        public string Description => description;
        public IReadOnlyList<QuestObjectiveDefinition> Objectives => objectives;

        private void OnValidate()
        {
            if (string.IsNullOrWhiteSpace(id))
            {
                id = Guid.NewGuid().ToString("N");
            }
        }
    }

    [Serializable]
    public sealed class QuestObjectiveDefinition
    {
        [SerializeField] private string id = "objective_id";
        [SerializeField] private string label = "Objective";
        [SerializeField, Min(1)] private int requiredAmount = 1;

        public string Id => id;
        public string Label => label;
        public int RequiredAmount => requiredAmount;
    }
}
