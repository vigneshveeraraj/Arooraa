# Lead capture and WhatsApp onboarding

The consultation form on the Tamil campaign page (`CampaignLeadForm`, locale `ta`) asks for three
things only: what the visitor needs, an Indian mobile number, and explicit consent to be contacted
about this enquiry. No name, email or budget. No package price appears anywhere: on the page, in
the form, or in any WhatsApp message.

The form component and copy (`src/lib/lead-capture/`) support `en` as well, for use on the English
site later. They are not mounted there yet.

## How it behaves

1. The visitor picks a requirement. Only then do the phone field, the consent checkbox (unticked)
   and the **Get a Free Consultation** button appear.
2. On submit the lead is POSTed to the backend **before** WhatsApp is offered. Success is shown
   only for a real 200/201 from the backend.
3. After it is saved, the visitor sees the backend's opaque `leadReference` and a
   **Continue on WhatsApp** link. The prefilled message contains the requirement and that reference,
   **never the phone number**. wa.me only opens the chat; the visitor has to press send.
4. If saving fails, the form says the details **have not been saved** and offers a direct WhatsApp
   link (no reference) and a call link.

### Production blocker: no backend endpoint yet

The existing public endpoints cannot take this lead without inventing data:
`POST /api/v1/project-enquiries` and `POST /api/v1/contact/messages` both require a name and an
email, and `POST /api/v1/demo-requests` requires restaurant details. This is a static export, so
there is no server-side route in this app that could store it either.

So the form stays switched off until the backend ships the endpoint below
(`NEXT_PUBLIC_LEAD_CAPTURE_ENABLED` is unset). While it is off, the form never asks for a phone
number. After the requirement is picked, it says online requests are not available and links to
WhatsApp (with the requirement prefilled) and the phone line. Nothing is sent and nothing is
described as saved.

To switch it on: deploy the endpoint, then build with `NEXT_PUBLIC_LEAD_CAPTURE_ENABLED=true`. The
existing `/api/leads/` Nginx proxy already maps `/api/leads/lead-captures` to
`/api/v1/lead-captures`, so no proxy change is needed.

### Proposed contract: `POST /api/v1/lead-captures`

Follow the existing lead modules (`contact`, `project`): Flyway migration, `Idempotency-Key`
header with a request fingerprint (same key with a different body returns 409), per-IP rate limit
(returns 429), honeypot `@MustBeBlank website`, and admin visibility through the existing lead
admin.

```json
{
  "requirement": "WEBSITE | CUSTOMER_ENQUIRIES | AI_AUTOMATION | MARKETING_LEADS | BUSINESS_APPLICATION | NOT_SURE",
  "phone": "+919876543210",          // @ValidIndianMobile, store normalised
  "countryCode": "IN",
  "consent": true,                    // must be true; store with timestamp
  "consentText": "…exact sentence shown…",
  "sourceLocale": "en | ta",
  "source": "WEBSITE",
  "sourcePage": "/…", "referrer": "…",
  "utmSource": "…", "utmMedium": "…", "utmCampaign": "…", "utmContent": "…",
  "website": ""
}
```

Response `201 { "leadReference": "LC-7Q2M9X" }`. The reference must be **opaque**: random, not
sequential, and not derived from the phone number. It is the only identifier that ever appears in a
WhatsApp URL. Also store `preferredLanguage` (null at creation). The WhatsApp conversation sets it.

## WhatsApp conversation (scaffolding only, blocked)

Click-to-chat cannot reply by itself. An automated first response needs the **WhatsApp Business
Cloud API**: a Meta Business account, a verified business, the AROORAA number registered to Cloud
API, a permanent access token, a webhook endpoint with signature verification (app secret), and
approved message templates for any message sent outside the 24-hour customer-service window. None of
this exists in the backend today and no credentials are available. **No bot is live, and nothing on
the site claims there is one.**

When it is set up, the webhook should run this script. Rules: one question per message, short,
bilingual until the language is chosen, never a price. When a message contains a reference, match
it to the saved lead. Otherwise create one with consent recorded from the conversation.

1. **Language first** (always, whatever `sourceLocale` says. `sourceLocale` only picks which line
   comes first):
   > Welcome to AROORAA! Which language do you prefer? Reply 1 for English, 2 for தமிழ்.
   > AROORAA-க்கு வரவேற்கிறோம்! எந்த மொழியில் பேசலாம்? English-க்கு 1, தமிழுக்கு 2 அனுப்புங்கள்.

   Save the answer as `preferredLanguage`. **The customer's choice overrides `sourceLocale` for
   the rest of the conversation and for the team's follow-up.**
2. **Requirement**, only if the lead doesn't already have one:
   EN: "What would you like help with? 1 Website · 2 Customer enquiries & WhatsApp · 3 AI & automation · 4 Marketing & leads · 5 Business application · 6 Not sure yet"
   TA: "உங்களுக்கு என்ன தேவை? 1 Website · 2 Customer enquiries & WhatsApp · 3 AI & Automation · 4 Marketing & Leads · 5 Business Application · 6 இன்னும் தெரியவில்லை"
3. **Business type**:
   EN: "What kind of business do you run?" / TA: "உங்கள் business என்ன வகை?"
4. **Best time to call**:
   EN: "When is a good time for our team to call you? Morning, afternoon or evening?"
   TA: "எங்கள் team உங்களை எப்போது அழைக்கலாம்? காலை, மதியம் அல்லது மாலை?"
5. **Close**:
   EN: "Thank you! Our team will call you at that time to understand your needs."
   TA: "நன்றி! அந்த நேரத்தில் எங்கள் team உங்களை அழைத்து உங்கள் தேவைகளை புரிந்துகொள்ளும்."

If the customer asks about price: EN "Pricing depends on what you need, so our team will share it
after understanding your requirement." / TA "உங்கள் தேவையைப் பொறுத்து கட்டணம் மாறும் — உங்கள்
requirement-ஐ புரிந்துகொண்ட பிறகு எங்கள் team விவரங்களை பகிரும்." Any other free text, or "stop" /
"agent", hands the chat to a person.
