package ru.gamesphere.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.gamesphere.dto.request.UpdateProfileRequest;
import ru.gamesphere.dto.response.UserResponse;
import ru.gamesphere.entity.User;
import ru.gamesphere.exception.ResourceNotFoundException;
import ru.gamesphere.mapper.UserMapper;
import ru.gamesphere.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserResponse getCurrentUser(String email) {
        User user = findByEmail(email);
        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findByEmail(email);
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    private User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", email));
    }
}