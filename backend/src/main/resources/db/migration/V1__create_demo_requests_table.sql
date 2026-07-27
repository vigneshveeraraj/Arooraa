CREATE TABLE demo_requests (
    id                          UUID PRIMARY KEY,
    contact_name                VARCHAR(100) NOT NULL,
    restaurant_name             VARCHAR(150) NOT NULL,
    normalized_whatsapp_number  VARCHAR(20) NOT NULL,
    business_email              VARCHAR(254),
    city                        VARCHAR(100) NOT NULL,
    outlet_count                VARCHAR(20) NOT NULL,
    restaurant_type             VARCHAR(30) NOT NULL,
    primary_challenge           VARCHAR(30) NOT NULL,
    current_software            VARCHAR(150),
    preferred_demo_date         DATE,
    preferred_demo_time         VARCHAR(50),
    additional_message          VARCHAR(2000),
    source_page                 VARCHAR(500),
    status                      VARCHAR(20) NOT NULL DEFAULT 'NEW',
    ip_hash                     VARCHAR(64) NOT NULL,
    user_agent                  VARCHAR(500),
    referrer                    VARCHAR(1000),
    utm_source                  VARCHAR(200),
    utm_medium                  VARCHAR(200),
    utm_campaign                VARCHAR(200),
    notification_status         VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_demo_requests_created_at ON demo_requests (created_at);
CREATE INDEX idx_demo_requests_status ON demo_requests (status);
CREATE INDEX idx_demo_requests_normalized_whatsapp_number ON demo_requests (normalized_whatsapp_number);
CREATE INDEX idx_demo_requests_notification_status ON demo_requests (notification_status);
