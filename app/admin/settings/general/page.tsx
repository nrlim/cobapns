import { Metadata } from "next";
import { getSettings } from "@/app/actions/settings";
import { GeneralSettingsClient } from "./client";

export const metadata: Metadata = {
  title: "General Settings | Admin",
};

export default async function GeneralSettingsPage() {
  const currentSettings = await getSettings();

  return (
    <div className="space-y-8 p-4 md:p-8 lg:p-10 w-full flex-1">
      {/* ── Page Hero ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700 mb-1 lg:mb-2">
            Admin Settings
          </p>
          <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-slate-900">
            Platform Configuration
          </h2>
          <p className="text-slate-500 font-medium mt-1 text-sm">
            Manage public contact information, social media links, and core application constants.
          </p>
        </div>
      </div>

      <GeneralSettingsClient initialData={currentSettings} />
    </div>
  );
}
