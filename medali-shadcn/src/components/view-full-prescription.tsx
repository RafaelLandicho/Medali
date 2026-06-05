"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { Prescription } from "./view-prescriptions";
import html2canvas from "html2canvas-pro";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

type EditPrescriptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Prescription;
};

export function ViewFullPrescription({
  patient: prescription,
}: EditPrescriptionProps) {
  const { user } = useAuth();
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
      scale: 3,
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
    <div className="flex flex-col gap-6">
      {/* PRESCRIPTION PAPER */}
      <div className="overflow-auto max-h-[85vh] bg-gray-100 p-4 rounded-xl">
        <div
          ref={printRef}
          className="w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[13px] text-[#5a0033] font-sans"
        >
          {/* HEADER TITLE */}
          <div className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-bold tracking-wide text-[#7b003b] uppercase">
              Prescription Template
            </h1>
          </div>

          <div className="flex w-full h-3 mb-8">
            <div className="w-1/2 bg-red-500"></div>
            <div className="w-1/2 bg-orange-300"></div>
          </div>

          {/* RX NO + DATE */}
          <div className="grid grid-cols-2 gap-10 px-10 mb-8">
            <div>
              <p className="font-semibold">Prescription No.</p>
              <p>{fields.id}</p>
            </div>

            <div>
              <p className="font-semibold">Prescription Date</p>
              <p>{fields.createdAt}</p>
            </div>
          </div>

          {/* PATIENT INFO */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Patient Information
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8">
            <div>
              <p className="font-semibold">Name</p>
              <p>
                {fields.patientFirstName} {fields.patientLastName}
              </p>
            </div>

            <div>
              <p className="font-semibold">Age</p>
              <p>{fields.patientAge}</p>
            </div>

            {/* <div>
              <p className="font-semibold">Phone Number</p>
              <p>{fields.patientTelephone || "N/A"}</p>
            </div> */}

            <div>
              <p className="font-semibold">Gender</p>
              <p>{fields.patientGender}</p>
            </div>

            <div>
              <p className="font-semibold">Address</p>
              <p>{fields.patientAddress}</p>
            </div>

            <div>
              <p className="font-semibold">Examination</p>
              <p>{fields.examination}</p>
            </div>
          </div>

          {/* MEDICAL NOTES */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Medical Notes / Diagnosis
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8">
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

          {/* MEDICINE TABLE */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              List of Prescribed Medications
            </div>

            <table className="w-full border-collapse text-[12px] mb-12">
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
          </div>

          {/* FOOTER SIGNATURE */}
          <div className="grid grid-cols-2 px-10 mt-20 pb-20">
            <div>
              <p className="font-semibold">Physician Name</p>
              <p>Dr. {fields.addedBy}</p>

              <div className="mt-6">
                <p className="font-semibold">Prescription Date</p>
                <p>{fields.createdAt}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold">Physician License / ID</p>
              <p>{fields.doctorId}</p>

              <div className="mt-10 text-center">
                <div className="border-t border-black w-52 mx-auto"></div>
                <p className="mt-2 font-semibold">Physician Signature</p>
                <p>Dr. {fields.addedBy}</p>
                <p>{fields.field}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DOWNLOAD BUTTON */}
      <div className="flex justify-center">
        <Button
          onClick={handleDownloadImage}
          className="!bg-orange-500 hover:!bg-orange-600 !text-white px-8"
        >
          Download as Image
        </Button>
      </div>
    </div>
  );
}
