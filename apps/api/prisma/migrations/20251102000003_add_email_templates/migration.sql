-- CreateTable
CREATE TABLE "email_templates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "body_text" TEXT NOT NULL,
    "variables" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "email_templates_tenant_id_idx" ON "email_templates"("tenant_id");

-- CreateIndex
CREATE INDEX "email_templates_name_idx" ON "email_templates"("name");

-- CreateIndex
CREATE INDEX "email_templates_is_active_idx" ON "email_templates"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "email_templates_tenant_id_name_key" ON "email_templates"("tenant_id", "name");

-- AddForeignKey
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert default email templates
INSERT INTO "email_templates" ("tenant_id", "name", "subject", "body_html", "body_text", "variables", "is_active")
SELECT
    t.id,
    'QUOTATION_SENT',
    'Your Tour Quotation - {{quotationId}}',
    '<html>
    <body>
        <h2>Dear {{clientName}},</h2>
        <p>Thank you for your interest in our tour services!</p>
        <p>Please find attached your personalized tour quotation for {{tourName}}.</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="background-color: #f2f2f2;">
                <th style="padding: 12px; text-align: left; border: 1px solid #ddd;">Description</th>
                <th style="padding: 12px; text-align: right; border: 1px solid #ddd;">Amount</th>
            </tr>
            <tr>
                <td style="padding: 12px; border: 1px solid #ddd;">Total Price</td>
                <td style="padding: 12px; text-align: right; border: 1px solid #ddd;">€{{totalPrice}}</td>
            </tr>
        </table>
        <p>This quotation is valid until {{validUntil}}.</p>
        <p>If you have any questions, please don''t hesitate to contact us.</p>
        <p>Best regards,<br>Your Tour Team</p>
    </body>
    </html>',
    'Dear {{clientName}},

Thank you for your interest in our tour services!

Please find your personalized tour quotation for {{tourName}}.

Total Price: €{{totalPrice}}

This quotation is valid until {{validUntil}}.

If you have any questions, please don''t hesitate to contact us.

Best regards,
Your Tour Team',
    ARRAY['clientName', 'quotationId', 'tourName', 'totalPrice', 'validUntil'],
    true
FROM tenants t;

INSERT INTO "email_templates" ("tenant_id", "name", "subject", "body_html", "body_text", "variables", "is_active")
SELECT
    t.id,
    'BOOKING_CONFIRMED',
    'Booking Confirmation - {{bookingCode}}',
    '<html>
    <body>
        <h2>Booking Confirmed!</h2>
        <p>Dear {{clientName}},</p>
        <p>Your booking has been confirmed. Here are your booking details:</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px;"><strong>Booking Code:</strong></td><td style="padding: 8px;">{{bookingCode}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Tour Start Date:</strong></td><td style="padding: 8px;">{{startDate}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Tour End Date:</strong></td><td style="padding: 8px;">{{endDate}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Total Amount:</strong></td><td style="padding: 8px;">€{{totalAmount}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Deposit Due:</strong></td><td style="padding: 8px;">€{{depositDue}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Balance Due:</strong></td><td style="padding: 8px;">€{{balanceDue}}</td></tr>
        </table>
        <p>We look forward to providing you with an unforgettable experience!</p>
        <p>Best regards,<br>Your Tour Team</p>
    </body>
    </html>',
    'Booking Confirmed!

Dear {{clientName}},

Your booking has been confirmed. Here are your booking details:

Booking Code: {{bookingCode}}
Tour Start Date: {{startDate}}
Tour End Date: {{endDate}}
Total Amount: €{{totalAmount}}
Deposit Due: €{{depositDue}}
Balance Due: €{{balanceDue}}

We look forward to providing you with an unforgettable experience!

Best regards,
Your Tour Team',
    ARRAY['clientName', 'bookingCode', 'startDate', 'endDate', 'totalAmount', 'depositDue', 'balanceDue'],
    true
FROM tenants t;

INSERT INTO "email_templates" ("tenant_id", "name", "subject", "body_html", "body_text", "variables", "is_active")
SELECT
    t.id,
    'PAYMENT_RECEIVED',
    'Payment Received - Thank You!',
    '<html>
    <body>
        <h2>Payment Received</h2>
        <p>Dear {{clientName}},</p>
        <p>We have successfully received your payment of €{{amount}}.</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px;"><strong>Booking Code:</strong></td><td style="padding: 8px;">{{bookingCode}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Amount Paid:</strong></td><td style="padding: 8px;">€{{amount}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Payment Date:</strong></td><td style="padding: 8px;">{{paymentDate}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Payment Method:</strong></td><td style="padding: 8px;">{{paymentMethod}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Remaining Balance:</strong></td><td style="padding: 8px;">€{{remainingBalance}}</td></tr>
        </table>
        <p>Thank you for your payment!</p>
        <p>Best regards,<br>Your Tour Team</p>
    </body>
    </html>',
    'Payment Received

Dear {{clientName}},

We have successfully received your payment of €{{amount}}.

Booking Code: {{bookingCode}}
Amount Paid: €{{amount}}
Payment Date: {{paymentDate}}
Payment Method: {{paymentMethod}}
Remaining Balance: €{{remainingBalance}}

Thank you for your payment!

Best regards,
Your Tour Team',
    ARRAY['clientName', 'bookingCode', 'amount', 'paymentDate', 'paymentMethod', 'remainingBalance'],
    true
FROM tenants t;

INSERT INTO "email_templates" ("tenant_id", "name", "subject", "body_html", "body_text", "variables", "is_active")
SELECT
    t.id,
    'PAYMENT_REMINDER',
    'Payment Reminder - {{bookingCode}}',
    '<html>
    <body>
        <h2>Payment Reminder</h2>
        <p>Dear {{clientName}},</p>
        <p>This is a friendly reminder that your payment is due for booking {{bookingCode}}.</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px;"><strong>Amount Due:</strong></td><td style="padding: 8px;">€{{amountDue}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Due Date:</strong></td><td style="padding: 8px;">{{dueDate}}</td></tr>
        </table>
        <p>Please ensure payment is made by the due date to avoid any issues with your booking.</p>
        <p>If you have any questions or concerns, please contact us.</p>
        <p>Best regards,<br>Your Tour Team</p>
    </body>
    </html>',
    'Payment Reminder

Dear {{clientName}},

This is a friendly reminder that your payment is due for booking {{bookingCode}}.

Amount Due: €{{amountDue}}
Due Date: {{dueDate}}

Please ensure payment is made by the due date to avoid any issues with your booking.

If you have any questions or concerns, please contact us.

Best regards,
Your Tour Team',
    ARRAY['clientName', 'bookingCode', 'amountDue', 'dueDate'],
    true
FROM tenants t;

INSERT INTO "email_templates" ("tenant_id", "name", "subject", "body_html", "body_text", "variables", "is_active")
SELECT
    t.id,
    'TOUR_REMINDER',
    'Your Tour Starts Soon - {{bookingCode}}',
    '<html>
    <body>
        <h2>Tour Reminder</h2>
        <p>Dear {{clientName}},</p>
        <p>We''re excited to remind you that your tour is coming up soon!</p>
        <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px;"><strong>Booking Code:</strong></td><td style="padding: 8px;">{{bookingCode}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Start Date:</strong></td><td style="padding: 8px;">{{startDate}}</td></tr>
            <tr><td style="padding: 8px;"><strong>Days Until Tour:</strong></td><td style="padding: 8px;">{{daysUntilTour}}</td></tr>
        </table>
        <p>Please ensure you have all necessary documents and are prepared for your tour.</p>
        <p>We look forward to seeing you soon!</p>
        <p>Best regards,<br>Your Tour Team</p>
    </body>
    </html>',
    'Tour Reminder

Dear {{clientName}},

We''re excited to remind you that your tour is coming up soon!

Booking Code: {{bookingCode}}
Start Date: {{startDate}}
Days Until Tour: {{daysUntilTour}}

Please ensure you have all necessary documents and are prepared for your tour.

We look forward to seeing you soon!

Best regards,
Your Tour Team',
    ARRAY['clientName', 'bookingCode', 'startDate', 'daysUntilTour'],
    true
FROM tenants t;
