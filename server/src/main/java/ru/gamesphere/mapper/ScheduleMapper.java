package ru.gamesphere.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.gamesphere.dto.response.ScheduleResponse;
import ru.gamesphere.entity.ClubSchedule;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

    @Mapping(source = "id", target = "scheduleId")
    ScheduleResponse toScheduleResponse(ClubSchedule schedule);
}
