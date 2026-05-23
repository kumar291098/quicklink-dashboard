package com.quicklink.dashboard.config;

import java.nio.file.Files;
import java.nio.file.Path;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class StorageDirectoryConfig {

    @Bean
    CommandLineRunner ensureStorageDirectory(
            @Value("${quicklink.storage-dir}") String storageDirectory) {
        return args -> Files.createDirectories(Path.of(storageDirectory));
    }
}
