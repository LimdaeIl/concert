package com.concert.backend.auth.presentation.response;


public record ReissueResponse(
        Long id,
        String accessToken
) {

    public static ReissueResponse of(Long id, String accessToken) {
        return new  ReissueResponse(id, accessToken);
    }
}
