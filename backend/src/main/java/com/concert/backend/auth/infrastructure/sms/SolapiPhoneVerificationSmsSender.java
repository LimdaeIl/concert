package com.concert.backend.auth.infrastructure.sms;

import com.concert.backend.auth.domain.PhoneVerificationSmsSender;
import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import com.solapi.sdk.message.model.Message;
import com.solapi.sdk.message.service.DefaultMessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class SolapiPhoneVerificationSmsSender implements PhoneVerificationSmsSender {

    private final DefaultMessageService messageService;
    private final SolapiProperties properties;

    @Override
    public void send(String phone, String verificationCode) {
        Message message = new Message();
        message.setFrom(properties.sender());
        message.setTo(phone);
        message.setText("[Concert] 휴대전화 인증번호는 [%s]입니다. 3분 이내에 입력해주세요.".formatted(verificationCode));

        try {
            messageService.send(message, null);
        } catch (Exception exception) {
            log.error(
                    "SOLAPI 휴대전화 인증번호 발송에 실패했습니다. phone={}, exceptionType={}",
                    maskPhone(phone),
                    exception.getClass().getSimpleName(),
                    exception
            );

            throw new AuthException(AuthErrorCode.PHONE_SEND_FAILED, exception);
        }
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 7) {
            return "***";
        }

        return phone.substring(0, 3)
                + "****"
                + phone.substring(phone.length() - 4);
    }
}
