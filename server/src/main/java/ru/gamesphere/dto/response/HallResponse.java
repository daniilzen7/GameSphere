package ru.gamesphere.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HallResponse {

    private UUID hallId;
    private String name;
    private String description;
    private Boolean isActive;
    private Integer tablesCount;
}
