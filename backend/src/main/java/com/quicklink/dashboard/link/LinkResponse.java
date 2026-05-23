package com.quicklink.dashboard.link;

import java.time.LocalDateTime;

public record LinkResponse(
        Long id,
        String title,
        String url,
        String category,
        String description,
        String iconUrl,
        String tags,
        long clickCount,
        boolean favorite,
        LocalDateTime lastOpenedAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        long smartScore) {

    public static LinkResponse from(Link link, long smartScore) {
        return new LinkResponse(
                link.getId(),
                link.getTitle(),
                link.getUrl(),
                link.getCategory(),
                link.getDescription(),
                link.getIconUrl(),
                link.getTags(),
                link.getClickCount(),
                link.isFavorite(),
                link.getLastOpenedAt(),
                link.getCreatedAt(),
                link.getUpdatedAt(),
                smartScore);
    }
}
