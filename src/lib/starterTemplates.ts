// Shared starter templates used by both Marketing Templates editor and Customer Communication tab

export interface StarterEmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  channel: "email";
}

export interface StarterSmsTemplate {
  id: string;
  name: string;
  body: string;
  channel: "sms";
}

export const EMAIL_STARTERS: StarterEmailTemplate[] = [
  {
    id: "starter-welcome",
    name: "Welcome Email",
    subject: "Welcome to TruMove, {first_name}!",
    channel: "email",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #16a34a; padding: 32px 24px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to TruMove!</h1>
  </div>
  <div style="padding: 32px 24px; background: #ffffff;">
    <p style="font-size: 16px; color: #1a1a1a;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Thank you for choosing TruMove for your upcoming move. We're committed to making your relocation as smooth and stress-free as possible.</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Your dedicated agent will be reaching out shortly to discuss your move details.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{tracking_link}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Track Your Move</a>
    </div>
    <p style="font-size: 12px; color: #999; text-align: center;">Questions? Reply to this email or call us anytime.</p>
  </div>
</div>`,
  },
  {
    id: "starter-quote-followup",
    name: "Quote Follow-Up",
    subject: "Your Moving Quote — {booking_id}",
    channel: "email",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #0f172a; padding: 28px 24px; border-radius: 12px 12px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 22px;">Your Moving Quote</h1>
    <p style="color: #94a3b8; margin: 8px 0 0; font-size: 14px;">Reference: {booking_id}</p>
  </div>
  <div style="padding: 28px 24px; background: #ffffff;">
    <p style="font-size: 15px; color: #1a1a1a;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Here's your personalized moving estimate:</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">From:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{origin_address}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">To:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{dest_address}</td>
      </tr>
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 0; font-size: 13px; color: #666;">Move Date:</td>
        <td style="padding: 10px 0; font-size: 13px; font-weight: 600; text-align: right;">{move_date}</td>
      </tr>
      <tr>
        <td style="padding: 10px 0; font-size: 15px; color: #1a1a1a; font-weight: 700;">Estimated Cost:</td>
        <td style="padding: 10px 0; font-size: 18px; font-weight: 700; text-align: right; color: #16a34a;">{estimated_value}</td>
      </tr>
    </table>
    <div style="text-align: center; margin: 24px 0;">
      <a href="{tracking_link}" style="display: inline-block; background: #16a34a; color: #ffffff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">Book Your Move</a>
    </div>
  </div>
</div>`,
  },
  {
    id: "starter-move-reminder",
    name: "Move Reminder",
    subject: "Your Move is Tomorrow, {first_name}!",
    channel: "email",
    body: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
  <div style="background: #16a34a; padding: 24px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0; font-size: 20px;">🚚 Your Move is Tomorrow!</h1>
  </div>
  <div style="padding: 24px;">
    <p style="font-size: 14px; color: #555;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.6;">Just a reminder that your move is scheduled for <strong>{move_date}</strong>.</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Pickup:</strong> {origin_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📍 Delivery:</strong> {dest_address}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>📋 Ref:</strong> {booking_id}</p>
    </div>
    <p style="font-size: 13px; color: #555;">Please ensure everything is packed and ready. Your crew will arrive at the scheduled time.</p>
    <p style="font-size: 12px; color: #999; margin-top: 20px;">— The TruMove Team</p>
  </div>
</div>`,
  },
  {
    id: "starter-inventory-summary",
    name: "Inventory Summary",
    subject: "Your Inventory & Moving Estimate — {booking_id}",
    channel: "email",
    body: `<div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 0; overflow: hidden;">
  <div style="background: #22c55e; padding: 4px 0;"></div>
  <div style="padding: 32px 32px 20px; text-align: center;">
    <img src="/images/logo-email.png" alt="TruMove" style="height: 28px; margin-bottom: 16px;" />
  </div>
  <div style="background: #0a0a0a; padding: 36px 32px; text-align: center;">
    <h1 style="color: #ffffff; margin: 0 0 8px; font-size: 26px; font-weight: 700; letter-spacing: -0.3px;">Your Inventory Summary</h1>
    <p style="color: #9ca3af; margin: 0; font-size: 14px;">Reference: {booking_id}</p>
  </div>
  <div style="padding: 28px 32px;">
    <p style="font-size: 15px; color: #1a1a1a; margin: 0 0 16px;">Hi {first_name},</p>
    <p style="font-size: 14px; color: #555; line-height: 1.7; margin: 0 0 24px;">Here's a complete breakdown of the items we'll be moving for you.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="{tracking_link}" style="display: inline-block; background: #22c55e; color: #ffffff; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 15px;">Confirm Your Move →</a>
    </div>
  </div>
  <div style="border-top: 1px solid #e5e7eb; padding: 20px 32px; text-align: center;">
    <p style="margin: 0; font-size: 14px; color: #374151;">Questions about your inventory?</p>
    <p style="margin: 6px 0 0; font-size: 13px; color: #6b7280;">Reply to this email or call <strong>(800) 555-MOVE</strong></p>
  </div>
</div>`,
  },
  {
    id: "starter-booking-confirm",
    name: "Booking Confirmation",
    subject: "Your Move is Confirmed - {booking_id}",
    channel: "email",
    body: `Dear {customer_name},\n\nThank you for choosing TruMove!\n\nBooking ID: {booking_id}\nMove Date: {move_date}\nPickup: {origin_address}\nDelivery: {dest_address}\n\nBest regards,\nThe TruMove Team`,
  },
  {
    id: "starter-day-before",
    name: "Day Before Reminder",
    subject: "Your Move is Tomorrow! - {booking_id}",
    channel: "email",
    body: `Hi {customer_name},\n\nYour move is scheduled for tomorrow!\n\n📅 Date: {move_date}\n📍 Pickup: {origin_address}\n\nSee you tomorrow!\nTruMove Team`,
  },
  {
    id: "starter-post-move",
    name: "Post-Move Follow-up",
    subject: "How Was Your Move? - {booking_id}",
    channel: "email",
    body: `Dear {customer_name},\n\nWe hope your move went smoothly!\n\nThank you for choosing TruMove!\n\nWarm regards,\nThe TruMove Team`,
  },
];

export const SMS_STARTERS: StarterSmsTemplate[] = [
  { id: "starter-sms-confirm", name: "Booking Confirmed", channel: "sms", body: "TruMove: Hi {first_name}, your move is confirmed for {move_date}! Booking #{booking_id}. From: {origin_address} → {dest_address}. Questions? Reply HELP." },
  { id: "starter-sms-otw", name: "Crew On The Way", channel: "sms", body: "TruMove: Your crew is on the way! ETA: {eta}. Track live: {tracking_link}" },
  { id: "starter-sms-complete", name: "Move Complete", channel: "sms", body: "TruMove: Your move is complete, {first_name}! Thank you for choosing us. Questions? Call (800) 555-MOVE." },
  { id: "starter-sms-quote", name: "Quote Ready", channel: "sms", body: "TruMove: Hi {first_name}, your moving quote is ready! Estimated cost: {estimated_value}. View details: {tracking_link}" },
  { id: "starter-sms-payment", name: "Payment Reminder", channel: "sms", body: "TruMove: Hi {first_name}, reminder: your deposit for booking #{booking_id} is due. Questions? Reply or call (800) 555-MOVE." },
  { id: "starter-sms-arrived", name: "Crew Arrived", channel: "sms", body: "TruMove: Your crew has arrived at {origin_address}. Please meet them at the entrance." },
];
