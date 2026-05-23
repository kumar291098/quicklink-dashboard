package com.quicklink.dashboard.link;

public record AnalyticsResponse(
        long totalLinks,
        String mostOpenedTitle,
        String topCategory,
        long linksOpenedToday,
        long unusedLinks) {
}
