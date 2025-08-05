# Case Creation Schemas

This document describes validation schemas and payload shapes for each step in the case creation flow.

## Hearing Details
- **File:** `src/features/cases/initiate-hearing/steps/01-hearing-details/schema.ts`
- **Schema:** `hearingDetailsSchema`
- **Fields:**
  - `claimantStatus` – `'self' | 'representative'`
  - `claimantName` – required string
  - `representativeName` – required when `claimantStatus` is `'representative'`
  - `relationship` – optional string
- **API Payload:**
  ```json
  {
    "claimantStatus": "self",
    "claimantName": "John Doe",
    "representativeName": null,
    "relationship": null
  }
  ```

## Add Attachments
- **File:** `src/features/cases/initiate-hearing/steps/add-attachments/schema.ts`
- **Schema:** `attachmentSchema`
- **Fields:**
  - `attachments` – array of files containing `file`, `base64`, `fileName`, and `fileType`
- **API Payload:**
  ```json
  {
    "attachments": [
      {
        "fileName": "document.pdf",
        "fileType": "application/pdf",
        "base64": "<BASE64>"
      }
    ]
  }
  ```

## Hearing Topics
- **File:** `src/features/cases/initiate-hearing/steps/hearing-topics/schema.ts`
- **Schema:** `topicSchema`
- **Fields:**
  - `mainCategory` – option object `{ value, label }`
  - `subCategory` – option object `{ value, label }`
  - `acknowledged` – boolean flag
- **API Payload:**
  ```json
  {
    "mainCategory": { "value": "WR", "label": "Worker Rights" },
    "subCategory": { "value": "WR-1", "label": "Salary Payment" },
    "acknowledged": true
  }
  ```

## Review
- **File:** `src/features/cases/initiate-hearing/steps/review/schema.ts`
- **Schema:** `reviewSchema`
- **Fields:**
  - `acknowledgements` – array of acknowledgement keys
  - `language` – selected language code
- **API Payload:**
  ```json
  {
    "acknowledgements": ["ACK1", "ACK2"],
    "language": "EN"
  }
  ```
