package ru.gamesphere.dto.request;

import jakarta.validation.constraints.Min;
import lombok.Data;
import ru.gamesphere.enums.Complexity;

@Data
public class UpdateGameRequest {

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

    private Boolean isActive;
}
