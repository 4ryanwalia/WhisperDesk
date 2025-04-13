package com.whisperDesk.WhisperDesk;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    public JavaMailSender getMailSender() {
        return mailSender;
    }
    public void setMailSender(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    @Autowired
    private JavaMailSender mailSender;
    public void sendComplaintNotification(String toEmail, String subject, String message) {
        try {
            if (toEmail == null || toEmail.isEmpty()) {
                logger.warn("Attempted to send email to null or empty address");
                return;
            }
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(toEmail);
            mail.setSubject(subject);
            mail.setText(message);
            logger.info("Sending email to: {}, Subject: {}", toEmail, subject);
            mailSender.send(mail);
            logger.info("Email sent successfully to: {}", toEmail);
        } catch (Exception e) {
            logger.error("Failed to send email to: {}, Error: {}", toEmail, e.getMessage());
            // You can add additional error handling here if needed
        }
    }
}