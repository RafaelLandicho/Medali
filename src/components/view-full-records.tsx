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
import {
  Download,
  Eye,
  Stethoscope,
  Heart,
  Users,
  FileText,
} from "lucide-react";

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
    <div className="flex flex-col gap-4 md:gap-6">
      {/* DOWNLOAD BUTTON - Sticky on mobile */}
      <div
        className={`${isMobile ? "sticky top-0 z-10 bg-gray-100 py-2" : ""}`}
      >
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
                <Button className="!bg-[#7b003b] text-white">
                  <Eye className="w-4 h-4 mr-2" />
                  Open
                </Button>
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
                <Download className="w-4 h-4 mr-2" />
                Download Medical Record
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* DOCUMENT */}
      <div className="overflow-auto max-h-[85vh] bg-gray-100 p-2 md:p-4 rounded-xl">
        <div
          ref={printRef}
          className="w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-gray-300 text-[11px] md:text-[13px] text-[#5a0033] font-sans"
        >
          {/* HEADER */}
          <div className="text-center pt-6 md:pt-10 pb-3 md:pb-4 px-4">
            <h1 className="text-xl md:text-3xl font-bold tracking-wide text-[#7b003b] uppercase">
              Medical Record
            </h1>
            {previousRecord !== null && (
              <p className="text-xs text-gray-500 mt-2">
                Viewing Historical Record {previousRecord + 1}
              </p>
            )}
          </div>

          <div className="flex w-full h-2 md:h-3 mb-4 md:mb-8">
            <div className="w-1/2 bg-red-500"></div>
            <div className="w-1/2 bg-orange-300"></div>
          </div>

          {/* RECORD NO + DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-10 px-4 md:px-10 mb-6 md:mb-8">
            <div>
              <p className="font-semibold text-xs md:text-sm">
                Medical Record No.
              </p>
              <p className="text-xs md:text-sm break-all">{fields.id}</p>
            </div>

            <div>
              <p className="font-semibold text-xs md:text-sm">Record Date</p>
              <p className="text-xs md:text-sm">
                {new Date().toLocaleDateString()}
              </p>
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
              value={`${showPrevious.firstName} ${showPrevious.lastName}`}
            />
            <Info label="Age" value={showPrevious.age} />
            <Info label="Gender" value={showPrevious.gender} />
            <Info label="Phone Number" value={showPrevious.telephone} />
            <Info label="Address" value={showPrevious.address} />
            <Info label="Symptoms" value={showPrevious.symptoms} />
          </div>

          {/* VITAL SIGNS */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              Vital Signs
            </div>
          </div>

          {isMobile ? (
            // Mobile Vital Signs - Card based
            <div className="grid grid-cols-2 gap-3 px-4 md:px-10 mb-6 md:mb-8">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-3 h-3 text-[#7b003b]" />
                  <p className="font-semibold text-xs">Blood Pressure</p>
                </div>
                <p className="text-sm">{showPrevious.bloodPressure || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Heart className="w-3 h-3 text-[#7b003b]" />
                  <p className="font-semibold text-xs">Heart Rate</p>
                </div>
                <p className="text-sm">{showPrevious.heartRate || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-xs mb-1">Respiratory Rate</p>
                <p className="text-sm">{showPrevious.respiratoryRate || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-xs mb-1">Temperature</p>
                <p className="text-sm">{showPrevious.temperature || "-"}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-xs mb-1">Oxygen Saturation</p>
                <p className="text-sm">
                  {showPrevious.oxygenSaturation || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="font-semibold text-xs mb-1">Height / Weight</p>
                <p className="text-sm">{`${showPrevious.height || "-"} / ${showPrevious.weight || "-"}`}</p>
              </div>
            </div>
          ) : (
            // Desktop Vital Signs
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
          )}

          {/* DIAGNOSIS */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              Diagnosis Report
            </div>

            {isMobile ? (
              // Mobile Diagnosis View - Card based
              <div className="space-y-3 mb-8">
                {showPrevious.patientDiagnosis?.length ? (
                  showPrevious.patientDiagnosis.map((diag, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 text-[#7b003b] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {diag.diagnosis || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Severity:</span>{" "}
                            {diag.severity || "-"}
                          </p>
                          {diag.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium">Notes:</span>{" "}
                              {diag.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No diagnosis available
                  </p>
                )}
              </div>
            ) : (
              // Desktop Diagnosis View - Table
              <table className="w-full border-collapse text-[11px] md:text-[12px] mb-8 md:mb-10">
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
                        <td className="p-2">{diag.diagnosis || "-"}</td>
                        <td className="p-2">{diag.severity || "-"}</td>
                        <td className="p-2">{diag.notes || "-"}</td>
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
            )}
          </div>

          {/* FAMILY HISTORY */}
          <div className="px-4 md:px-10">
            <div className="bg-orange-200 text-[#7b003b] font-bold px-2 md:px-3 py-1 mb-3 md:mb-4 text-xs md:text-sm">
              Family History
            </div>

            {isMobile ? (
              // Mobile Family History - Card based
              <div className="space-y-3 mb-8">
                {showPrevious.familyHistory?.length ? (
                  showPrevious.familyHistory.map((fh, i) => (
                    <div key={i} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-[#7b003b] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm">
                            {fh.relation || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium">Age:</span>{" "}
                            {fh.age || "-"}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium">Condition:</span>{" "}
                            {fh.healthProblems || "-"}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs">
                              <span className="font-medium">Healthy:</span>{" "}
                              {fh.goodHealth ? "Yes" : "No"}
                            </span>
                            <span className="text-xs">
                              <span className="font-medium">Alive:</span>{" "}
                              {fh.isAlive ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No family history recorded
                  </p>
                )}
              </div>
            ) : (
              // Desktop Family History - Table
              <table className="w-full border-collapse text-[11px] md:text-[12px] mb-8 md:mb-12">
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
                        <td className="p-2">{fh.relation || "-"}</td>
                        <td className="p-2">{fh.age || "-"}</td>
                        <td className="p-2">{fh.healthProblems || "-"}</td>
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
            )}
          </div>

          {/* FOOTER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-0 px-4 md:px-10 mt-10 md:mt-20 pb-10 md:pb-20">
            <div>
              <p className="font-semibold text-xs md:text-sm">
                Attending Physician
              </p>
              <p className="text-xs md:text-sm">
                Dr. {user?.firstName} {user?.lastName}
              </p>

              <div className="mt-4 md:mt-6">
                <p className="font-semibold text-xs md:text-sm">
                  Date Generated
                </p>
                <p className="text-xs md:text-sm">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-center mt-4 md:mt-0">
              <p className="font-semibold text-xs md:text-sm">
                Authorized Signature
              </p>
              <div className="border-t border-black w-full max-w-[200px] mx-auto mt-6 md:mt-10"></div>
              <p className="mt-2 text-xs md:text-sm">
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
  const isMobile = useIsMobile();

  return (
    <div>
      <p className="font-semibold text-xs md:text-sm">{label}</p>
      <p className="text-xs md:text-sm break-words">{value || "-"}</p>
    </div>
  );
}
