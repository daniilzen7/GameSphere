package ru.gamesphere.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.gamesphere.dto.response.AdminBookingResponse;
import ru.gamesphere.dto.response.BookingResponse;
import ru.gamesphere.entity.Booking;
import ru.gamesphere.entity.Game;
import ru.gamesphere.entity.GameTable;
import ru.gamesphere.entity.User;

@Mapper(componentModel = "spring")
public interface BookingMapper {

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "table.id", target = "tableId")
    @Mapping(source = "table.label", target = "tableLabel")
    @Mapping(source = "table.hall.name", target = "hallName")
    @Mapping(source = "game.id", target = "gameId")
    @Mapping(source = "game.title", target = "gameTitle")
    BookingResponse toBookingResponse(Booking booking);

    @Mapping(source = "id", target = "bookingId")
    @Mapping(source = "user", target = "user")
    @Mapping(source = "table", target = "table")
    @Mapping(source = "game", target = "game")
    AdminBookingResponse toAdminBookingResponse(Booking booking);

    @Mapping(source = "id", target = "userId")
    AdminBookingResponse.UserInfo toUserInfo(User user);

    @Mapping(source = "id", target = "tableId")
    @Mapping(source = "hall.name", target = "hallName")
    AdminBookingResponse.TableInfo toTableInfo(GameTable table);

    @Mapping(source = "id", target = "gameId")
    AdminBookingResponse.GameInfo toGameInfo(Game game);
}
