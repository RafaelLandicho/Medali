"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Prescription } from "./view-prescriptions";
import html2canvas from "html2canvas-pro";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, FileText, Pill, Stethoscope } from "lucide-react";

type EditPrescriptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Prescription;
};

export function ViewFullPrescription({
  patient: prescription,
}: EditPrescriptionProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [fields, setFields] = useState(prescription);
  const [drugs, setDrugs] = useState(prescription.drugs || []);
  const [diagnosis, setDiagnosis] = useState(prescription.diagnosis || []);
  const printRef = useRef<HTMLDivElement>(null);

  const logsRef = ref(db, "logs/");

  const updateLog = async () => {
    const newLog = push(logsRef);
    await set(newLog, {
      prescriptionLog: `Prescription ${fields.id} ${fields.patientFirstName} ${fields.patientLastName} downloaded by ${user?.firstName} ${user?.lastName}`,
      logTime: new Date().toLocaleString(),
    });
  };

  useEffect(() => {
    setFields(prescription);
    setDrugs(prescription.drugs || []);
    setDiagnosis(prescription.diagnosis || []);
  }, [prescription]);

  const handleDownloadImage = async () => {
    if (!printRef.current) return;

    const canvas = await html2canvas(printRef.current, {
      scale: isMobile ? 2 : 3,
      useCORS: true,
      backgroundColor: "#ffffff",
      scrollY: -window.scrollY,
      windowWidth: printRef.current.scrollWidth,
      windowHeight: printRef.current.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imgData;
    link.download = `${fields.patientFirstName}_${fields.patientLastName}_Prescription.png`;
    link.click();

    updateLog();
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* DOWNLOAD BUTTON - Sticky on mobile */}
      <div
        className={`${isMobile ? "sticky top-0 z-10 bg-gray-100 py-2" : ""}`}
      >
        <div className="flex justify-center">
          <Button
            onClick={handleDownloadImage}
            className="!bg-orange-500 hover:!bg-orange-600 !text-white px-6 md:px-8 w-full md:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Download as Image
          </Button>
        </div>
      </div>

      {/* PRESCRIPTION PAPER */}
      <div className="overflow-auto max-h-[85vh] bg-gray-100 p-2 md:p-4 rounded-xl">
        <div
          ref={printRef}
          className="w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[11px] md:text-[13px] text-[#5a0033] font-sans"
        >
          {/* HEADER TITLE */}
          <div className="text-center pt-6 md:pt-10 pb-3 md:pb-4 px-4">
            <h1 className="text-xl md:text-3xl font-bold tracking-wide text-[#7b003b] uppercase">
              Prescription Template
            </h1>
          </div>

          <div className="flex w-full h-2 md:h-3 mb-4 md:mb-8">
            <div className="w-1/2 bg-red-500"></div>
            <div className="w-1/2 bg-orange-300"></div>
          </div>

          {/* RX NO + DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-10 px-4 md:px-10 mb-6 md:mb-8">
            <div>
              <p className="font-semibold text-xs md:text-sm">
                Prescription No.
              </p>
              <p className="text-xs md:text-sm break-all">{fields.id}</p>
            </div>

            <div>
              <p className="font-semibold text-xs md:text-sm">
                Prescription Date
              </p>
              <p className="text-xs md:text-sm">{fields.createdAt}</p>
            </div>
          </div>

          {/* PATIENT INFO */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              Patient Information
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 md:gap-x-14 px-4 md:px-10 mb-6 md:mb-8">
            <Info
              label="Name"
              value={`${fields.patientFirstName} ${fields.patientLastName}`}
            />
            <Info label="Age" value={fields.patientAge} />
            <Info label="Gender" value={fields.patientGender} />
            <Info label="Address" value={fields.patientAddress} />
            <Info label="Examination" value={fields.examination} />
          </div>

          {/* MEDICAL NOTES / DIAGNOSIS */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              Medical Notes / Diagnosis
            </div>
          </div>

          <div className="px-4 md:px-10 mb-6 md:mb-8">
            {isMobile ? (
              // Mobile Diagnosis View
              <div className="space-y-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Stethoscope className="w-4 h-4 text-[#7b003b]" />
                    <p className="font-semibold text-sm">Diagnosis</p>
                  </div>
                  {Array.isArray(diagnosis) && diagnosis.length > 0 ? (
                    <div className="space-y-2">
                      {diagnosis.map((d, i) => (
                        <div
                          key={i}
                          className="border-l-2 border-orange-300 pl-3"
                        >
                          <p className="text-sm font-medium">{d.diagnosis}</p>
                          <p className="text-xs text-gray-600">
                            Severity: {d.severity}
                          </p>
                          {d.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              {d.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No diagnosis listed</p>
                  )}
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-semibold text-sm mb-2">Recommendation</p>
                  <p className="text-sm">{fields.recommendation || "None"}</p>
                </div>
              </div>
            ) : (
              // Desktop Diagnosis View
              <div className="grid grid-cols-2 gap-x-14 gap-y-4">
                <div>
                  <p className="font-semibold mb-1">Diagnosis</p>
                  {Array.isArray(diagnosis) && diagnosis.length > 0 ? (
                    diagnosis.map((d, i) => (
                      <p key={i}>
                        • {d.diagnosis} — {d.severity} {d.notes}
                      </p>
                    ))
                  ) : (
                    <p>No diagnosis listed</p>
                  )}
                </div>

                <div>
                  <p className="font-semibold mb-1">Recommendation</p>
                  <p>{fields.recommendation || "None"}</p>
                </div>
              </div>
            )}
          </div>

          {/* MEDICINE TABLE */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              List of Prescribed Medications
            </div>

            {isMobile ? (
              // Mobile Medications View - Card based
              <div className="space-y-3 mb-8">
                {Array.isArray(drugs) && drugs.length > 0 ? (
                  drugs.map((drug, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start gap-2 mb-2">
                        <Pill className="w-4 h-4 text-[#7b003b] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {drug.medicine}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Purpose:</span>{" "}
                            {drug.purpose}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div>
                              <p className="text-xs text-gray-500">Dosage</p>
                              <p className="text-sm">
                                {drug.dosage} {drug.unit}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Frequency</p>
                              <p className="text-sm">{drug.frequency}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No prescribed medications
                  </p>
                )}
              </div>
            ) : (
              // Desktop Medications View - Table
              <table className="w-full border-collapse text-[11px] md:text-[12px] mb-8 md:mb-12">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-2">Medication Name</th>
                    <th className="p-2">Purpose</th>
                    <th className="p-2">Dosage</th>
                    <th className="p-2">Frequency</th>
                  </tr>
                </thead>

                <tbody>
                  {Array.isArray(drugs) && drugs.length > 0 ? (
                    drugs.map((drug, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{drug.medicine}</td>
                        <td className="p-2">{drug.purpose}</td>
                        <td className="p-2">
                          {drug.dosage} {drug.unit}
                        </td>
                        <td className="p-2">{drug.frequency}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center">
                        No prescribed medications
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* FOOTER SIGNATURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 px-4 md:px-10 mt-10 md:mt-20 pb-10 md:pb-20">
            <div>
              <p className="font-semibold text-xs md:text-sm">Physician Name</p>
              <p className="text-xs md:text-sm">Dr. {fields.addedBy}</p>

              <div className="mt-4 md:mt-6">
                <p className="font-semibold text-xs md:text-sm">
                  Prescription Date
                </p>
                <p className="text-xs md:text-sm">{fields.createdAt}</p>
              </div>
            </div>

            <div className="mt-4 md:mt-0">
              <p className="font-semibold text-xs md:text-sm">
                Physician License / ID
              </p>
              <p className="text-xs md:text-sm">{fields.doctorId}</p>

              <div className="mt-6 md:mt-10 text-center">
                <div className="border-t border-black w-full max-w-[200px] mx-auto"></div>
                <p className="mt-2 font-semibold text-xs md:text-sm">
                  Physician Signature
                </p>
                <p className="text-xs md:text-sm">Dr. {fields.addedBy}</p>
                <p className="text-xs md:text-sm">{fields.field}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  const isMobile = useIsMobile();

  return (
    <div>
      <p className="font-semibold text-xs md:text-sm">{label}</p>
      <p className="text-xs md:text-sm break-words">{value || "-"}</p>
    </div>
  );
}
