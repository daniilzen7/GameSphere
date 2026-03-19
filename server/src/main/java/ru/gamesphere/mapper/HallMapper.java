package ru.gamesphere.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.gamesphere.dto.response.HallResponse;
import ru.gamesphere.dto.response.TableResponse;
import ru.gamesphere.entity.GameTable;
import ru.gamesphere.entity.Hall;

@Mapper(componentModel = "spring")
public interface HallMapper {

    @Mapping(source = "id", target = "hallId")
    @Mapping(target = "tablesCount", expression = "java(hall.getTables() != null ? hall.getTables().size() : 0)")
    HallResponse toHallResponse(Hall hall);

    @Mapping(source = "id", target = "tableId")
    @Mapping(source = "hall.id", target = "hallId")
    TableResponse toTableResponse(GameTable table);
}
