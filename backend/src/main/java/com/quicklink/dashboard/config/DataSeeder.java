package com.quicklink.dashboard.config;

import com.quicklink.dashboard.link.LinkService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedLinks(LinkService linkService) {
        return args -> linkService.seedData();
    }
}
