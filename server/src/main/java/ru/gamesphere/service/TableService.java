package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.CreateTableRequest;
import ru.gamesphere.dto.response.TableResponse;
import ru.gamesphere.entity.GameTable;
import ru.gamesphere.entity.Hall;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.HallMapper;
import ru.gamesphere.repository.GameTableRepository;
import ru.gamesphere.repository.HallRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TableService {

    private final GameTableRepository gameTableRepository;
    private final HallRepository hallRepository;
    private final HallMapper hallMapper;

    public List<TableResponse> getTablesByHall(UUID hallId) {
        return gameTableRepository.findAllByHallId(hallId).stream()
                .map(hallMapper::toTableResponse)
                .toList();
    }

    @Transactional
    public TableResponse createTable(UUID hallId, CreateTableRequest request) {
        Hall hall = hallRepository.findById(hallId)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", hallId));

        GameTable table = GameTable.builder()
                .hall(hall)
                .label(request.getLabel())
                .seats(request.getSeats())
                .build();
        return hallMapper.toTableResponse(gameTableRepository.save(table));
    }

    @Transactional
    public TableResponse updateTable(UUID id, CreateTableRequest request) {
        GameTable table = gameTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));

        if (request.getLabel() != null) table.setLabel(request.getLabel());
        if (request.getSeats() != null) table.setSeats(request.getSeats());

        return hallMapper.toTableResponse(gameTableRepository.save(table));
    }

    @Transactional
    public void deleteTable(UUID id) {
        GameTable table = gameTableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Table", id));
        table.setIsActive(false);
        gameTableRepository.save(table);
    }
}