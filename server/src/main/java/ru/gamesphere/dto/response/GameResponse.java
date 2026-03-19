package ru.gamesphere.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import ru.gamesphere.enums.Complexity;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class GameResponse {

    private UUID gameId;
    private String title;
    private String description;
    private Integer minPlayers;
    private Integer maxPlayers;
    private Complexity complexity;
    private String genre;
    private Integer totalCopies;
    private Boolean isActive;
}
