package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.CreateScheduleRequest;
import ru.gamesphere.dto.response.ScheduleResponse;
import ru.gamesphere.entity.ClubSchedule;
import ru.gamesphere.mapper.ScheduleMapper;
import ru.gamesphere.repository.ClubScheduleRepository;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ScheduleService {

    private final ClubScheduleRepository clubScheduleRepository;
    private final ScheduleMapper scheduleMapper;

    public List<ScheduleResponse> getSchedule(LocalDate from, LocalDate to) {
        if (to == null) to = from.plusDays(7);
        return clubScheduleRepository.findAllByDateBetween(from, to).stream()
                .map(scheduleMapper::toScheduleResponse)
                .toList();
    }

    @Transactional
    public ScheduleResponse upsertSchedule(LocalDate date, CreateScheduleRequest request) {
        ClubSchedule schedule = clubScheduleRepository.findByDate(date)
                .orElse(ClubSchedule.builder().date(date).build());

        schedule.setOpenTime(request.getOpenTime());
        schedule.setCloseTime(request.getCloseTime());
        schedule.setNote(request.getNote());

        return scheduleMapper.toScheduleResponse(clubScheduleRepository.save(schedule));
    }
}