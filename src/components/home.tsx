"use client";

import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./ui/field";

import homePic from "./images/home1.jpg";
import medicalPic from "./images/medicalRecords.jpg";
import prescriptionPic from "./images/prescriptionBig.jpg";
import analyticPic from "./images/analytics.jpg";

export function Homepage() {
  return (
    <div className="w-full !bg-white text-[#e8edf5] font-sans">
      {/* UPSIDE PART NEEDS WORK */}
      <section className="min-h-screen grid md:grid-cols-2 items-center px-10 md:px-14 py-24 gap-16 max-w-7xl mx-auto">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.07] tracking-tight text-black mb-6">
            Your clinic's records,{" "}
            <em className="not-italic text-[#00c4b4]">reimagined</em> for the
            digital age.
          </h1>

          <p className="text-lg text-black/75 leading-relaxed mb-10 max-w-md font-semibold">
            Medali centralizes patient records, prescriptions, and analytics
            into a single platform — so your team spends less time on paperwork
            and more time on caring for your patients and other
            responsibilities.
          </p>

          <div className="flex max-w-md mb-8">
            <Field className="w-full">
              <Input
                placeholder="Your work email"
                className="rounded-l-lg rounded-r-none h-12 text-base bg-white border-black text-white placeholder:text-white/30 focus:border-[#00c4b4]"
              />
            </Field>
            <Button className="h-12 px-6 rounded-l-none rounded-r-lg !bg-[#00c4b4] hover:bg-[#00a896] text-white font-bold text-base whitespace-nowrap">
              Get started Now
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {[
              "Electronic Medical Records",
              "Digital Prescriptions",
              "Analytics Dashboard",
              "Team Accounts",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 text-m text-[#00c4b4]"
              >
                <span className="w-4 h-4 rounded-full bg-[#00c4b4]/15 flex items-center justify-center">
                  <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                    <path
                      d="M2 5l2 2 4-4"
                      stroke="#04a093"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative flex items-center justify-center">
          <div className="absolute inset-0 bg-[#00c4b4]/10 blur-3xl rounded-full scale-75 pointer-events-none" />
          <img
            src={homePic}
            className="relative w-full max-w-xl rounded-2xl shadow-2xl border border-white/8"
            alt="Medali dashboard"
          />
        </div>
      </section>

      {/* TRUST ROW */}
      <section className="border-y border-white/7 !bg-[#080f1a]">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3">
          {[
            {
              label: "Save Time",
              desc: "Instant record retrieval, no more paper hunting",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
              ),
            },
            {
              label: "Stay Updated",
              desc: "Real-time sync across your entire care team",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <path d="M4 12a8 8 0 0114.93-4M20 12a8 8 0 01-14.93 4" />
                  <path d="M18 4l2 4-4.5.5M6 20l-2-4 4.5-.5" />
                </svg>
              ),
            },
            {
              label: "Go Digital",
              desc: "Accessible on any device, anywhere you work",
              icon: (
                <svg
                  viewBox="0 0 24 24"
                  className="w-6 h-6 "
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                >
                  <rect x="5" y="3" width="14" height="18" rx="2" />
                  <path d="M9 7h6M9 11h6M9 15h4" />
                </svg>
              ),
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className={`flex flex-col items-center gap-4 py-14 px-10 text-center ${i < 2 ? "md:border-r border-white/7" : ""}`}
            >
              <div className="w-12 h-12 rounded-xl bg-[#00c4b4]/10 border border-[#00c4b4]/20 flex items-center justify-center text-[#00c4b4]">
                {item.icon}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">
                  {item.label}
                </h3>
                <p className="text-sm text-white leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURE SECTIONS */}
      {/* Section 1 — EMR */}
      <section className="py-28 px-10 md:px-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
            <img
              src={medicalPic}
              className="w-full h-full object-cover"
              alt="Medical Records"
            />
          </div>
          <div>
            <p className="text-s font-semibold !text-[#00c4b4] uppercase tracking-widest mb-4">
              Electronic Medical Records
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-6 leading-tight">
              Complete patient histories, in seconds.
            </h2>
            <p className="text-base text-black leading-relaxed mb-4 font-semibold">
              Store and retrieve full medical histories — medications, treatment
              plans, allergies, test results, and consultations — from a single
              secure system.
            </p>
            <p className="text-base text-black leading-relaxed font-semibold">
              Medali reduces paperwork, streamlines clinical workflows, and
              helps practitioners make better decisions through organized
              digital records.
            </p>
          </div>
        </div>
      </section>

      {/* Section 2 — Prescriptions */}
      <section className="py-28 px-10 md:px-14 bg-[#0a1422]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div>
            <p className="text-xs font-semibold text-[#00c4b4] uppercase tracking-widest mb-4">
              Digital Prescriptions
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              Issue prescriptions without the paper trail.
            </h2>
            <p className="text-base text-white leading-relaxed font-semibold">
              Issue, monitor, and organize prescriptions digitally. Review full
              medication histories instantly, eliminate writing errors, and keep
              all prescriptions traceable in one place.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
            <img
              src={prescriptionPic}
              className="w-full h-full object-cover"
              alt="Digital Prescriptions"
            />
          </div>
        </div>
      </section>

      {/* Section 3 — Analytics */}
      <section className="py-28 px-10 md:px-14">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="rounded-2xl overflow-hidden border border-white/8 shadow-2xl">
            <img
              src={analyticPic}
              className="w-full h-full object-cover"
              alt="Analytics"
            />
          </div>
          <div>
            <p className="text-m font-semibold text-[#00c4b4] uppercase tracking-widest mb-4">
              Reports & Analytics
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-6 leading-tight">
              Insights that help you run a better clinic.
            </h2>
            <p className="text-base text-black leading-relaxed font-semibold">
              Track patient trends, prescription counts, monthly consultations,
              and clinic performance with visual dashboards and dynamic reports
              — all in real time.
            </p>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-28 px-10 md:px-14 bg-[#080f1a]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold text-[#00c4b4] uppercase tracking-widest mb-4">
              Everything you need
            </p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white">
              Built for every role in your clinic
            </h2>
          </div>

          <div className="grid md:grid-cols-2 border border-white/7 rounded-2xl overflow-hidden">
            {[
              {
                title: "Analytics & Insights",
                desc: "Monitor patient records and prescriptions, track common diagnoses, and generate full medical reports with just a few clicks.",
                icon: (
                  <path
                    d="M3 18l4-8 4 4 3-6 4 10"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                ),
              },
              {
                title: "Collaborate with Secretaries",
                desc: "Refer patients, share records, and collaborate with trusted secretaries in real time.",
                icon: (
                  <>
                    <circle
                      cx="9"
                      cy="7"
                      r="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                    />
                    <path
                      d="M3 20c0-3.3 2.7-6 6-6"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle
                      cx="17"
                      cy="12"
                      r="2.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                    />
                    <path
                      d="M13 20c0-2.5 1.8-4.5 4-4.5s4 2 4 4.5"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                ),
              },
              {
                title: "User Management",
                desc: "Add doctors and secretaries while controlling exactly what each person can view and edit.",
                icon: (
                  <>
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      fill="none"
                    />
                    <path
                      d="M7 11V7a5 5 0 0110 0v4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </>
                ),
              },
              {
                title: "View Doctor Information",
                desc: "View registered doctor and secretary information from their current clinic schedule, field of expertise, education and etc.",
                icon: (
                  <>
                    <path
                      d="M12 12a4 4 0 100-8 4 4 0 000 8zm-7 9a7 7 0 0114 0"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <circle cx="12" cy="16" r="1.5" fill="currentColor" />
                  </>
                ),
              },
            ].map((feat, i) => (
              <div
                key={feat.title}
                className={[
                  "p-10 bg-[#0b1525] hover:bg-[#0f1f35] transition-colors",
                  i < 2 ? "border-b border-white/7" : "",
                  i % 2 === 0 ? "md:border-r border-white/7" : "",
                ].join(" ")}
              >
                <div className="w-11 h-11 rounded-xl bg-[#00c4b4]/10 border border-[#00c4b4]/20 flex items-center justify-center text-[#00c4b4] mb-5">
                  <svg viewBox="0 0 24 24" className="w-5 h-5">
                    {feat.icon}
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {feat.title}
                </h3>
                <p className="text-sm text-white leading-relaxed font-semibold">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-10 md:px-14 text-center bg-[#0a1422]">
        <div className="max-w-xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-5">
            Ready to go{" "}
            <em className="not-italic text-[#00c4b4]">fully digital?</em>
          </h2>
          <p className="text-base text-white font-semibold mb-10">
            Join hundreds of clinics already using Medali to modernize patient
            care.
          </p>
          <div className="flex max-w-md mx-auto">
            <Field className="w-full">
              <Input
                placeholder="Your work email"
                className="rounded-l-lg rounded-r-none h-12 text-base bg-white/5 border-white/10 text-white placeholder:text-white focus:border-[#00c4b4] focus:ring-0"
              />
            </Field>
            <Button className="h-12 px-6 rounded-l-none rounded-r-lg !bg-[#00c4b4] hover:bg-[#00a896] text-white font-semibold whitespace-nowrap">
              Get started Now
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="px-10 md:px-14 py-8 border-t border-white/6 flex items-center justify-between bg-[#080f1a]">
        <span className="text-base font-bold text-white/35">
          meda<span className="text-[#00c4b4]">li</span>
        </span>
        <p className="text-sm text-white/20">
          © 2026 Medali. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
