"use client";


const inputBase =
  "w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-150";
const labelBase = "block text-sm text-zinc-400 mb-1.5";
const errorBase = "text-red-400 text-xs mt-1";

interface Props {
  values: {
    fullName: string;
    email: string;
    github: string;
    linkedin: string;
  };
  errors: {
    fullName?: string;
    email?: string;
    socialLinks?: string;
  };
  onChange: (field: string, value: string) => void;
}

export default function PersonalInfoSection({ values, errors, onChange }: Props) {
  return (
    <div className="space-y-8">
      {/* Section 1 — Personal Info */}
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.28em] text-zinc-600 mb-5">
          01 — Personal Info
        </p>
        <div className="space-y-4">
          <div>
            <label className={labelBase}>Full Name <span className="text-primary">*</span></label>
            <input
              className={inputBase}
              placeholder="Your full name"
              value={values.fullName}
              onChange={(e) => onChange("fullName", e.target.value)}
            />
            {errors.fullName && <p className={errorBase}>{errors.fullName}</p>}
          </div>
          <div>
            <label className={labelBase}>Email <span className="text-primary">*</span></label>
            <input
              className={inputBase}
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => onChange("email", e.target.value)}
            />
            {errors.email && <p className={errorBase}>{errors.email}</p>}
          </div>

        </div>
      </div>

      {/* Section 2 — Social Profiles */}
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.28em] text-zinc-600 mb-5">
          02 — Social Profiles
        </p>
        <p className="text-xs text-zinc-600 mb-4">At least one required.</p>
        <div className="space-y-4">
          <div>
            <label className={labelBase}>GitHub URL</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.3-1.55 3.3-1.23 3.3-1.23.66 1.65.24 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.48 5.93.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 24 12C24 5.37 18.63 0 12 0z"/>
                </svg>
              </span>
              <input
                className={`${inputBase} pl-9`}
                placeholder="https://github.com/yourhandle"
                value={values.github}
                onChange={(e) => onChange("github", e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className={labelBase}>LinkedIn URL</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.63-1.85 3.35-1.85 3.58 0 4.24 2.36 4.24 5.43v6.31zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45C23.2 24 24 23.23 24 22.28V1.72C24 .77 23.2 0 22.22 0z"/>
                </svg>
              </span>
              <input
                className={`${inputBase} pl-9`}
                placeholder="https://linkedin.com/in/yourhandle"
                value={values.linkedin}
                onChange={(e) => onChange("linkedin", e.target.value)}
              />
            </div>
          </div>
          {errors.socialLinks && <p className={errorBase}>{errors.socialLinks}</p>}
        </div>
      </div>
    </div>
  );
}
