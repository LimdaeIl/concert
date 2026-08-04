package com.concert.backend.auth.application.result;

public record ReissueTokenResult(
        Long id,
        String accessToken,
        String refreshToken,
        long remainingSecondByRefreshToken
) {

    public static ReissueTokenResult of(Long id, String newAccessToken,
            String newRefreshToken, long remainingSecondByRefreshToken) {
        return new ReissueTokenResult(id, newAccessToken, newRefreshToken,
                remainingSecondByRefreshToken);
    }
}
