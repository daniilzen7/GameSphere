package ru.gamesphere.dto.request;

import lombok.Data;

@Data
public class UpdateHallRequest {

    private String name;

    private String description;

    private Boolean isActive;
}
