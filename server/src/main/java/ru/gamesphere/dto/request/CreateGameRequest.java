package ru.gamesphere.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import ru.gamesphere.enums.Complexity;

@Data
public class CreateGameRequest {

    @NotBlank
    private String title;

    private String description;

    @Min(1)
    private Integer minPlayers;

    @Min(1)
    private Integer maxPlayers;

    private Complexity complexity;

    private String genre;

    @Min(1)
    private Integer totalCopies;
}
