package ru.gamesphere.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.gamesphere.dto.response.GameResponse;
import ru.gamesphere.entity.Game;

@Mapper(componentModel = "spring")
public interface GameMapper {

    @Mapping(source = "id", target = "gameId")
    GameResponse toGameResponse(Game game);
}
