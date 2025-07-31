/**
 * Email utility functions
 * NOTE: This is a placeholder implementation. In production, you would integrate
 * with an email service like SendGrid, AWS SES, or Postmark.
 */
interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}
export declare function sendEmail(options: EmailOptions): Promise<boolean>;
export declare function generatePasswordResetEmail(resetUrl: string): EmailOptions;
export {};
//# sourceMappingURL=email.d.ts.map