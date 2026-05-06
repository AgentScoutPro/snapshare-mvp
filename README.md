# SnapShare

SnapShare is a mobile-first business card scanning, contact capture, CRM sync,
and follow-up app prototype.

## Product direction

SnapShare is a premium, fast, camera-first sales utility. The MVP north-star
flow is:

```text
Scan -> Confirm -> Save -> Sync -> Follow up -> Done
```

Anything outside that flow should wait until the core capture, accuracy, CRM
sync, consent, and recovery experience is dependable.

## Run the app

```bash
npm install
npm run dev
```

## Convex database

The Convex backend lives in `convex/`:

- `schema.ts` defines `contacts`, `syncEvents`, and `followUps`.
- It also includes early `scanSessions` and `exportJobs` tables for OCR status,
  front/back capture, dedupe state, export, backup, and retry workflows.
- `contacts.ts` creates a contact from a scan and queues CRM/follow-up records.
- `followUps.ts` lists and queues follow-up messages.

To connect a real Convex deployment:

```bash
npx convex dev
```

That command creates the Convex project configuration and generated API files.
After that, the frontend can replace the current local demo persistence with
Convex `useQuery` and `useMutation` calls.

## Next integration points

- Camera capture: connect the scan screen to device camera APIs.
- OCR: send captured card images to an OCR/contact extraction service.
- Contacts: use native contacts APIs in the mobile shell.
- CRM: add a server-side GoHighLevel sync action from Convex.
- Follow-up: add SMS/email provider actions from Convex.

## OCR and CRM API

Server-side OCR/CRM modules live under `src/server/`.

Key files:

- `src/server/ocr/providers/veryfi.ts` implements the first OCR provider.
- `src/server/ocr/normalization/normalizeBusinessCard.ts` maps OCR responses
  into the internal SnapShare contact schema.
- `src/server/ocr/normalization/validators.ts` normalizes email, URL, phone,
  and address data before saving or syncing.
- `src/server/crm/gohighlevel.ts` maps SnapShare contacts into
  GoHighLevel-ready contact upsert and workflow enrollment payloads.
- `src/server/api/businessCardEndpoint.ts` exposes the review-ready OCR
  handler used by `POST /ocr/business-card`.

Create `.env` from `.env.example`, then run:

```bash
npm run api:dev
```

Example OCR request:

```bash
curl -X POST http://localhost:8787/ocr/business-card \
  -H "Content-Type: application/json" \
  -d '{
    "imageBase64": "BASE64_CARD_IMAGE",
    "mimeType": "image/jpeg"
  }'
```

The OCR endpoint accepts `imageBase64`, `imageDataUrl`, or `imageUrl`. It always
returns a review-state payload and does not create a GoHighLevel contact.

Sample mobile review response:

```json
{
  "state": "review_required",
  "contact": {
    "fullName": "Maya Chen",
    "firstName": "Maya",
    "lastName": "Chen",
    "company": "Brightline Studio",
    "jobTitle": "Partnerships Lead",
    "email": "maya@brightline.studio",
    "mobilePhone": "+16025550184",
    "officePhone": "+16025550185",
    "website": "https://brightline.studio",
    "address1": "44 E Monroe St",
    "city": "Phoenix",
    "state": "AZ",
    "postalCode": "85004",
    "country": "US",
    "notes": "",
    "source": "SnapShare",
    "confidence": {
      "fullName": 0.97,
      "company": 0.95,
      "jobTitle": 0.93,
      "email": 0.98,
      "mobilePhone": 0.86,
      "officePhone": 0.86,
      "website": 0.91,
      "address1": 0.72
    },
    "lowConfidenceFields": ["mobilePhone", "address1"]
  },
  "review": {
    "provider": "veryfi",
    "needsManualReview": true,
    "lowConfidenceFields": ["mobilePhone", "address1"],
    "requiredFieldsMissing": [],
    "warnings": []
  },
  "source": {
    "provider": "veryfi",
    "input": "business-card-image"
  }
}
```

Example CRM sync request:

```bash
curl -X POST http://localhost:8787/crm/contacts/upsert \
  -H "Content-Type: application/json" \
  -d '{
    "contact": { "fullName": "Maya Chen", "firstName": "Maya", "lastName": "Chen", "company": "Brightline Studio", "jobTitle": "Partnerships Lead", "email": "maya@brightline.studio", "mobilePhone": "+16025550184", "officePhone": "", "website": "https://brightline.studio", "address1": "", "city": "", "state": "", "postalCode": "", "country": "", "notes": "", "source": "SnapShare", "confidence": {}, "lowConfidenceFields": [] },
    "tags": ["event"],
    "enrollWorkflow": true
  }'
```

The GoHighLevel layer uses `POST /contacts/upsert` with `source:
"SnapShare"` and tags including `business-card-scan`. HighLevel duplicate
settings use email/phone for duplicate-safe upsert behavior, so SnapShare sends
both whenever available.

Use `prepareGoHighLevelSyncPayload(contact, options)` when the mobile app has
confirmed or edited the review payload and you need a pure, testable
GoHighLevel upsert payload plus optional workflow intent before making the
server-side sync call.

Important flow rule: `POST /ocr/business-card` never creates or updates a
GoHighLevel contact. It returns `state: "review_required"` so the mobile app can
show editable fields and low-confidence warnings first. The app should call
`POST /crm/contacts/upsert` only after the user confirms or edits the review
payload.

Veryfi credentials stay server-side only. The OCR request uses
`confidence_details: true` for field scoring and `auto_delete: true` so raw
card images are not retained longer than necessary by the OCR provider.
