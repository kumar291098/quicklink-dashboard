package com.quicklink.dashboard.link;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional
public class LinkService {

    private static final List<String> DEFAULT_CATEGORIES = List.of(
            "Development",
            "Learning",
            "Finance",
            "Job Search",
            "Social Media",
            "Productivity",
            "Deployment",
            "Personal");

    private final LinkRepository linkRepository;

    public LinkService(LinkRepository linkRepository) {
        this.linkRepository = linkRepository;
    }

    public List<LinkResponse> getLinks(String sort, String category, String search, Boolean favoritesOnly) {
        var normalizedSort = sort == null || sort.isBlank() ? "smart" : sort.trim().toLowerCase(Locale.ROOT);
        var links = loadFilteredLinks(category, search, favoritesOnly);

        Comparator<Link> comparator = switch (normalizedSort) {
            case "recent" -> Comparator.comparing(Link::getLastOpenedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Link::isFavorite, Comparator.reverseOrder())
                    .thenComparing(Link::getTitle, String.CASE_INSENSITIVE_ORDER);
            case "most-clicked" -> Comparator.comparingLong(Link::getClickCount)
                    .reversed()
                    .thenComparing(Link::getLastOpenedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Link::getTitle, String.CASE_INSENSITIVE_ORDER);
            case "alphabetical" -> Comparator.comparing(Link::getTitle, String.CASE_INSENSITIVE_ORDER);
            default -> Comparator.comparingLong(this::calculateSmartScore)
                    .reversed()
                    .thenComparing(Link::getLastOpenedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Link::getTitle, String.CASE_INSENSITIVE_ORDER);
        };

        return links.stream()
                .sorted(comparator)
                .map(link -> LinkResponse.from(link, calculateSmartScore(link)))
                .toList();
    }

    public List<String> getCategories() {
        var discovered = linkRepository.findAll().stream()
                .map(Link::getCategory)
                .filter(category -> category != null && !category.isBlank())
                .distinct()
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();

        return DEFAULT_CATEGORIES.stream()
                .filter(defaultCategory -> discovered.stream().noneMatch(defaultCategory::equalsIgnoreCase))
                .collect(Collectors.collectingAndThen(Collectors.toList(), missing -> {
                    var combined = new java.util.ArrayList<>(discovered);
                    combined.addAll(missing);
                    combined.sort(String.CASE_INSENSITIVE_ORDER);
                    return combined;
                }));
    }

    public List<LinkResponse> getRecentLinks(int limit) {
        return linkRepository.findAll().stream()
                .filter(link -> link.getLastOpenedAt() != null)
                .sorted(Comparator.comparing(Link::getLastOpenedAt).reversed())
                .limit(limit)
                .map(link -> LinkResponse.from(link, calculateSmartScore(link)))
                .toList();
    }

    public AnalyticsResponse getAnalytics() {
        var links = linkRepository.findAll();
        var today = LocalDate.now();

        var mostOpenedTitle = links.stream()
                .max(Comparator.comparingLong(Link::getClickCount))
                .filter(link -> link.getClickCount() > 0)
                .map(Link::getTitle)
                .orElse("No activity yet");

        var topCategory = links.stream()
                .collect(Collectors.groupingBy(Link::getCategory, Collectors.counting()))
                .entrySet()
                .stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("Uncategorized");

        var linksOpenedToday = links.stream()
                .filter(link -> link.getLastOpenedAt() != null && link.getLastOpenedAt().toLocalDate().isEqual(today))
                .count();

        var unusedLinks = links.stream()
                .filter(link -> link.getClickCount() == 0)
                .count();

        return new AnalyticsResponse(links.size(), mostOpenedTitle, topCategory, linksOpenedToday, unusedLinks);
    }

    public LinkResponse createLink(LinkRequest request) {
        var link = new Link();
        applyRequest(link, request);
        return LinkResponse.from(linkRepository.save(link), calculateSmartScore(link));
    }

    public LinkResponse updateLink(Long id, LinkRequest request) {
        var link = getLink(id);
        applyRequest(link, request);
        return LinkResponse.from(linkRepository.save(link), calculateSmartScore(link));
    }

    public void deleteLink(Long id) {
        if (!linkRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found");
        }
        linkRepository.deleteById(id);
    }

    public LinkResponse getLinkById(Long id) {
        var link = getLink(id);
        return LinkResponse.from(link, calculateSmartScore(link));
    }

    public OpenLinkResponse openLink(Long id) {
        var link = getLink(id);
        link.setClickCount(link.getClickCount() + 1);
        link.setLastOpenedAt(LocalDateTime.now());
        var saved = linkRepository.save(link);
        return new OpenLinkResponse(saved.getUrl(), LinkResponse.from(saved, calculateSmartScore(saved)));
    }

    public void seedData() {
        if (linkRepository.count() > 0) {
            return;
        }

        createSeedLink("GitHub", "https://github.com", "Development", "Code repositories and issues", "git,code,projects", true, 42, LocalDateTime.now().minusHours(2));
        createSeedLink("ChatGPT", "https://chatgpt.com", "Productivity", "Everyday brainstorming and drafting", "ai,assistant,writing", true, 31, LocalDateTime.now().minusMinutes(45));
        createSeedLink("Gmail", "https://mail.google.com", "Productivity", "Primary email inbox", "mail,communication", false, 18, LocalDateTime.now().minusHours(6));
        createSeedLink("LinkedIn", "https://linkedin.com", "Job Search", "Networking and job applications", "jobs,networking", false, 12, LocalDateTime.now().minusDays(1));
        createSeedLink("Vercel", "https://vercel.com/dashboard", "Deployment", "Frontend deployment dashboard", "hosting,deploy", false, 15, LocalDateTime.now().minusDays(2));
    }

    private void createSeedLink(
            String title,
            String url,
            String category,
            String description,
            String tags,
            boolean favorite,
            long clickCount,
            LocalDateTime lastOpenedAt) {
        var link = new Link();
        link.setTitle(title);
        link.setUrl(url);
        link.setCategory(category);
        link.setDescription(description);
        link.setTags(tags);
        link.setFavorite(favorite);
        link.setClickCount(clickCount);
        link.setLastOpenedAt(lastOpenedAt);
        link.setIconUrl(buildFaviconUrl(url));
        linkRepository.save(link);
    }

    private List<Link> loadFilteredLinks(String category, String search, Boolean favoritesOnly) {
        var links = category != null && !category.isBlank()
                ? linkRepository.findByCategoryIgnoreCaseOrderByTitleAsc(category.trim())
                : linkRepository.findAll();

        return links.stream()
                .filter(link -> favoritesOnly == null || !favoritesOnly || link.isFavorite())
                .filter(link -> matchesSearch(link, search))
                .toList();
    }

    private boolean matchesSearch(Link link, String search) {
        if (search == null || search.isBlank()) {
            return true;
        }

        var needle = search.trim().toLowerCase(Locale.ROOT);
        return contains(link.getTitle(), needle)
                || contains(link.getUrl(), needle)
                || contains(link.getCategory(), needle)
                || contains(link.getDescription(), needle)
                || contains(link.getTags(), needle);
    }

    private boolean contains(String value, String needle) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(needle);
    }

    private Link getLink(Long id) {
        return linkRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Link not found"));
    }

    private void applyRequest(Link link, LinkRequest request) {
        link.setTitle(request.title().trim());
        link.setUrl(request.url().trim());
        link.setCategory(request.category().trim());
        link.setDescription(normalize(request.description()));
        link.setTags(normalize(request.tags()));
        link.setFavorite(request.favorite());
        link.setIconUrl(resolveIconUrl(request));
    }

    private String resolveIconUrl(LinkRequest request) {
        if (request.iconUrl() != null && !request.iconUrl().isBlank()) {
            return request.iconUrl().trim();
        }
        return buildFaviconUrl(request.url());
    }

    private String buildFaviconUrl(String rawUrl) {
        try {
            var uri = URI.create(rawUrl.trim());
            var domain = uri.getHost() == null ? rawUrl.trim() : uri.getHost().replaceFirst("^www\\.", "");
            return "https://www.google.com/s2/favicons?sz=128&domain=" + domain;
        } catch (IllegalArgumentException ex) {
            return null;
        }
    }

    private String normalize(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private long calculateSmartScore(Link link) {
        long score = link.getClickCount();
        if (link.isFavorite()) {
            score += 40;
        }
        if (link.getLastOpenedAt() != null) {
            var today = LocalDate.now();
            if (link.getLastOpenedAt().toLocalDate().isEqual(today)) {
                score += 160;
            } else if (link.getLastOpenedAt().toLocalDate().isEqual(today.minusDays(1))) {
                score += 120;
            } else if (link.getLastOpenedAt().toLocalDate().isAfter(today.minusDays(4))) {
                score += 80;
            } else if (link.getLastOpenedAt().toLocalDate().isAfter(today.minusDays(7))) {
                score += 40;
            }
        }
        return score;
    }
}
