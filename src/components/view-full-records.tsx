"use client";

import { useState, useEffect, useRef } from "react";
import type { Patient } from "./medical_records";
import html2canvas from "html2canvas-pro";
import { Button } from "@/components/ui/button";
import { db } from "@/firebaseConfig";
import { ref, set, push } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, Eye } from "lucide-react";

type FullDetails = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function ViewFullPatient({ patient }: FullDetails) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [fields, setFields] = useState(patient);
  const printRef = useRef<HTMLDivElement>(null);
  const [previousRecord, setPreviousRecord] = useState<number | null>(null);

  const logsRef = ref(db, "logs/");

  const updateLog = async () => {
    const newLog = push(logsRef);
    await set(newLog, {
      medicalRecordLog: `Medical Record ${fields.id} ${fields.firstName} ${fields.lastName} downloaded by ${user?.firstName} ${user?.lastName}`,
      logTime: new Date().toLocaleString(),
    });
  };

  useEffect(() => {
    setFields(patient);
  }, [patient]);

  const medicalHistory = Object.values(fields.medicalHistory || {});
  const showPrevious =
    previousRecord === null ? fields : medicalHistory[previousRecord];

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
    link.download = `${fields.firstName}_${fields.lastName}_MedicalRecord.png`;
    link.click();

    updateLog();
  };

  // Mobile Record Selector - Dropdown version
  const MobileRecordSelector = () => (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <Button
          onClick={() => setPreviousRecord(null)}
          className={`flex-1 ${previousRecord === null ? "!bg-orange-500 text-white" : "!bg-gray-200 text-gray-700"}`}
        >
          Current Record
        </Button>
        <Button
          onClick={handleDownloadImage}
          className="flex-1 !bg-orange-500 hover:!bg-orange-600 text-white"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {medicalHistory.length > 0 && (
        <Select
          value={previousRecord?.toString() || ""}
          onValueChange={(value) => {
            if (value === "current") {
              setPreviousRecord(null);
            } else {
              setPreviousRecord(parseInt(value));
            }
          }}
        >
          <SelectTrigger className="w-full !bg-white border-gray-300">
            <SelectValue placeholder="Select previous record" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Current Record</SelectItem>
            {medicalHistory.map((_, index) => (
              <SelectItem key={index} value={index.toString()}>
                Record {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6">
      {/* RECORD SELECTOR */}
      {isMobile ? (
        <MobileRecordSelector />
      ) : (
        <div className="flex flex-wrap justify-center gap-2">
          <Button
            onClick={() => setPreviousRecord(null)}
            className={
              previousRecord === null
                ? "!bg-orange-500 text-white"
                : "!bg-gray-200 text-gray-700"
            }
          >
            Current Record
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="!bg-[#7b003b] text-white">Open</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuGroup>
                {medicalHistory.map((_, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setPreviousRecord(index)}
                  >
                    Record {index + 1}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* DOWNLOAD */}
          <div className="flex justify-center">
            <Button
              onClick={handleDownloadImage}
              className="!bg-orange-500 hover:!bg-orange-600 text-white px-8"
            >
              Download Medical Record
            </Button>
          </div>
        </div>
      )}

      {/* DOCUMENT */}
      <div className="overflow-auto max-h-[85vh] bg-gray-100 p-4 rounded-xl">
        <div
          ref={printRef}
          className="w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[13px] text-[#5a0033] font-sans"
        >
          {/* HEADER */}
          <div className="text-center pt-10 pb-4">
            <h1 className="text-3xl font-bold tracking-wide text-[#7b003b] uppercase">
              Medical Record
            </h1>
          </div>

          <div className="flex w-full h-3 mb-8">
            <div className="w-1/2 bg-red-500"></div>
            <div className="w-1/2 bg-orange-300"></div>
          </div>

          {/* RECORD NO + DATE */}
          <div className="grid grid-cols-2 gap-10 px-10 mb-8">
            <div>
              <p className="font-semibold">Medical Record No.</p>
              <p>{fields.id}</p>
            </div>

            <div>
              <p className="font-semibold">Record Date</p>
              <p>{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* PATIENT INFO */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Patient Information
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-x-14 px-10 mb-8">
            <Info
              label="Name"
              value={`${showPrevious.firstName} ${showPrevious.lastName}`}
            />
            <Info label="Age" value={showPrevious.age} />
            <Info label="Gender" value={showPrevious.gender} />
            <Info label="Phone Number" value={showPrevious.telephone} />
            <Info label="Address" value={showPrevious.address} />
            <Info label="Symptoms" value={showPrevious.symptoms} />
          </div>

          {/* VITAL SIGNS */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Vital Signs
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-14 gap-y-4 px-10 mb-8">
            <Info label="Blood Pressure" value={showPrevious.bloodPressure} />
            <Info label="Heart Rate" value={showPrevious.heartRate} />
            <Info
              label="Respiratory Rate"
              value={showPrevious.respiratoryRate}
            />
            <Info label="Temperature" value={showPrevious.temperature} />
            <Info
              label="Oxygen Saturation"
              value={showPrevious.oxygenSaturation}
            />
            <Info
              label="Height / Weight"
              value={`${showPrevious.height} / ${showPrevious.weight}`}
            />
          </div>

          {/* DIAGNOSIS */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Diagnosis Report
            </div>

            <table className="w-full border-collapse text-[12px] mb-10">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Diagnosis</th>
                  <th className="p-2">Severity</th>
                  <th className="p-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {showPrevious.patientDiagnosis?.length ? (
                  showPrevious.patientDiagnosis.map((diag, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{diag.diagnosis}</td>
                      <td className="p-2">{diag.severity}</td>
                      <td className="p-2">{diag.notes}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-3 text-center">
                      No diagnosis available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FAMILY HISTORY */}
          <div className="px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-3 py-1 mb-4">
              Family History
            </div>

            <table className="w-full border-collapse text-[12px] mb-12">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Relation</th>
                  <th className="p-2">Age</th>
                  <th className="p-2">Condition</th>
                  <th className="p-2">Healthy</th>
                  <th className="p-2">Alive</th>
                </tr>
              </thead>
              <tbody>
                {showPrevious.familyHistory?.length ? (
                  showPrevious.familyHistory.map((fh, i) => (
                    <tr key={i} className="border-b">
                      <td className="p-2">{fh.relation}</td>
                      <td className="p-2">{fh.age}</td>
                      <td className="p-2">{fh.healthProblems}</td>
                      <td className="p-2">{fh.goodHealth ? "Yes" : "No"}</td>
                      <td className="p-2">{fh.isAlive ? "Yes" : "No"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-3 text-center">
                      No family history recorded
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 px-6 md:px-10 mt-20 pb-20 gap-5">
            <div className="px-29 md:px-6 ">
              <p className="font-semibold">Attending Physician</p>
              <p>
                Dr. {user?.firstName} {user?.lastName}
              </p>

              <div className="mt-6">
                <p className="font-semibold">Date Generated</p>
                <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="text-center">
              <p className="font-semibold">Authorized Signature</p>
              <div className="border-t border-black w-52 mx-auto mt-10"></div>
              <p className="mt-2">
                Dr. {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="font-semibold">{label}</p>
      <p>{value || "-"}</p>
    </div>
  );
}
