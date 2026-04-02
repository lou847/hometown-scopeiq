import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "ScopeIQ <noreply@scopeiq.app>";

export async function sendInvitationEmail(params: {
  to: string;
  contactName: string;
  companyName: string;
  projectName: string;
  projectAddress: string;
  trade: string;
  bidDueDate: string;
  formUrl: string;
}) {
  const { to, contactName, projectName, projectAddress, trade, bidDueDate, formUrl } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `ScopeIQ — Bid Invitation: ${projectName} (${trade})`,
    html: `
      <h2>Bid Invitation</h2>
      <p>Hello ${contactName},</p>
      <p>You are invited to submit a bid for:</p>
      <ul>
        <li><strong>Project:</strong> ${projectName}</li>
        <li><strong>Address:</strong> ${projectAddress}</li>
        <li><strong>Trade:</strong> ${trade}</li>
        <li><strong>Due Date:</strong> ${bidDueDate}</li>
        <li><strong>Estimated completion time:</strong> 12–18 minutes</li>
      </ul>
      <p><a href="${formUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Open Bid Form</a></p>
      <p><strong>Bids not submitted through ScopeIQ by ${bidDueDate} will not be considered for award.</strong></p>
    `,
  });
}

export async function sendReminderEmail(params: {
  to: string;
  contactName: string;
  projectName: string;
  trade: string;
  bidDueDate: string;
  formUrl: string;
}) {
  const { to, contactName, projectName, trade, bidDueDate, formUrl } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Reminder — Bid Due: ${projectName} (${trade})`,
    html: `
      <h2>Bid Reminder</h2>
      <p>Hello ${contactName},</p>
      <p>This is a reminder that your bid for <strong>${projectName}</strong> (${trade}) is due by <strong>${bidDueDate}</strong>.</p>
      <p><a href="${formUrl}" style="display:inline-block;padding:12px 24px;background:#1a1a1a;color:#fff;text-decoration:none;border-radius:6px;">Open Bid Form</a></p>
    `,
  });
}

export async function sendSubmissionConfirmation(params: {
  to: string;
  contactName: string;
  companyName: string;
  projectName: string;
  trade: string;
}) {
  const { to, contactName, companyName, projectName, trade } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Bid Received — ${projectName} (${trade})`,
    html: `
      <h2>Submission Confirmed</h2>
      <p>Hello ${contactName},</p>
      <p>Your bid from <strong>${companyName}</strong> for <strong>${projectName}</strong> (${trade}) has been received.</p>
      <p>You will be notified if there are any questions about your submission.</p>
    `,
  });
}

export async function sendAdminNotification(params: {
  recipients: string[];
  companyName: string;
  projectName: string;
  trade: string;
}) {
  const { recipients, companyName, projectName, trade } = params;

  return resend.emails.send({
    from: FROM_EMAIL,
    to: recipients,
    subject: `New Bid Submitted — ${companyName} for ${projectName} (${trade})`,
    html: `
      <h2>New Bid Submission</h2>
      <p><strong>${companyName}</strong> has submitted a bid for <strong>${projectName}</strong> (${trade}).</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">View in Dashboard</a></p>
    `,
  });
}
