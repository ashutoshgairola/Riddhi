/**
 * Shared email layout wrapper.
 * Uses inline styles for email client compatibility.
 * Matches the app's design system: green-600 accent, system font stack, gray palette.
 */

const FONT_STACK =
  "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

const COLORS = {
  green600: '#16a34a',
  green50: '#f0fdf4',
  green800: '#166534',
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray900: '#111827',
  white: '#ffffff',
  red600: '#dc2626',
};

export function emailLayout(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FinTrack</title>
</head>
<body style="margin:0; padding:0; background-color:${COLORS.gray50}; font-family:${FONT_STACK}; -webkit-font-smoothing:antialiased;">
  <!-- Preheader text (hidden but shows in inbox preview) -->
  <div style="display:none; max-height:0; overflow:hidden; color:${COLORS.gray50}; font-size:1px;">${preheader}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLORS.gray50};">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- Logo bar -->
          <tr>
            <td style="padding:0 0 24px 0;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="width:32px; height:32px; background-color:${COLORS.green600}; border-radius:8px;" align="center" valign="middle">
                    <span style="color:${COLORS.white}; font-size:16px; font-weight:700; line-height:32px;">F</span>
                  </td>
                  <td style="padding-left:10px;">
                    <span style="font-size:20px; font-weight:700; color:${COLORS.green800}; letter-spacing:-0.025em;">FinTrack</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main card -->
          <tr>
            <td style="background-color:${COLORS.white}; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,0.08); overflow:hidden;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0 0; text-align:center;">
              <p style="margin:0 0 8px 0; font-size:13px; color:${COLORS.gray500}; line-height:1.5;">
                You received this because of your notification preferences.
              </p>
              <p style="margin:0; font-size:13px; color:${COLORS.gray500}; line-height:1.5;">
                <a href="{{settingsUrl}}" style="color:${COLORS.green600}; text-decoration:none;">Manage preferences</a>
                &nbsp;&middot;&nbsp;
                <a href="{{unsubscribeUrl}}" style="color:${COLORS.gray500}; text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reusable green accent bar at top of card */
export function accentBar(): string {
  return `<div style="height:4px; background:linear-gradient(90deg, ${COLORS.green600}, ${COLORS.green800});"></div>`;
}

/** Reusable section with padding */
export function section(content: string): string {
  return `<td style="padding:32px 32px 24px 32px;">${content}</td>`;
}

/** Primary CTA button */
export function ctaButton(text: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px 0;">
  <tr>
    <td style="background-color:${COLORS.green600}; border-radius:8px; padding:12px 28px;">
      <a href="${url}" style="color:${COLORS.white}; text-decoration:none; font-size:14px; font-weight:600; display:inline-block; line-height:1;">${text}</a>
    </td>
  </tr>
</table>`;
}

/** Metric box (number + label) */
export function metricBox(label: string, value: string, color?: string): string {
  return `<td style="padding:12px 16px; background-color:${COLORS.gray50}; border-radius:8px; text-align:center; width:33%;">
  <div style="font-size:20px; font-weight:700; color:${color || COLORS.gray900}; line-height:1.2;">${value}</div>
  <div style="font-size:12px; color:${COLORS.gray500}; margin-top:4px; text-transform:uppercase; letter-spacing:0.05em;">${label}</div>
</td>`;
}

/** Divider line */
export function divider(): string {
  return `<hr style="border:none; border-top:1px solid ${COLORS.gray200}; margin:20px 0;" />`;
}

/** Paragraph text */
export function paragraph(text: string): string {
  return `<p style="margin:0 0 16px 0; font-size:15px; color:${COLORS.gray700}; line-height:1.6;">${text}</p>`;
}

/** Heading inside card */
export function heading(text: string): string {
  return `<h1 style="margin:0 0 8px 0; font-size:22px; font-weight:700; color:${COLORS.gray900}; line-height:1.3;">${text}</h1>`;
}

/** Subheading / greeting */
export function subtext(text: string): string {
  return `<p style="margin:0 0 20px 0; font-size:14px; color:${COLORS.gray500}; line-height:1.5;">${text}</p>`;
}

export { COLORS, FONT_STACK };
