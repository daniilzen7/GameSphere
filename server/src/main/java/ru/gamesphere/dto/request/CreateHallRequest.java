package ru.gamesphere.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateHallRequest {

    @NotBlank
    private String name;

    private String description;
}
