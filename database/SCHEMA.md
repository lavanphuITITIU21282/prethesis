# Quan hệ database

Các entity tương ứng bảng trong schema ở README. Quan hệ content dùng khóa ghép `course_id, content_version, id`; quan hệ grade/attempt còn có `user_id` để ngăn gắn điểm vào phiên của tài khoản khác.

```mermaid
erDiagram
    USERS ||--o{ EXTERNAL_IDENTITIES : identifies
    USERS ||--o| PASSWORD_CREDENTIALS : authenticates
    USERS ||--o{ SESSIONS : opens
    USERS ||--o{ USER_PROGRESS : owns
    USERS ||--o{ ATTEMPTS : owns
    USERS ||--o{ REVIEW_SCHEDULES : owns
    COURSES ||--o{ RELEASES : versions
    RELEASES ||--o{ CHAPTERS : contains
    CHAPTERS ||--o{ LESSONS : contains
    LESSONS ||--o{ SECTIONS : contains
    LESSONS ||--o{ CONCEPTS : teaches
    LESSONS ||--o{ COMMANDS : explains
    LESSONS ||--o{ QUESTIONS : assesses
    RELEASES ||--o{ USER_PROGRESS : pins
    RELEASES ||--o{ ATTEMPTS : pins
    ATTEMPTS ||--o{ GRADES : receives
    QUESTIONS ||--o{ GRADES : evaluates
    CONCEPTS ||--o{ REVIEW_SCHEDULES : schedules

    USERS {
        uuid id PK
        text display_name
        timestamptz created_at
        timestamptz disabled_at
    }
    PASSWORD_CREDENTIALS {
        uuid user_id PK,FK
        text username UK
        text password_hash
    }
    SESSIONS {
        text token_hash PK
        uuid user_id FK
        timestamptz expires_at
    }
    AUTH_LIMITS {
        text key PK
        int hits
        timestamptz expires_at
    }
    RELEASES {
        text course_id PK,FK
        int version PK
        text checksum
    }
    USER_PROGRESS {
        uuid user_id PK,FK
        text course_id PK,FK
        int content_version FK
        bigint revision
        jsonb state
        timestamptz updated_at
    }
    ATTEMPTS {
        uuid user_id PK,FK
        uuid id PK
        text course_id FK
        int content_version FK
        text status
        jsonb session
    }
    GRADES {
        uuid user_id PK,FK
        uuid id PK
        uuid attempt_id FK
        text question_id FK
        text method
        numeric score
        jsonb feedback
    }
    REVIEW_SCHEDULES {
        uuid user_id PK,FK
        text course_id PK,FK
        int content_version PK,FK
        text concept_id PK,FK
        timestamptz due_at
    }
```

`app_meta.schema_migrations` độc lập với nghiệp vụ, ghi tên migration, SHA-256 và thời gian áp dụng. Sáu bảng nghiệp vụ riêng và ba bảng xác thực dùng RLS; runtime chỉ gọi các hàm xác thực giới hạn, không sửa trực tiếp identity hoặc content.

Tiến độ v1 lưu dưới dạng aggregate để bảo toàn bản sao cũ. Bảng attempts/grades/review_schedules đã có ràng buộc nhưng chưa có API/UI ghi riêng. Đã có auth/session local; xem docs/AUTHENTICATION.md. Credential database và SQL context không thay thế danh tính người dùng.
