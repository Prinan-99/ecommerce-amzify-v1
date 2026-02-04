```mermaid
erDiagram
    users {
        string id PK
    }

    products {
        string id PK
    }

    users ||--o{ products : sells
```
