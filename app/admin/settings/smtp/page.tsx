import { Metadata } from "next";
import { getSmtpSettings } from "./actions";
import { SmtpSettingsClient } from "./client";

export const metadata: Metadata = {
  title: "SMTP Relay Settings | Admin",
};

export default async function SmtpSettingsPage() {
  const currentSettings = await getSmtpSettings();

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-blue-deep mb-1 lg:mb-2">
            Admin Settings
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            SMTP Relay Configuration
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Configure SMTP settings for sending platform emails (e.g., password reset).
          </p>
        </div>
      </div>

      <SmtpSettingsClient initialData={currentSettings} />
    </div>
  );
}
