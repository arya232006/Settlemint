from celery import Celery
from app.config import settings
import ssl

# Handle SSL for Upstash/Cloud Redis (rediss://)
broker_use_ssl = None
if settings.REDIS_URL.startswith("rediss://"):
    broker_use_ssl = {"ssl_cert_reqs": ssl.CERT_NONE}

celery_app = Celery("worker", broker=settings.REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    broker_use_ssl=broker_use_ssl,
)
