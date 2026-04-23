"use client"

import { useActionState, useState, useRef, useEffect } from "react"
import { updateProfileSettings, updatePassword, updateFormation } from "@/app/actions/profile"
import {
  User, Mail, Phone, Building2, Shield, Bell,
  CheckCircle2, AlertCircle, Loader2, Save, Key,
  UserCircle2, Lock, Eye, EyeOff, ChevronRight,
  Target, FileText, Briefcase, GraduationCap, Search
} from "lucide-react"

interface UserData {
  name: string
  email: string
  phoneNumber: string | null
  targetInstansi: string | null
  jabatan: string | null
  jenjang: string | null
  prodi: string | null
  gender: string | null
  profession: string | null
  learningWay: string | null
  learningPref: string | null
  source: string | null
  learningGoal: string | null
  notifEmail: boolean
  avatarUrl: string | null
  subscriptionTier: string
  createdAt: Date
}

const TIER_LABEL: Record<string, { label: string; cls: string }> = {
  FREE:    { label: "Free Scholar",      cls: "bg-slate-100 text-slate-600 border-slate-200" },
  PRO:     { label: "Elite Prep",        cls: "bg-blue-50 text-brand-blue-deep border-blue-200" },
  PREMIUM: { label: "Master Strategy",   cls: "bg-violet-50 text-violet-700 border-violet-200" },
}

function InputField({
  id, name, label, type = "text", icon: Icon, defaultValue, placeholder, disabled, hint, required = false, listOptions
}: {
  id: string; name?: string; label: string; type?: string; icon: React.ElementType;
  defaultValue?: string; placeholder?: string; disabled?: boolean; hint?: string; required?: boolean;
  listOptions?: string[]
}) {
  const [show, setShow] = useState(false)
  const isPassword = type === "password"
  const listId = listOptions ? `${id}-list` : undefined

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input
          id={id}
          name={name ?? id}
          type={isPassword ? (show ? "text" : "password") : type}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          list={listId}
          className={`w-full pl-10 ${isPassword ? "pr-10" : "pr-4"} py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all
            disabled:bg-slate-100/60 disabled:text-slate-400 disabled:cursor-not-allowed placeholder:text-slate-400`}
        />
        {listOptions && (
          <datalist id={listId}>
            {listOptions.map(opt => <option key={opt} value={opt} />)}
          </datalist>
        )}
        {isPassword && (
          <button type="button" onClick={() => setShow(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400 font-medium pl-1">{hint}</p>}
    </div>
  )
}

function SelectField({
  id, name, label, icon: Icon, defaultValue, options, required = false,
}: {
  id: string; name?: string; label: string; icon: React.ElementType; defaultValue?: string; options: {value: string, label: string}[]; required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-xs font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <select
          id={id}
          name={name ?? id}
          defaultValue={defaultValue}
          required={required}
          className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all appearance-none cursor-pointer"
        >
          <option value="" disabled>Pilih {label}...</option>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500">
          <ChevronRight className="w-4 h-4 rotate-90" />
        </div>
      </div>
    </div>
  )
}

function TextareaField({
  id, name, label, icon: Icon, defaultValue, placeholder, required = false,
}: {
  id: string; name?: string; label: string; icon: React.ElementType; defaultValue?: string; placeholder?: string; required?: boolean
}) {
  return (
    <div className="space-y-1.5 sm:col-span-2">
      <label htmlFor={id} className="text-xs font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="relative group">
        <Icon className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <textarea
          id={id}
          name={name ?? id}
          defaultValue={defaultValue}
          placeholder={placeholder}
          required={required}
          rows={4}
          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none"
        />
      </div>
    </div>
  )
}

function RadioGroupField({
  id, name, label, options, defaultValue,
}: {
  id: string; name?: string; label: string; defaultValue?: string; options: {value: string, label: string}[]
}) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="flex flex-wrap gap-4">
        {options.map(opt => (
          <label key={opt.value} className="relative flex items-center gap-2 cursor-pointer group">
            <input
              type="radio"
              name={name ?? id}
              value={opt.value}
              defaultChecked={defaultValue === opt.value}
              className="peer sr-only"
            />
            <div className="w-4.5 h-4.5 rounded-full border-2 border-slate-300 peer-checked:border-blue-500 flex items-center justify-center transition-colors">
              <div className="w-2 h-2 rounded-full bg-blue-500 opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <span className="text-sm font-bold text-slate-600 peer-checked:text-brand-blue-deep transition-colors">{opt.label}</span>
          </label>
        ))}
      </div>
    </div>
  )
}

function Alert({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm font-medium
      ${type === "success" ? "bg-blue-50 border-blue-200 text-brand-blue-deep" : "bg-red-50 border-red-200 text-red-800"}`}>
      {type === "success"
        ? <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
        : <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />}
      {message}
    </div>
  )
}

function SearchableSelectField({
  id, name, label, icon: Icon, defaultValue, placeholder, disabled, hint, required = false, listOptions
}: {
  id: string; name?: string; label: string; icon: React.ElementType;
  defaultValue?: string; placeholder?: string; disabled?: boolean; hint?: string; required?: boolean;
  listOptions?: string[]
}) {
  const [value, setValue] = useState(defaultValue || "");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = (listOptions || []).filter(opt => opt.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-1.5" ref={wrapperRef}>
      <label htmlFor={id} className="text-xs font-black uppercase text-slate-500 tracking-widest">{label}</label>
      <div className="relative">
        <input type="hidden" name={name ?? id} value={value} />
        
        <button
          type="button"
          disabled={disabled}
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) setSearchQuery("");
          }}
          className={`w-full flex items-center justify-between px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium transition-all ${
            disabled ? 'bg-slate-100/60 text-slate-400 cursor-not-allowed' : 'hover:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-500/20 text-slate-900'
          } ${isOpen ? 'bg-white border-blue-500 ring-2 ring-blue-500/20' : ''}`}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <Icon className="w-4 h-4 text-slate-400 shrink-0" />
            <span className={`truncate ${!value ? 'text-slate-400' : 'text-slate-900'}`}>
              {value || placeholder || "Pilih opsi"}
            </span>
          </div>
          <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
        </button>
        
        {isOpen && listOptions && (
          <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Search Input Filter */}
            <div className="px-3 pb-2 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Ketik untuk mencari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-900"
                />
              </div>
            </div>
            
            {/* Options List */}
            <div className="max-h-60 overflow-y-auto pt-1 scroll-smooth">
              {filtered.length > 0 ? (
                filtered.map((opt, idx) => (
                  <button
                    key={`${opt}-${idx}`}
                    type="button"
                    onClick={() => {
                      setValue(opt);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full flex items-center justify-between text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      value === opt ? 'bg-blue-50 text-brand-blue-deep' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <span className="truncate pr-4">{opt}</span>
                    {value === opt && <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-sm text-slate-500 italic flex flex-col items-center justify-center gap-2">
                  <Search className="w-6 h-6 text-slate-300" />
                  <p>Tidak ada hasil untuk "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {hint && <p className="text-[11px] text-slate-400 font-medium pl-1">{hint}</p>}
    </div>
  )
}

export function SettingsClient({ user, lookups }: { 
  user: UserData,
  lookups?: { instances: string[], positions: string[], educations: string[], majors: string[] }
}) {
  const [profileState, formActionProfile, isPendingProfile] = useActionState(updateProfileSettings, null)
  const [passState, formActionPass, isPendingPass] = useActionState(updatePassword, null)
  const [formState, formActionFormation, isPendingFormation] = useActionState(updateFormation, null)
  
  const [activeTab, setActiveTab] = useState<"profile" | "formation" | "security">("profile")

  const tier = TIER_LABEL[user.subscriptionTier] ?? TIER_LABEL.FREE

  const TABS = [
    { key: "profile" as const, icon: UserCircle2, label: "Profil Dasar" },
    { key: "formation" as const, icon: Target, label: "Formasi Target" },
    { key: "security" as const, icon: Shield, label: "Keamanan Sandi" },
  ]

  return (
    <div className="p-4 md:p-8 lg:p-10 w-full pb-20">
      <div className="space-y-8">

        {/* ── Profile Hero Banner ────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 rounded-3xl overflow-hidden shadow-lg">
          {/* Background graphics */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-violet-500/10 rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6 p-6 sm:p-8">
            {/* Avatar */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-brand-blue-light to-emerald-500 flex items-center justify-center text-4xl font-black text-white shadow-xl shadow-blue-900/30 flex-shrink-0 select-none border-4 border-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="text-center sm:text-left flex-1 space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">{user.name}</h1>
              <p className="text-slate-400 font-medium text-sm">{user.email}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start mt-2">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-black border ${tier.cls}`}>
                  {tier.label}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/10 text-slate-300 border border-white/10">
                  Bergabung {new Date(user.createdAt).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tab Layout ──────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row gap-6">

          {/* Sidebar tabs */}
          <div className="md:w-56 flex-shrink-0">
            <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible">
              {TABS.map(({ key, icon: Icon, label }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left whitespace-nowrap w-full
                    ${activeTab === key
                      ? "bg-brand-blue text-white shadow-md shadow-brand-blue/20"
                      : "bg-white border border-slate-200 text-slate-600 hover:border-blue-200 hover:text-brand-blue-deep hover:bg-blue-50/50"
                    }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{label}</span>
                  {activeTab !== key && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">

            {/* ── TAB: PROFILE ────────────────────────────────────── */}
            {activeTab === "profile" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                {/* Card Header */}
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <UserCircle2 className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-[15px]">Data Profil</h2>
                    <p className="text-xs font-medium text-slate-500">Informasi yang ditampilkan di portal COBA PNS.</p>
                  </div>
                </div>

                <form action={formActionProfile} className="p-6 space-y-6">
                  {profileState?.success && <Alert type="success" message={profileState.message!} />}
                  {profileState?.error && <Alert type="error" message={profileState.error} />}

                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField id="name" label="Nama Lengkap" icon={User} defaultValue={user.name} required />
                      <InputField id="email" label="Email (tidak bisa diubah)" icon={Mail} type="email" defaultValue={user.email} disabled />
                      
                      <InputField
                        id="phoneNumber" label="Nomor WhatsApp" icon={Phone}
                        placeholder="628123456789" defaultValue={user.phoneNumber || ""}
                        hint="Format: 628xxxxxxxx (tanpa spasi atau tanda +)" required
                      />
                      <RadioGroupField
                        id="gender" label="Jenis Kelamin" defaultValue={user.gender || ""}
                        options={[
                          { value: "Laki-laki", label: "Laki-laki" },
                          { value: "Perempuan", label: "Perempuan" },
                        ]}
                      />
                    </div>

                    {/* Background & Preferences */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField
                        id="profession" label="Profesi Saat Ini" icon={Briefcase}
                        placeholder="Contoh: Fresh Graduate, Pegawai Swasta" defaultValue={user.profession || ""}
                      />
                      <SelectField
                        id="source" label="Sumber Informasi COBA PNS" icon={Building2}
                        defaultValue={user.source || ""}
                        options={[
                          { value: "TikTok", label: "TikTok" },
                          { value: "Instagram", label: "Instagram" },
                          { value: "Google", label: "Google" },
                          { value: "Teman", label: "Teman/Keluarga" },
                          { value: "Iklan", label: "Iklan (Ads)" },
                        ]}
                      />
                      <SelectField
                        id="learningWay" label="Gaya Belajar" icon={UserCircle2}
                        defaultValue={user.learningWay || ""}
                        options={[
                          { value: "Visual", label: "Visual (Melihat)" },
                          { value: "Auditori", label: "Auditori (Mendengar)" },
                          { value: "Kinestetik", label: "Kinestetik (Praktek)" },
                        ]}
                      />
                      <SelectField
                        id="learningPref" label="Preferensi Belajar" icon={CheckCircle2}
                        defaultValue={user.learningPref || ""}
                        options={[
                          { value: "Mandiri", label: "Mandiri" },
                          { value: "Terjadwal", label: "Terjadwal" },
                          { value: "Intensif", label: "Intensif" },
                        ]}
                      />
                    </div>

                    <TextareaField
                      id="learningGoal" label="Tujuan Pembelajaran Khusus" icon={Target}
                      placeholder="Apa materi/topik yang paling ingin kamu kuasai? (Contoh: Saya ingin lebih jago di soal Penalaran Analitis TIU)"
                      defaultValue={user.learningGoal || ""}
                    />
                  </div>

                  {/* Notification toggle */}
                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-3">
                      <Bell className="w-4 h-4 text-brand-blue" /> Preferensi Notifikasi
                    </h3>
                    <label className="flex items-start gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-blue-50/30 hover:border-blue-200 transition-all group">
                      <div className="pt-0.5">
                        <input
                          type="checkbox"
                          name="notifEmail"
                          defaultChecked={user.notifEmail}
                          className="w-4.5 h-4.5 rounded text-brand-blue focus:ring-blue-500 border-slate-300 cursor-pointer"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-brand-blue-deep transition-colors">Pengingat Belajar via Email</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          Kami akan sesekali mengirimkan ringkasan progress & jadwal tryout agar kamu tetap konsisten belajar.
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="flex justify-end pt-2 mt-2">
                    <button
                      type="submit"
                      disabled={isPendingProfile}
                      className="inline-flex items-center gap-2 px-7 py-2.5 bg-brand-blue hover:bg-brand-blue-deep active:bg-brand-blue-deep disabled:bg-blue-300 text-white text-sm font-black rounded-xl transition-all shadow-sm shadow-blue-500/25"
                    >
                      {isPendingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isPendingProfile ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── TAB: FORMATION ────────────────────────────────────── */}
            {activeTab === "formation" && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <Target className="w-5 h-5 text-brand-blue" />
                  </div>
                  <div>
                    <h2 className="font-black text-slate-900 text-[15px]">Formasi Target</h2>
                    <p className="text-xs font-medium text-slate-500">Target instansi CPNS yang ingin kamu lamar.</p>
                  </div>
                </div>

                <form action={formActionFormation} className="p-6 space-y-6">
                  {formState?.success && <Alert type="success" message={formState.message!} />}
                  {formState?.error && <Alert type="error" message={formState.error} />}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 relative z-20">
                    <SearchableSelectField
                      id="targetInstansi" label="Instansi Tujuan" icon={Building2}
                      placeholder="Pilih instansi..." defaultValue={user.targetInstansi || ""}
                      listOptions={lookups?.instances}
                    />
                    <SearchableSelectField
                      id="jabatan" label="Jabatan/Formasi" icon={Briefcase}
                      placeholder="Pilih jabatan..." defaultValue={user.jabatan || ""}
                      listOptions={lookups?.positions}
                    />
                    <SearchableSelectField
                      id="jenjang" label="Jenjang Pendidikan" icon={GraduationCap}
                      placeholder="Pilih pendidikan..." defaultValue={user.jenjang || ""}
                      listOptions={lookups?.educations}
                    />
                    <SearchableSelectField
                      id="prodi" label="Program Studi" icon={FileText}
                      placeholder="Pilih prodi..." defaultValue={user.prodi || ""}
                      listOptions={lookups?.majors}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isPendingFormation}
                      className="inline-flex items-center gap-2 px-7 py-2.5 bg-brand-blue hover:bg-brand-blue-deep active:bg-brand-blue-deep disabled:bg-blue-300 text-white text-sm font-black rounded-xl transition-all shadow-sm shadow-blue-500/25"
                    >
                      {isPendingFormation ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isPendingFormation ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              </div>
            )}


            {/* ── TAB: SECURITY ───────────────────────────────────── */}
            {activeTab === "security" && (
              <div className="space-y-5">
                {/* Password card */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                      <Key className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="font-black text-slate-900 text-[15px]">Ubah Kata Sandi</h2>
                      <p className="text-xs font-medium text-slate-500">Pastikan password kamu unik dan minimal 8 karakter.</p>
                    </div>
                  </div>

                  <form action={formActionPass} className="p-6 space-y-6">
                    {passState?.success && <Alert type="success" message={passState.message!} />}
                    {passState?.error && <Alert type="error" message={passState.error} />}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <InputField id="currentPassword" label="Kata Sandi Saat Ini" icon={Lock} type="password" required />
                      <InputField
                        id="newPassword" label="Kata Sandi Baru" icon={Key} type="password"
                        hint="Minimal 8 karakter. Gunakan kombinasi huruf, angka, dan simbol." required
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        disabled={isPendingPass}
                        className="inline-flex items-center justify-center gap-2 px-7 py-2.5 bg-slate-900 hover:bg-slate-800 active:bg-black disabled:bg-slate-400 text-white text-sm font-black rounded-xl transition-all shadow-sm shadow-slate-900/20"
                      >
                        {isPendingPass ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                        {isPendingPass ? "Memperbarui..." : "Perbarui Kata Sandi"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-amber-900">Keamanan Akun</p>
                    <p className="text-xs font-medium text-amber-800/80 mt-1 leading-relaxed">
                      Jangan pernah membagikan password ke siapapun termasuk tim COBA PNS.
                      Satu akun hanya diperbolehkan untuk satu pengguna sesuai Syarat & Ketentuan kami.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
