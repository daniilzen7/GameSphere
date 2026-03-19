package ru.gamesphere;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class GameSphereApplication {

    public static void main(String[] args) {
        SpringApplication.run(GameSphereApplication.class, args);
    }
}
