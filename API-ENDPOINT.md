# Email Quote API Endpoint Documentation

## Overview
The Email Quote feature requires a backend API endpoint to send emails with PDF attachments. This document describes the required endpoint.

## Endpoint

### `POST /api/send-quote`

Sends a quote email with PDF attachment to the user.

### Request Format

**Content-Type:** `multipart/form-data`

**Form Fields:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Recipient's email address |
| `name` | string | Yes | Recipient's name |
| `company` | string | No | Restaurant/Company name |
| `locations` | string | Yes | Number of locations |
| `tier` | string | Yes | Selected tier (e.g., "core-pro") |
| `monthly` | string | Yes | Monthly cost |
| `annual` | string | Yes | Annual cost |
| `modules` | string | Yes | Comma-separated module list |
| `pdf` | File | Yes | PDF file blob (generated client-side) |

### Response Format

**Success (200 OK):**
```json
{
  "success": true,
  "message": "Quote sent successfully"
}
```

**Error (400/500):**
```json
{
  "success": false,
  "error": "Error message"
}
```

## Implementation Examples

### Node.js/Express with Nodemailer

```javascript
const express = require('express');
const multer = require('multer');
const nodemailer = require('nodemailer');

const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/send-quote', upload.single('pdf'), async (req, res) => {
  try {
    const { email, name, company, locations, tier, monthly, annual, modules } = req.body;
    const pdfBuffer = req.file.buffer;
    
    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    
    // Send email
    await transporter.sendMail({
      from: '"Sundae" <quotes@sundae.io>',
      to: email,
      cc: 'sales@sundae.io', // Internal copy
      subject: `Your Sundae Quote - ${locations} Locations`,
      html: `
        <h2>Hi ${name},</h2>
        <p>Thank you for your interest in Sundae! Please find your personalized quote attached.</p>
        
        <h3>Quote Summary:</h3>
        <ul>
          <li><strong>Configuration:</strong> ${tier}</li>
          <li><strong>Locations:</strong> ${locations}</li>
          <li><strong>Monthly Investment:</strong> $${monthly}</li>
          <li><strong>Annual Investment:</strong> $${annual}</li>
          <li><strong>Modules:</strong> ${modules}</li>
        </ul>
        
        <p>Questions? Reply to this email or schedule a demo: <a href="https://sundae.io/demo">Book a Demo</a></p>
        
        <p>Best regards,<br>The Sundae Team</p>
      `,
      attachments: [{
        filename: `Sundae-Quote-${locations}loc.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    
    res.json({ success: true, message: 'Quote sent successfully' });
    
  } catch (error) {
    console.error('Email sending failed:', error);
    res.status(500).json({ success: false, error: 'Failed to send email' });
  }
});
```

### Serverless (Vercel/Netlify Functions)

**File:** `api/send-quote.js`

```javascript
const nodemailer = require('nodemailer');
const formidable = require('formidable');

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const form = formidable({ multiples: false });
  
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ success: false, error: 'Invalid form data' });
    }
    
    try {
      const { email, name, company, locations, tier, monthly } = fields;
      const pdfFile = files.pdf;
      
      // Read PDF file
      const fs = require('fs');
      const pdfBuffer = fs.readFileSync(pdfFile.filepath);
      
      // Configure transporter (use environment variables)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: true,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      
      // Send email
      await transporter.sendMail({
        from: process.env.FROM_EMAIL,
        to: email,
        cc: process.env.SALES_EMAIL,
        subject: `Your Sundae Quote - ${locations} Locations`,
        html: `... (see above for template) ...`,
        attachments: [{
          filename: pdfFile.originalFilename,
          content: pdfBuffer
        }]
      });
      
      res.json({ success: true, message: 'Quote sent successfully' });
      
    } catch (error) {
      console.error('Email error:', error);
      res.status(500).json({ success: false, error: 'Failed to send email' });
    }
  });
}
```

## Environment Variables Required

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=465
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
FROM_EMAIL=quotes@sundae.io
SALES_EMAIL=sales@sundae.io
```

## Email Service Providers

### Recommended Services:

1. **SendGrid**
   - Free tier: 100 emails/day
   - Easy API integration
   - Good deliverability

2. **AWS SES**
   - Very cheap ($0.10 per 1000 emails)
   - Requires domain verification
   - High deliverability

3. **Postmark**
   - Excellent for transactional emails
   - Good support
   - Slightly more expensive

## Testing

### Test with cURL:

```bash
curl -X POST http://localhost:3000/api/send-quote \
  -F "email=test@example.com" \
  -F "name=John Doe" \
  -F "company=Test Restaurant" \
  -F "locations=5" \
  -F "tier=core-pro" \
  -F "monthly=1500" \
  -F "annual=18000" \
  -F "modules=labor,inventory" \
  -F "pdf=@test-quote.pdf"
```

## Security Considerations

1. **Rate Limiting:** Implement rate limiting to prevent abuse
2. **Email Validation:** Validate email format and check for disposable emails
3. **File Size:** Limit PDF size (e.g., 5MB max)
4. **CORS:** Configure CORS properly for your frontend domain
5. **Error Handling:** Don't expose internal errors to clients
6. **Logging:** Log all quote requests for sales follow-up

## Frontend Integration

The frontend is already configured to call `/api/send-quote`. The EmailQuoteButton component handles:
- PDF generation
- FormData creation
- Error handling
- Success feedback

No additional frontend changes needed once the API endpoint is deployed.

## Next Steps

1. Choose an email service provider
2. Set up SMTP credentials
3. Deploy the API endpoint
4. Configure environment variables
5. Test with the frontend
6. Monitor delivery rates

## Support

For questions about the frontend implementation, see:
- `src/components/Summary/EmailQuoteButton.tsx` - UI component
- `src/lib/pdfGenerator.ts` - PDF generation logic
