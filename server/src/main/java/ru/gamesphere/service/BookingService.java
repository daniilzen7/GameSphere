package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.AdminCreateBookingRequest;
import ru.gamesphere.dto.request.AdminUpdateBookingRequest;
import ru.gamesphere.dto.request.CreateBookingRequest;
import ru.gamesphere.dto.response.AdminBookingResponse;
import ru.gamesphere.dto.response.AvailableSlotResponse;
import ru.gamesphere.dto.response.BookingResponse;
import ru.gamesphere.entity.*;
import ru.gamesphere.enums.BookingStatus;
import ru.gamesphere.enums.NotificationTemplate;
import ru.gamesphere.exception.BadRequestException;
import ru.gamesphere.exception.ConflictException;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.BookingMapper;
import ru.gamesphere.repository.*;

import java.time.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int SLOT_STEP_MINUTES = 60;
    private static final Duration MIN_CANCEL_ADVANCE = Duration.ofHours(1);

    private final BookingRepository bookingRepository;
    private final GameTableRepository gameTableRepository;
    private final GameRepository gameRepository;
    private final UserRepository userRepository;
    private final ClubScheduleRepository clubScheduleRepository;
    private final NotificationService notificationService;
    private final BookingMapper bookingMapper;

    public AvailableSlotResponse getAvailableSlots(LocalDate date, int guests, int durationMinutes) {
        ClubSchedule schedule = clubScheduleRepository.findByDate(date)
                .orElseThrow(() -> new BadRequestException("CLUB_CLOSED", "Клуб не работает в указанную дату"));

        Instant now = Instant.now();
        List<GameTable> tables = gameTableRepository.findAvailableTables(guests);
        List<AvailableSlotResponse.Slot> slots = new ArrayList<>();

        for (GameTable table : tables) {
            List<Booking> bookings = bookingRepository.findConflicting(
                    table.getId(),
                    date.atTime(schedule.getOpenTime()).toInstant(ZoneOffset.UTC),
                    date.atTime(schedule.getCloseTime()).toInstant(ZoneOffset.UTC));

            LocalTime cursor = schedule.getOpenTime();
            while (!cursor.plusMinutes(durationMinutes).isAfter(schedule.getCloseTime())) {
                LocalTime slotStart = cursor;
                LocalTime slotEnd = cursor.plusMinutes(durationMinutes);
                Instant slotStartInstant = date.atTime(slotStart).toInstant(ZoneOffset.UTC);
                Instant slotEndInstant = date.atTime(slotEnd).toInstant(ZoneOffset.UTC);

                if (slotStartInstant.isBefore(now)) {
                    cursor = cursor.plusMinutes(SLOT_STEP_MINUTES);
                    continue;
                }

                boolean conflict = bookings.stream().anyMatch(b ->
                        b.getStartAt().isBefore(slotEndInstant) && b.getEndAt().isAfter(slotStartInstant));

                if (!conflict) {
                    slots.add(AvailableSlotResponse.Slot.builder()
                            .slotId("slot-" + table.getId().toString().substring(0, 8) + "-" + slotStart.toString().replace(":", ""))
                            .tableId(table.getId())
                            .tableLabel(table.getLabel())
                            .hallName(table.getHall().getName())
                            .seats(table.getSeats())
                            .startTime(cursor)
                            .endTime(slotEnd)
                            .build());
                }
                cursor = cursor.plusMinutes(SLOT_STEP_MINUTES);
            }
        }

        return AvailableSlotResponse.builder()
                .date(date)
                .clubHours(AvailableSlotResponse.ClubHours.builder()
                        .openTime(schedule.getOpenTime())
                        .closeTime(schedule.getCloseTime())
                        .build())
                .slots(slots)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<BookingResponse> getUserBookings(String email, BookingStatus status, Pageable pageable) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        Page<Booking> page;
        if (status != null) {
            page = bookingRepository.findAllByUserIdAndStatus(user.getId(), status, pageable);
        } else {
            page = bookingRepository.findAllByUserId(user.getId(), pageable);
        }
        return page.map(bookingMapper::toBookingResponse);
    }

    public BookingResponse getBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));
        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse createBooking(String email, CreateBookingRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));

        GameTable table = gameTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));

        if (!table.getIsActive()) {
            throw new BadRequestException("INVALID_PARAMS", "Столик недоступен");
        }

        if (bookingRepository.existsByUserIdAndStatusAndEndAtAfter(
                user.getId(), BookingStatus.ACTIVE, Instant.now())) {
            throw new ConflictException("BOOKING_LIMIT_REACHED",
                    "У вас уже есть активное бронирование. Отмените его перед созданием нового.");
        }

        Instant startAt = request.getDate().atTime(request.getStartTime()).toInstant(ZoneOffset.UTC);
        Instant endAt = startAt.plus(Duration.ofMinutes(request.getDurationMinutes()));

        validateWorkingHours(request.getDate(), request.getStartTime(),
                request.getStartTime().plusMinutes(request.getDurationMinutes()));

        List<Booking> conflicts = bookingRepository.findConflicting(table.getId(), startAt, endAt);
        if (!conflicts.isEmpty()) {
            throw new ConflictException("SLOT_ALREADY_BOOKED", "На это время нет свободных столов.");
        }

        Game game = resolveAndCheckGameAvailability(request.getGameId(), startAt, endAt);

        Booking booking = Booking.builder()
                .user(user)
                .table(table)
                .game(game)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        booking = bookingRepository.save(booking);

        notificationService.sendAsync(booking, user, NotificationTemplate.BOOKING_CREATED);

        return bookingMapper.toBookingResponse(booking);
    }

    @Transactional
    public BookingResponse cancelBooking(UUID id, String email) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (booking.getUser() == null || !booking.getUser().getEmail().equals(email)) {
            throw new BadRequestException("FORBIDDEN", "Вы можете отменять только собственные бронирования");
        }

        if (booking.getStatus() != BookingStatus.ACTIVE) {
            throw new BadRequestException("BOOKING_NOT_CANCELLABLE",
                    "Невозможно отменить бронирование со статусом '" + booking.getStatus().name().toLowerCase() + "'");
        }

        if (booking.getStartAt().minus(MIN_CANCEL_ADVANCE).isBefore(Instant.now())) {
            throw new ConflictException("LATE_CANCELLATION",
                    "Онлайн-отмена возможна не позднее чем за 1 час. Позвоните менеджеру.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        booking = bookingRepository.save(booking);

        if (booking.getUser() != null) {
            notificationService.sendAsync(booking, booking.getUser(), NotificationTemplate.BOOKING_CANCELLED);
        }

        return bookingMapper.toBookingResponse(booking);
    }

    // --- Admin methods ---

    public List<AdminBookingResponse> getAdminBookings(LocalDate dateFrom, LocalDate dateTo,
                                                        UUID hallId, BookingStatus status) {
        if (dateTo == null) dateTo = dateFrom;
        Instant from = dateFrom.atStartOfDay().toInstant(ZoneOffset.UTC);
        Instant to = dateTo.plusDays(1).atStartOfDay().toInstant(ZoneOffset.UTC);

        return bookingRepository.findAdminBookings(from, to, hallId, status).stream()
                .map(bookingMapper::toAdminBookingResponse)
                .toList();
    }

    @Transactional
    public BookingResponse createAdminBooking(AdminCreateBookingRequest request) {
        GameTable table = gameTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));

        Instant startAt = request.getDate().atTime(request.getStartTime()).toInstant(ZoneOffset.UTC);
        Instant endAt = startAt.plus(Duration.ofMinutes(request.getDurationMinutes()));

        List<Booking> conflicts = bookingRepository.findConflicting(table.getId(), startAt, endAt);
        if (!conflicts.isEmpty()) {
            Booking conflict = conflicts.get(0);
            throw new ConflictException("BOOKING_CONFLICT",
                    "Время пересекается с бронированием #" + conflict.getId().toString().substring(0, 8));
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        Game game = resolveAndCheckGameAvailability(request.getGameId(), startAt, endAt);

        Booking booking = Booking.builder()
                .user(user)
                .table(table)
                .game(game)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse forceCreateBooking(AdminCreateBookingRequest request) {
        GameTable table = gameTableRepository.findById(request.getTableId())
                .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));

        Instant startAt = request.getDate().atTime(request.getStartTime()).toInstant(ZoneOffset.UTC);
        Instant endAt = startAt.plus(Duration.ofMinutes(request.getDurationMinutes()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", request.getUserId()));

        Game game = null;
        if (request.getGameId() != null) {
            game = gameRepository.findById(request.getGameId())
                    .orElseThrow(() -> new ResourceNotFoundException("Game", request.getGameId()));
        }

        Booking booking = Booking.builder()
                .user(user)
                .table(table)
                .game(game)
                .startAt(startAt)
                .endAt(endAt)
                .build();

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse updateAdminBooking(UUID id, AdminUpdateBookingRequest request) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        if (request.getTableId() != null) {
            GameTable table = gameTableRepository.findById(request.getTableId())
                    .orElseThrow(() -> new ResourceNotFoundException("Table", request.getTableId()));
            booking.setTable(table);
        }

        if (request.getStartTime() != null && request.getDurationMinutes() != null) {
            LocalDate date = booking.getStartAt().atZone(ZoneOffset.UTC).toLocalDate();
            Instant newStart = date.atTime(request.getStartTime()).toInstant(ZoneOffset.UTC);
            Instant newEnd = newStart.plus(Duration.ofMinutes(request.getDurationMinutes()));

            List<Booking> conflicts = bookingRepository.findConflictingExcluding(
                    booking.getTable().getId(), newStart, newEnd, booking.getId());
            if (!conflicts.isEmpty()) {
                throw new ConflictException("BOOKING_CONFLICT", "Время пересекается с другим бронированием");
            }

            booking.setStartAt(newStart);
            booking.setEndAt(newEnd);
        }

        if (request.getStatus() != null) {
            BookingStatus newStatus = BookingStatus.valueOf(request.getStatus().toUpperCase());
            if (newStatus == BookingStatus.CANCELLED && booking.getStatus() == BookingStatus.ACTIVE) {
                booking.setCancelledAt(Instant.now());
            }
            booking.setStatus(newStatus);
        }

        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    @Transactional
    public BookingResponse adminCancelBooking(UUID id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id));

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        return bookingMapper.toBookingResponse(bookingRepository.save(booking));
    }

    private Game resolveAndCheckGameAvailability(UUID gameId, Instant startAt, Instant endAt) {
        if (gameId == null) {
            return null;
        }

        Game game = gameRepository.findByIdForUpdate(gameId)
                .orElseThrow(() -> new ResourceNotFoundException("Game", gameId));

        if (!game.getIsActive()) {
            throw new BadRequestException("GAME_UNAVAILABLE", "Игра недоступна");
        }

        long activeBookings = bookingRepository.countActiveGameBookings(gameId, startAt, endAt);
        if (activeBookings >= game.getTotalCopies()) {
            throw new ConflictException("GAME_NOT_AVAILABLE",
                    "Все экземпляры игры \"" + game.getTitle() + "\" заняты на выбранное время");
        }

        return game;
    }

    private void validateWorkingHours(LocalDate date, LocalTime startTime, LocalTime endTime) {
        ClubSchedule schedule = clubScheduleRepository.findByDate(date).orElse(null);
        if (schedule == null) {
            throw new BadRequestException("CLUB_CLOSED", "Клуб не работает в указанную дату");
        }
        if (startTime.isBefore(schedule.getOpenTime()) || endTime.isAfter(schedule.getCloseTime())) {
            throw new BadRequestException("OUTSIDE_WORKING_HOURS",
                    "Клуб работает с " + schedule.getOpenTime() + " до " + schedule.getCloseTime() + ".");
        }
    }
}