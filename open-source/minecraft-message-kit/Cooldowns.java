package com.eyang.minecraftkit;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.UUID;

public final class Cooldowns {
    private final Clock clock;
    private final Map<String, Instant> expiresAt = new HashMap<>();

    public Cooldowns() {
        this(Clock.systemUTC());
    }

    public Cooldowns(Clock clock) {
        this.clock = clock;
    }

    public boolean isReady(UUID playerId, String action) {
        Instant expiry = expiresAt.get(key(playerId, action));
        return expiry == null || !expiry.isAfter(clock.instant());
    }

    public void start(UUID playerId, String action, Duration duration) {
        expiresAt.put(key(playerId, action), clock.instant().plus(duration));
    }

    public long remainingSeconds(UUID playerId, String action) {
        Instant expiry = expiresAt.get(key(playerId, action));
        if (expiry == null) {
            return 0;
        }
        long seconds = Duration.between(clock.instant(), expiry).toSeconds();
        return Math.max(0, seconds);
    }

    public void clear(UUID playerId, String action) {
        expiresAt.remove(key(playerId, action));
    }

    public int cleanupExpired() {
        int removed = 0;
        Instant now = clock.instant();
        Iterator<Map.Entry<String, Instant>> iterator = expiresAt.entrySet().iterator();
        while (iterator.hasNext()) {
            Map.Entry<String, Instant> entry = iterator.next();
            if (!entry.getValue().isAfter(now)) {
                iterator.remove();
                removed++;
            }
        }
        return removed;
    }

    private String key(UUID playerId, String action) {
        return playerId + ":" + action.toLowerCase();
    }
}
