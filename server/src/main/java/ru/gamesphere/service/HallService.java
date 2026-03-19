package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.CreateHallRequest;
import ru.gamesphere.dto.request.UpdateHallRequest;
import ru.gamesphere.dto.response.HallResponse;
import ru.gamesphere.entity.Hall;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.HallMapper;
import ru.gamesphere.repository.HallRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class HallService {

    private final HallRepository hallRepository;
    private final HallMapper hallMapper;

    @Transactional(readOnly = true)
    public List<HallResponse> getAllHalls() {
        return hallRepository.findAll().stream()
                .map(hallMapper::toHallResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public HallResponse getHall(UUID id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", id));
        return hallMapper.toHallResponse(hall);
    }

    @Transactional
    public HallResponse createHall(CreateHallRequest request) {
        Hall hall = Hall.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        return hallMapper.toHallResponse(hallRepository.save(hall));
    }

    @Transactional
    public HallResponse updateHall(UUID id, UpdateHallRequest request) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", id));

        if (request.getName() != null) hall.setName(request.getName());
        if (request.getDescription() != null) hall.setDescription(request.getDescription());
        if (request.getIsActive() != null) hall.setIsActive(request.getIsActive());

        return hallMapper.toHallResponse(hallRepository.save(hall));
    }

    @Transactional
    public void deleteHall(UUID id) {
        Hall hall = hallRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hall", id));
        hall.setIsActive(false);
        hallRepository.save(hall);
    }
}