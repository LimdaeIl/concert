package com.concert.backend.auth.infrastructure.oauth;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

public record OAuth2AuthorizationRequestPayload(
        String authorizationUri,
        String authorizationGrantType,
        String responseType,
        String clientId,
        String redirectUri,
        Set<String> scopes,
        String state,
        Map<String, Object> additionalParameters,
        Map<String, Object> attributes,
        String authorizationRequestUri
) {

    public static OAuth2AuthorizationRequestPayload from(
            OAuth2AuthorizationRequest request
    ) {
        return new OAuth2AuthorizationRequestPayload(
                request.getAuthorizationUri(),
                request.getGrantType().getValue(),
                request.getResponseType().getValue(),
                request.getClientId(),
                request.getRedirectUri(),
                Set.copyOf(request.getScopes()),
                request.getState(),
                copyMap(request.getAdditionalParameters()),
                copyMap(request.getAttributes()),
                request.getAuthorizationRequestUri()
        );
    }

    public OAuth2AuthorizationRequest toAuthorizationRequest() {
        OAuth2AuthorizationRequest.Builder builder =
                OAuth2AuthorizationRequest.authorizationCode()
                        .authorizationUri(authorizationUri)
                        .clientId(clientId)
                        .redirectUri(redirectUri)
                        .scopes(scopes)
                        .state(state)
                        .additionalParameters(parameters ->
                                parameters.putAll(additionalParameters)
                        )
                        .attributes(values ->
                                values.putAll(attributes)
                        );

        /*
         * Spring이 최초에 생성한 URI를 그대로 복원한다.
         * 이 값에는 state, scope, redirect_uri 및 PKCE challenge 등이
         * 포함될 수 있다.
         */
        if (authorizationRequestUri != null
                && !authorizationRequestUri.isBlank()) {
            builder.authorizationRequestUri(authorizationRequestUri);
        }

        return builder.build();
    }

    private static Map<String, Object> copyMap(Map<String, Object> source) {
        if (source == null || source.isEmpty()) {
            return Collections.emptyMap();
        }

        return Collections.unmodifiableMap(new LinkedHashMap<>(source));
    }
}
