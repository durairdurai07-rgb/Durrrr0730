import logging
import smtplib
from email.message import EmailMessage
from app.config.settings import settings

log = logging.getLogger("myday.email")


def send_email(to: str, subject: str, body: str) -> None:
    """Pluggable backend. Credentials come only from environment variables."""
    if settings.email_backend == "smtp":
        msg = EmailMessage()
        msg["From"], msg["To"], msg["Subject"] = settings.email_from, to, subject
        msg.set_content(body)
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as s:
            s.starttls()
            if settings.smtp_user:
                s.login(settings.smtp_user, settings.smtp_password)
            s.send_message(msg)
    else:
        log.warning("EMAIL (console backend, not sent) to=%s subject=%s\n%s", to, subject, body)
