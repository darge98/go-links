-- Create golink table
CREATE TABLE golink (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    target_url VARCHAR(2000) NOT NULL,
    description VARCHAR(255),
    tags VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    lock_uuid UUID NOT NULL
);

-- Create event table
CREATE TABLE event (
    id UUID PRIMARY KEY,
    golink_id UUID NOT NULL REFERENCES golink(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    referrer TEXT
);

-- Create indices
CREATE UNIQUE INDEX idx_golink_name ON golink(name);
CREATE INDEX idx_event_golink_id_created_at ON event(golink_id, created_at);
