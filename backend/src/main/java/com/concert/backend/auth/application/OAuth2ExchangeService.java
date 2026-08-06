package com.concert.backend.auth.application;

import com.concert.backend.auth.application.result.SignInResult;
import com.concert.backend.auth.domain.OAuth2TicketPayload;
import com.concert.backend.auth.domain.OAuth2TicketRepository;
import com.concert.backend.auth.domain.OAuth2TicketType;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.concert.backend.auth.infrastructure.jwt.JWTHashUtil;
import com.concert.backend.member.domain.Member;
import com.concert.backend.member.domain.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class OAuth2ExchangeService {

    private final OAuth2TicketRepository ticketRepository;
    private final JWTHashUtil jwtHashUtil;

    private final MemberRepository memberRepository;
    private final TokenIssueService tokenIssueService;

    @Transactional(readOnly = true)
    public SignInResult exchange(String rawCode) {
        String codeHash = hashCode(rawCode);

        OAuth2TicketPayload ticketPayload =
                findLoginTicket(codeHash);

        validateLoginTicket(ticketPayload);

        Member member = findMember(ticketPayload.memberId());

        validateMember(member);

        /*
         * 조회와 모든 검증이 끝난 다음 티켓을 소비한다.
         *
         * 동일 코드를 두 요청이 동시에 사용하면
         * Redis delete에 성공한 요청 하나만 토큰을 발급받는다.
         */
        consumeLoginTicket(codeHash);

        return tokenIssueService.issue(member);
    }

    private String hashCode(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_LOGIN_CODE_REQUIRED
            );
        }

        return jwtHashUtil.sha256(rawCode);
    }

    private OAuth2TicketPayload findLoginTicket(
            String codeHash
    ) {
        return ticketRepository.find(codeHash)
                .orElseThrow(() ->
                        new AuthException(
                                AuthErrorCode.OAUTH2_LOGIN_CODE_INVALID
                        )
                );
    }

    private void validateLoginTicket(
            OAuth2TicketPayload payload
    ) {
        if (payload.type() != OAuth2TicketType.LOGIN) {
            throw new AuthException(
                    AuthErrorCode.INVALID_OAUTH2_LOGIN_TICKET_TYPE
            );
        }

        if (payload.memberId() == null) {
            throw new AuthException(
                    AuthErrorCode.OAUTH2_LOGIN_CODE_INVALID
            );
        }

        /*
         * LOGIN 티켓에는 소셜 가입용 정보가 필요하지 않다.
         * provider, providerUserId, email, name은 null이어도 정상이다.
         */
    }

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() ->
                        new AuthException(
                                AuthErrorCode.OAUTH2_LOGIN_CODE_INVALID
                        )
                );
    }

    private void validateMember(Member member) {
        if (!member.isSignInAllowed()) {
            /*
             * 회원 존재 여부나 상태를 외부에 구체적으로 노출하지 않는다.
             */
            throw new AuthException(
                    AuthErrorCode.OAUTH2_LOGIN_CODE_INVALID
            );
        }
    }

    private void consumeLoginTicket(String codeHash) {
        boolean consumed = ticketRepository.consume(codeHash);

        if (!consumed) {
            /*
             * 만료 또는 다른 요청이 먼저 소비한 경우다.
             */
            throw new AuthException(
                    AuthErrorCode.OAUTH2_LOGIN_CODE_INVALID
            );
        }
    }
}
