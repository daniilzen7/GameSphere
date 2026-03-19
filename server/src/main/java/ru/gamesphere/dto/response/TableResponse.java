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
public class TableResponse {

    private UUID tableId;
    private UUID hallId;
    private String label;
    private Integer seats;
    private Boolean isActive;
}
