CREATE TABLE IF NOT EXISTS chatbot_conversations(
    conversation_id int         NOT NULL AUTO_INCREMENT,
    user_id int                 UNSIGNED NOT NULL,
    user_name VARCHAR(255)      NOT NULL,
    title TEXT                  ,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (conversation_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS chatbot_messages(
    message_id int              NOT NULL AUTO_INCREMENT,
    conversation_id int         NOT NULL,
    message TEXT                NOT NULL,
    sender_type VARCHAR(255)    NOT NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (message_id),
    FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations(conversation_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS file_metadata(
    file_id int                 NOT NULL AUTO_INCREMENT,
    doc_name VARCHAR(255)       NOT NULL,
    doc_type VARCHAR(255)       NOT NULL,
    size_KB FLOAT               NOT NULL,
    FAQ_INTERNAL VARCHAR(255)   NOT NULL,
    uploaded_by_id int          UNSIGNED NOT NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (file_id),
    FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS doc_faq_list(
    id int                      NOT NULL AUTO_INCREMENT,
    file_id int                 NOT NULL,
    file_path VARCHAR(255)      NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (file_id) REFERENCES file_metadata(file_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS doc_internal_list(
    id int                      NOT NULL AUTO_INCREMENT,
    file_id int                 NOT NULL,
    file_path VARCHAR(255)      NOT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (file_id) REFERENCES file_metadata(file_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS faq_lists(
    id int                      NOT NULL AUTO_INCREMENT,
    question TEXT               NOT NULL,
    answer TEXT                 NOT NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,
    source_file int             DEFAULT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (source_file) REFERENCES file_metadata(file_id) ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS wati_info(
    id int                      NOT NULL AUTO_INCREMENT,
    api_token TEXT              NOT NULL,
    api_url VARCHAR(255)        NOT NULL,
    vendor_name VARCHAR(255)    NOT NULL,
    updated_by_user_id int      UNSIGNED DEFAULT NULL,
    revoked BOOLEAN             DEFAULT false,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (id),
    FOREIGN KEY (updated_by_user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS added_prompt_training(
    prompt_id int               NOT NULL AUTO_INCREMENT,
    prompt TEXT                 NOT NULL,
    prompted_by_id int          UNSIGNED NOT NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (prompt_id),
    FOREIGN KEY (prompted_by_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS added_crawled_url(
    crawl_id int                NOT NULL AUTO_INCREMENT,
    url TEXT                    NOT NULL,
    crawled_by_id int           UNSIGNED NOT NULL,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at                  DATETIME DEFAULT NULL,

    PRIMARY KEY (crawl_id),
    FOREIGN KEY (crawled_by_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_conversation_id ON chatbot_messages(conversation_id);
CREATE INDEX idx_file_id_doc_faq_list ON doc_faq_list(file_id);
CREATE INDEX idx_file_id_doc_internal_list ON doc_internal_list(file_id);
CREATE INDEX idx_uploaded_by_id ON file_metadata(uploaded_by_id);
CREATE INDEX idx_source_file_faq_lists ON faq_lists(source_file);
CREATE INDEX idx_prompted_by_id ON added_prompt_training(prompted_by_id);
CREATE INDEX idx_crawled_by_id ON added_crawled_url(crawled_by_id);
CREATE INDEX idx_vendor_name ON wati_info(vendor_name);