package com.quicklink.dashboard.link;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LinkRequest(
        @NotBlank @Size(max = 120) String title,
        @NotBlank @Size(max = 2048) String url,
        @NotBlank @Size(max = 60) String category,
        @Size(max = 1000) String description,
        @Size(max = 2048) String iconUrl,
        @Size(max = 500) String tags,
        boolean favorite) {
}
