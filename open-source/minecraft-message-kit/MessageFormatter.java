package com.eyang.minecraftkit;

import java.util.Map;

public final class MessageFormatter {
    private MessageFormatter() {
    }

    public static String format(String template, Map<String, ?> placeholders) {
        String output = color(template == null ? "" : template);
        if (placeholders == null || placeholders.isEmpty()) {
            return output;
        }

        for (Map.Entry<String, ?> entry : placeholders.entrySet()) {
            String key = "{" + entry.getKey() + "}";
            String value = String.valueOf(entry.getValue());
            output = output.replace(key, value);
        }
        return output;
    }

    public static String color(String text) {
        StringBuilder builder = new StringBuilder(text.length());
        for (int index = 0; index < text.length(); index++) {
            char current = text.charAt(index);
            if (current == '&' && index + 1 < text.length()) {
                char next = text.charAt(index + 1);
                if (isColorCode(next)) {
                    builder.append('§').append(Character.toLowerCase(next));
                    index++;
                    continue;
                }
            }
            builder.append(current);
        }
        return builder.toString();
    }

    public static String stripColor(String text) {
        if (text == null || text.isEmpty()) {
            return "";
        }

        StringBuilder builder = new StringBuilder(text.length());
        for (int index = 0; index < text.length(); index++) {
            char current = text.charAt(index);
            if ((current == '§' || current == '&') && index + 1 < text.length() && isColorCode(text.charAt(index + 1))) {
                index++;
                continue;
            }
            builder.append(current);
        }
        return builder.toString();
    }

    private static boolean isColorCode(char value) {
        return "0123456789abcdefklmnorABCDEFKLMNOR".indexOf(value) >= 0;
    }
}
