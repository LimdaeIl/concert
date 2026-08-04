package com.concert.backend.auth.infrastructure.mail;

import com.concert.backend.auth.exception.AuthErrorCode;
import com.concert.backend.auth.exception.AuthException;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

@Component
@RequiredArgsConstructor
public class EmailVerificationMailSender {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final MailProperties mailProperties;

    public void send(String recipient, String verificationCode) {
        MimeMessage mimeMessage = mailSender.createMimeMessage();

        try {
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");

            helper.setFrom(mailProperties.sender());
            helper.setTo(recipient);
            helper.setSubject("[Concert] 이메일 인증");

            Context context = new Context();
            context.setVariable("verificationCode", verificationCode);
            context.setVariable("expireMinutes", 5);

            String html = templateEngine.process("mail/email-verification", context);
            helper.setText(html, true);

            mailSender.send(mimeMessage);

        } catch (MessagingException | MailException exception) {
            throw new AuthException(AuthErrorCode.EMAIL_SEND_FAILED, exception);
        }
    }
}
