import { NotificationTemplate, Language } from '../dto/send-notification.dto';

interface Template {
  subject?: string; // For email
  body: string;
}

type TemplateMap = {
  [key in NotificationTemplate]: {
    [key in Language]: Template;
  };
};

export const NOTIFICATION_TEMPLATES: TemplateMap = {
  [NotificationTemplate.QUOTATION_SENT]: {
    [Language.EN]: {
      subject: 'Your Tour Quotation from {{companyName}}',
      body: `Dear {{clientName}},

Thank you for your interest in our tour services!

We are pleased to send you a quotation for your requested tour:

Tour: {{tourName}}
Price: {{price}} EUR
Valid Until: {{validUntil}}

Please review the quotation and let us know if you have any questions.

Best regards,
{{companyName}} Team`,
    },
    [Language.TR]: {
      subject: '{{companyName}} Tur Teklifiniz',
      body: `Sayın {{clientName}},

Tur hizmetlerimize gösterdiğiniz ilgi için teşekkür ederiz!

Talep ettiğiniz tur için size bir teklif göndermekten memnuniyet duyuyoruz:

Tur: {{tourName}}
Fiyat: {{price}} EUR
Geçerlilik: {{validUntil}}

Lütfen teklifi inceleyin ve sorularınız varsa bize bildirin.

Saygılarımızla,
{{companyName}} Ekibi`,
    },
  },
  [NotificationTemplate.BOOKING_CONFIRMED]: {
    [Language.EN]: {
      subject: 'Booking Confirmation - {{bookingCode}}',
      body: `Dear {{clientName}},

Your booking has been confirmed!

Booking Code: {{bookingCode}}
Tour: {{tourName}}
Start Date: {{startDate}}
End Date: {{endDate}}
Total Amount: {{amount}} EUR

We look forward to hosting you on this wonderful journey!

Best regards,
{{companyName}} Team`,
    },
    [Language.TR]: {
      subject: 'Rezervasyon Onayı - {{bookingCode}}',
      body: `Sayın {{clientName}},

Rezervasyonunuz onaylanmıştır!

Rezervasyon Kodu: {{bookingCode}}
Tur: {{tourName}}
Başlangıç Tarihi: {{startDate}}
Bitiş Tarihi: {{endDate}}
Toplam Tutar: {{amount}} EUR

Bu harika yolculukta sizi ağırlamak için sabırsızlanıyoruz!

Saygılarımızla,
{{companyName}} Ekibi`,
    },
  },
  [NotificationTemplate.PAYMENT_REMINDER]: {
    [Language.EN]: {
      subject: 'Payment Reminder - {{bookingCode}}',
      body: `Dear {{clientName}},

This is a friendly reminder about your upcoming payment.

Booking Code: {{bookingCode}}
Amount Due: {{amount}} EUR
Due Date: {{dueDate}}

Please complete your payment by the due date to secure your booking.

If you have any questions, please don't hesitate to contact us.

Best regards,
{{companyName}} Team`,
    },
    [Language.TR]: {
      subject: 'Ödeme Hatırlatması - {{bookingCode}}',
      body: `Sayın {{clientName}},

Yaklaşan ödemeniz hakkında bir hatırlatma.

Rezervasyon Kodu: {{bookingCode}}
Ödenecek Tutar: {{amount}} EUR
Son Ödeme Tarihi: {{dueDate}}

Rezervasyonunuzu güvence altına almak için lütfen son ödeme tarihine kadar ödemenizi tamamlayın.

Sorularınız varsa, lütfen bizimle iletişime geçmekten çekinmeyin.

Saygılarımızla,
{{companyName}} Ekibi`,
    },
  },
  [NotificationTemplate.PAYMENT_RECEIVED]: {
    [Language.EN]: {
      subject: 'Payment Received - {{bookingCode}}',
      body: `Dear {{clientName}},

We have successfully received your payment!

Booking Code: {{bookingCode}}
Amount Paid: {{amount}} EUR
Payment Date: {{paymentDate}}
Payment Method: {{paymentMethod}}

Thank you for your prompt payment.

Best regards,
{{companyName}} Team`,
    },
    [Language.TR]: {
      subject: 'Ödeme Alındı - {{bookingCode}}',
      body: `Sayın {{clientName}},

Ödemenizi başarıyla aldık!

Rezervasyon Kodu: {{bookingCode}}
Ödenen Tutar: {{amount}} EUR
Ödeme Tarihi: {{paymentDate}}
Ödeme Yöntemi: {{paymentMethod}}

Zamanında ödemeniz için teşekkür ederiz.

Saygılarımızla,
{{companyName}} Ekibi`,
    },
  },
  [NotificationTemplate.BOOKING_REMINDER]: {
    [Language.EN]: {
      subject: 'Tour Reminder - {{bookingCode}}',
      body: `Dear {{clientName}},

Your tour is coming up soon!

Booking Code: {{bookingCode}}
Tour: {{tourName}}
Start Date: {{startDate}}
Meeting Point: {{meetingPoint}}

Please make sure you have all necessary documents and arrive at the meeting point on time.

We're excited to have you join us!

Best regards,
{{companyName}} Team`,
    },
    [Language.TR]: {
      subject: 'Tur Hatırlatması - {{bookingCode}}',
      body: `Sayın {{clientName}},

Turunuz yakında başlıyor!

Rezervasyon Kodu: {{bookingCode}}
Tur: {{tourName}}
Başlangıç Tarihi: {{startDate}}
Buluşma Noktası: {{meetingPoint}}

Lütfen tüm gerekli belgelerinizin hazır olduğundan emin olun ve buluşma noktasına zamanında gelin.

Sizi aramızda görmek için heyecanlıyız!

Saygılarımızla,
{{companyName}} Ekibi`,
    },
  },
};

export function renderTemplate(
  template: NotificationTemplate,
  language: Language,
  variables: Record<string, any>,
): { subject?: string; body: string } {
  const templateContent = NOTIFICATION_TEMPLATES[template][language];

  let subject = templateContent.subject;
  let body = templateContent.body;

  // Replace variables in template
  Object.keys(variables).forEach((key) => {
    const placeholder = `{{${key}}}`;
    const value = variables[key]?.toString() || '';
    if (subject) {
      subject = subject.replace(new RegExp(placeholder, 'g'), value);
    }
    body = body.replace(new RegExp(placeholder, 'g'), value);
  });

  return { subject, body };
}
