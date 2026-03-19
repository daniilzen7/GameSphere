package ru.gamesphere.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateTableRequest {

    @NotBlank
    private String label;

    @NotNull
    @Min(1)
    private Integer seats;
}
