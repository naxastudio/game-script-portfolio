package com.eyang.minecraftkit;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Random;

public final class WeightedRewards<T> {
    private final List<Entry<T>> entries = new ArrayList<>();
    private int totalWeight;

    public WeightedRewards<T> add(T reward, int weight) {
        if (weight <= 0) {
            throw new IllegalArgumentException("weight must be greater than zero");
        }
        entries.add(new Entry<>(Objects.requireNonNull(reward), weight));
        totalWeight += weight;
        return this;
    }

    public T roll(Random random) {
        if (entries.isEmpty()) {
            throw new IllegalStateException("no rewards registered");
        }

        int ticket = random.nextInt(totalWeight) + 1;
        int cursor = 0;
        for (Entry<T> entry : entries) {
            cursor += entry.weight;
            if (ticket <= cursor) {
                return entry.reward;
            }
        }
        return entries.get(entries.size() - 1).reward;
    }

    public int size() {
        return entries.size();
    }

    private record Entry<T>(T reward, int weight) {
    }
}
