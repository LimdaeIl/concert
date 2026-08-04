package com.concert.backend.member.presentation;

import com.concert.backend.member.application.SignUpService;
import com.concert.backend.member.application.result.SignUpResult;
import com.concert.backend.member.presentation.request.SignUpRequest;
import com.concert.backend.member.presentation.response.SignUpResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RequiredArgsConstructor
@RequestMapping("/api/v1/members")
@RestController
public class MemberController {

    private final SignUpService signUpService;

    @PostMapping("/sign-up")
    public ResponseEntity<SignUpResponse> signUp(
            @RequestBody @Valid SignUpRequest request
    ) {
        SignUpResult result = signUpService.signUp(request.toCommand());
        SignUpResponse response = SignUpResponse.from(result);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
