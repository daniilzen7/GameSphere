package ru.gamesphere.entity;

import jakarta.persistence.*;
import lombok.*;
import ru.gamesphere.enums.Complexity;

import java.util.UUID;

@Entity
@Table(name = "games")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private Integer minPlayers;

    private Integer maxPlayers;

    @Enumerated(EnumType.STRING)
    @Column(length = 32)
    private Complexity complexity;

    @Column(length = 64)
    private String genre;

    @Column(nullable = false)
    @Builder.Default
    private Integer totalCopies = 1;

    @Column(nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}