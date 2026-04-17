package com.parking_reservation.security;

import com.parking_reservation.entity.Role;
import com.parking_reservation.entity.RoleType;
import com.parking_reservation.entity.User;
import com.parking_reservation.repository.RoleRepository;
import com.parking_reservation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        return processOAuthUser(oAuth2User);
    }

    private OAuth2User processOAuthUser(OAuth2User oAuth2User) {
        Map<String, Object> attrs = oAuth2User.getAttributes();

        String googleId = (String) attrs.get("sub");
        String email    = (String) attrs.get("email");
        String name     = (String) attrs.get("name");
        String picture  = (String) attrs.get("picture");

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setGoogleId(googleId);
            newUser.setEmail(email);
            newUser.setName(name);
            newUser.setProfilePic(picture);

            // Assign default USER role
            Role userRole = roleRepository.findByName(RoleType.USER)
                    .orElseGet(() -> roleRepository.save(new Role(RoleType.USER)));
            newUser.getRoles().add(userRole);

            return userRepository.save(newUser);
        });

        // Update profile info if changed
        user.setName(name);
        user.setProfilePic(picture);
        userRepository.save(user);

        return new UserPrincipal(user, oAuth2User.getAttributes());
    }
}
