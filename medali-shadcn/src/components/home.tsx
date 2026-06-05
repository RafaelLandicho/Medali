"use client";

import { Button } from "./ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "./ui/field";

import homePic from "./images/home1.jpg";
import gCheck from "./images/gcheck.png";
import clockPic from "./images/clock.png";
import tabletPic from "./images/tablet.png";
import browserPic from "./images/browser.png";
import medicalPic from "./images/medicalRecords.jpg";
import prescriptionPic from "./images/prescriptionBig.jpg";
import analyticPic from "./images/analytics.jpg";
import aUIPic from "./images/analytics_ui.png";
import sUIPuc from "./images/secretary_UI.png";

export function Homepage() {
  return (
    <div className="w-full bg-white text-[#1f2a44]">
      {/* HERO SECTION */}
      <section className="min-h-screen grid md:grid-cols-2">
        {/* LEFT */}
        <div className="flex flex-col justify-center px-12 md:px-24 bg-[#f8f8f8]">
          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-8 text-[#1f2a44]">
            Manage your <br />
            patient records <br />
            and analytics in <br />
            one website.
          </h1>

          <div className="space-y-4 mb-10 text-xl text-gray-600">
            <div className="flex items-center gap-3">
              <img src={gCheck} className="w-5 h-5" />
              <p>Electronic Medical Records</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={gCheck} className="w-5 h-5" />
              <p>Digital Prescriptions</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={gCheck} className="w-5 h-5" />
              <p>Patient Analytics Dashboard</p>
            </div>
            <div className="flex items-center gap-3">
              <img src={gCheck} className="w-5 h-5" />
              <p>Collaborative User Accounts</p>
            </div>
          </div>

          <div className="flex max-w-xl">
            <Field className="w-full">
              <Input
                placeholder="Your email address"
                className="rounded-none h-14 text-lg border-[#1f2a44]"
              />
            </Field>

            <Button className="h-14 px-10 rounded-none bg-[#1f2a44] hover:bg-[#00a896] text-white text-lg">
              Get Started
            </Button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="bg-[#f4f4f4] flex items-center justify-center px-10">
          <div className="relative">
            <div className="absolute -inset-8 bg-[#00a896]/10 blur-3xl rounded-3xl"></div>
            <img
              src={homePic}
              className="relative w-full max-w-2xl rounded-3xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* TRUST ROW */}
      <section className="py-20 border-y bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 text-center">
          <div className="flex flex-col items-center gap-4 border-r">
            <img src={clockPic} className="w-20 h-20" />
            <h3 className="text-3xl font-bold">Save Time</h3>
          </div>

          <div className="flex flex-col items-center gap-4 border-r">
            <img src={browserPic} className="w-20 h-20" />
            <h3 className="text-3xl font-bold">Be Updated</h3>
          </div>

          <div className="flex flex-col items-center gap-4">
            <img src={tabletPic} className="w-20 h-20" />
            <h3 className="text-3xl font-bold">Go Digital</h3>
          </div>
        </div>
      </section>

      {/* SECTION 1 */}
      <section className="py-28 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center px-10">
        <div>
          <img src={medicalPic} className="w-full rounded-3xl shadow-xl" />
        </div>

        <div>
          <h2 className="text-5xl font-bold mb-8 text-[#1f2a44]">
            Electronic Medical Records
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Store, manage, and retrieve complete patient medical histories in a
            secure centralized system. Access medications, treatment plans,
            allergies, test results, and consultations in seconds.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed">
            Medali helps practitioners reduce paperwork, streamline clinical
            workflows, and make better healthcare decisions through organized
            digital records.
          </p>
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="py-28 bg-[#fafafa]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center px-10">
          <div>
            <h2 className="text-5xl font-bold mb-8 text-[#1f2a44]">
              Digital Prescriptions
            </h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Easily issue, monitor, and organize prescriptions digitally.
              Doctors can review medication history instantly, minimize writing
              errors, and ensure all patient prescriptions remain traceable in
              one place.
            </p>
          </div>

          <div>
            <img
              src={prescriptionPic}
              className="w-full rounded-3xl shadow-xl"
            />
          </div>
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="py-28 max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center px-10">
        <div>
          <img src={analyticPic} className="w-full rounded-3xl shadow-xl" />
        </div>

        <div>
          <h2 className="text-5xl font-bold mb-8 text-[#1f2a44]">
            Reports & Analytics
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Gain actionable insights from patient trends, prescription counts,
            monthly consultations, and clinic performance with beautiful visual
            dashboards and dynamic reports.
          </p>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-28 bg-[#f8f8f8]">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 px-10">
          <div className="space-y-5">
            <img src={aUIPic} className="w-14 h-14" />
            <h3 className="text-3xl font-bold">Analytics & Insights</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Monitor patient visits, common prescriptions, and generate clinic
              reports with just a few clicks.
            </p>
          </div>

          <div className="space-y-5">
            <img src={sUIPuc} className="w-14 h-14" />
            <h3 className="text-3xl font-bold">Collaborate with Doctors</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Refer patients, share records, and collaborate with healthcare
              professionals securely.
            </p>
          </div>

          <div className="space-y-5">
            <img src={sUIPuc} className="w-14 h-14" />
            <h3 className="text-3xl font-bold">Staff Management</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Add nurses and secretaries while controlling their access levels
              efficiently.
            </p>
          </div>

          <div className="space-y-5">
            <img src={browserPic} className="w-14 h-14" />
            <h3 className="text-3xl font-bold">Offline Access</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              Continue working even without internet and sync once connection is
              restored.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
