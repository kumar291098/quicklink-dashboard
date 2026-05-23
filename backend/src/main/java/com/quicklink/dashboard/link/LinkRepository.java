package com.quicklink.dashboard.link;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LinkRepository extends JpaRepository<Link, Long> {

    List<Link> findByCategoryIgnoreCaseOrderByTitleAsc(String category);
}
