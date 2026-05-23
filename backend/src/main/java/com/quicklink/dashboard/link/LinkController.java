package com.quicklink.dashboard.link;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/links")
public class LinkController {

    private final LinkService linkService;

    public LinkController(LinkService linkService) {
        this.linkService = linkService;
    }

    @GetMapping
    public List<LinkResponse> getLinks(
            @RequestParam(defaultValue = "smart") String sort,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean favoritesOnly) {
        return linkService.getLinks(sort, category, search, favoritesOnly);
    }

    @GetMapping("/{id}")
    public LinkResponse getLink(@PathVariable Long id) {
        return linkService.getLinkById(id);
    }

    @PostMapping
    public LinkResponse createLink(@Valid @RequestBody LinkRequest request) {
        return linkService.createLink(request);
    }

    @PutMapping("/{id}")
    public LinkResponse updateLink(@PathVariable Long id, @Valid @RequestBody LinkRequest request) {
        return linkService.updateLink(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteLink(@PathVariable Long id) {
        linkService.deleteLink(id);
    }

    @PostMapping("/{id}/open")
    public OpenLinkResponse openLink(@PathVariable Long id) {
        return linkService.openLink(id);
    }

    @GetMapping("/recent")
    public List<LinkResponse> getRecentLinks(@RequestParam(defaultValue = "4") int limit) {
        return linkService.getRecentLinks(limit);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return linkService.getCategories();
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics() {
        return linkService.getAnalytics();
    }
}
