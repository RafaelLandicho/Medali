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
  ClipboardList,
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
          className={`flex-1 font-semibold transition-all ${
            previousRecord === null
              ? "!bg-[#00a896] text-white shadow-md"
              : "!bg-white text-[#00a896] border border-[#00a896]"
          }`}
        >
          Current Record
        </Button>
        <Button
          onClick={handleDownloadImage}
          className="flex-1 !bg-[#ff6b6b] hover:!bg-[#e05555] text-white font-semibold shadow-md transition-all"
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
          <SelectTrigger className="w-full !bg-white border-[#00a896] text-[#007a6e] focus:ring-[#00a896]">
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
      {/* TOOLBAR */}
      <div
        className={`${
          isMobile
            ? "sticky top-0 z-10 bg-[#f0faf9] py-2 px-2 rounded-xl shadow-sm"
            : ""
        }`}
      >
        {isMobile ? (
          <MobileRecordSelector />
        ) : (
          <div className="flex flex-wrap justify-center gap-2">
            {/* Current Record Button */}
            <Button
              onClick={() => setPreviousRecord(null)}
              className={`font-semibold transition-all ${
                previousRecord === null
                  ? "!bg-[#00a896] text-white shadow-md"
                  : "!bg-white text-[#00a896] border border-[#00a896] hover:!bg-[#e6f7f5]"
              }`}
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Current Record
            </Button>

            {/* History Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="!bg-[#007a6e] hover:!bg-[#006058] text-white font-semibold shadow-md transition-all">
                  <Eye className="w-4 h-4 mr-2" />
                  History
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="border-[#00a896]/30 shadow-lg">
                <DropdownMenuGroup>
                  {medicalHistory.map((_, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => setPreviousRecord(index)}
                      className="cursor-pointer hover:bg-[#e6f7f5] focus:bg-[#e6f7f5] text-[#007a6e]"
                    >
                      Record {index + 1}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Download Button */}
            <Button
              onClick={handleDownloadImage}
              className="!bg-[#ff6b6b] hover:!bg-[#e05555] text-white font-semibold px-8 shadow-md transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Medical Record
            </Button>
          </div>
        )}
      </div>

      {/* DOCUMENT WRAPPER */}
      <div className="overflow-auto max-h-[85vh] bg-[#e6f7f5] p-2 md:p-4 rounded-xl">
        <div
          ref={printRef}
          className="w-full max-w-[794px] min-h-[1123px] bg-white mx-auto shadow-xl border border-[#b2e4df] text-[11px] md:text-[13px] text-[#004d45] font-sans"
        >
          {/* HEADER */}
          <div className="text-center pt-6 md:pt-10 pb-3 md:pb-4 px-4 bg-gradient-to-br from-[#00a896]/10 to-white">
            <div className="flex justify-center mb-2 md:mb-3">
              <div className="bg-[#00a896]/10 rounded-full p-2 md:p-3">
                <FileText className="w-6 h-6 md:w-8 md:h-8 text-[#00a896]" />
              </div>
            </div>
            <h1 className="text-xl md:text-3xl font-bold tracking-wide text-[#00a896] uppercase">
              Medical Record
            </h1>
            <p className="text-[10px] md:text-xs text-[#007a6e]/60 mt-1 tracking-widest uppercase">
              Confidential Patient Document
            </p>
            {previousRecord !== null && (
              <span className="inline-block mt-2 text-xs bg-amber-100 text-amber-700 border border-amber-300 rounded-full px-3 py-0.5">
                Viewing Historical Record {previousRecord + 1}
              </span>
            )}
          </div>

          {/* Accent bar */}
          <div className="flex w-full h-2 md:h-3 mb-4 md:mb-8">
            <div className="w-1/2 bg-[#00a896]"></div>
            <div className="w-1/2 bg-[#ffd166]"></div>
          </div>

          {/* RECORD NO + DATE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-10 px-4 md:px-10 mb-6 md:mb-8">
            <div>
              <p className="font-semibold text-xs md:text-sm text-[#00a896]">
                Medical Record No.
              </p>
              <p className="text-xs md:text-sm break-all text-[#004d45]">
                {fields.id}
              </p>
            </div>
            <div>
              <p className="font-semibold text-xs md:text-sm text-[#00a896]">
                Record Date
              </p>
              <p className="text-xs md:text-sm text-[#004d45]">
                {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* ── PATIENT INFORMATION ── */}
          <SectionHeader label="Patient Information" />

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

          {/* ── VITAL SIGNS ── */}
          <SectionHeader label="Vital Signs" />

          {isMobile ? (
            <div className="grid grid-cols-2 gap-3 px-4 md:px-10 mb-6 md:mb-8">
              <VitalCard
                icon={<Heart className="w-3 h-3 text-[#ff6b6b]" />}
                label="Blood Pressure"
                value={showPrevious.bloodPressure}
              />
              <VitalCard
                icon={<Heart className="w-3 h-3 text-[#ff6b6b]" />}
                label="Heart Rate"
                value={showPrevious.heartRate}
              />
              <VitalCard
                label="Respiratory Rate"
                value={showPrevious.respiratoryRate}
              />
              <VitalCard label="Temperature" value={showPrevious.temperature} />
              <VitalCard
                label="Oxygen Saturation"
                value={showPrevious.oxygenSaturation}
              />
              <VitalCard
                label="Height / Weight"
                value={`${showPrevious.height || "-"} / ${showPrevious.weight || "-"}`}
              />
            </div>
          ) : (
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

          {/* ── DIAGNOSIS REPORT ── */}
          <div className="px-4 md:px-10">
            <SectionHeader label="Diagnosis Report" />

            {isMobile ? (
              <div className="space-y-3 mb-8">
                {showPrevious.patientDiagnosis?.length ? (
                  showPrevious.patientDiagnosis.map((diag, i) => (
                    <div
                      key={i}
                      className="border border-[#b2e4df] rounded-xl p-3 bg-[#f0faf9]"
                    >
                      <div className="flex items-start gap-2">
                        <Stethoscope className="w-4 h-4 text-[#00a896] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#004d45]">
                            {diag.diagnosis || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium text-[#007a6e]">
                              Severity:
                            </span>{" "}
                            {diag.severity || "-"}
                          </p>
                          {diag.notes && (
                            <p className="text-xs text-gray-500 mt-1">
                              <span className="font-medium text-[#007a6e]">
                                Notes:
                              </span>{" "}
                              {diag.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4 italic">
                    No diagnosis available
                  </p>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse text-[11px] md:text-[12px] mb-8 md:mb-10">
                <thead>
                  <tr className="bg-[#e6f7f5] text-left text-[#007a6e]">
                    <th className="p-2 rounded-tl-lg">Diagnosis</th>
                    <th className="p-2">Severity</th>
                    <th className="p-2 rounded-tr-lg">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {showPrevious.patientDiagnosis?.length ? (
                    showPrevious.patientDiagnosis.map((diag, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#e6f7f5] hover:bg-[#f7fdfc] transition-colors"
                      >
                        <td className="p-2">{diag.diagnosis || "-"}</td>
                        <td className="p-2">{diag.severity || "-"}</td>
                        <td className="p-2">{diag.notes || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-center text-gray-400 italic"
                      >
                        No diagnosis available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* ── FAMILY HISTORY ── */}
          <div className="px-4 md:px-10">
            <SectionHeader label="Family History" />

            {isMobile ? (
              <div className="space-y-3 mb-8">
                {showPrevious.familyHistory?.length ? (
                  showPrevious.familyHistory.map((fh, i) => (
                    <div
                      key={i}
                      className="border border-[#b2e4df] rounded-xl p-3 bg-[#f0faf9]"
                    >
                      <div className="flex items-start gap-2">
                        <Users className="w-4 h-4 text-[#00a896] mt-0.5" />
                        <div className="flex-1">
                          <p className="font-semibold text-sm text-[#004d45]">
                            {fh.relation || "-"}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            <span className="font-medium text-[#007a6e]">
                              Age:
                            </span>{" "}
                            {fh.age || "-"}
                          </p>
                          <p className="text-xs text-gray-600">
                            <span className="font-medium text-[#007a6e]">
                              Condition:
                            </span>{" "}
                            {fh.healthProblems || "-"}
                          </p>
                          <div className="flex gap-4 mt-2">
                            <span className="text-xs">
                              <span className="font-medium text-[#007a6e]">
                                Healthy:
                              </span>{" "}
                              {fh.goodHealth ? "Yes" : "No"}
                            </span>
                            <span className="text-xs">
                              <span className="font-medium text-[#007a6e]">
                                Alive:
                              </span>{" "}
                              {fh.isAlive ? "Yes" : "No"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-4 italic">
                    No family history recorded
                  </p>
                )}
              </div>
            ) : (
              <table className="w-full border-collapse text-[11px] md:text-[12px] mb-8 md:mb-12">
                <thead>
                  <tr className="bg-[#e6f7f5] text-left text-[#007a6e]">
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
                      <tr
                        key={i}
                        className="border-b border-[#e6f7f5] hover:bg-[#f7fdfc] transition-colors"
                      >
                        <td className="p-2">{fh.relation || "-"}</td>
                        <td className="p-2">{fh.age || "-"}</td>
                        <td className="p-2">{fh.healthProblems || "-"}</td>
                        <td className="p-2">{fh.goodHealth ? "Yes" : "No"}</td>
                        <td className="p-2">{fh.isAlive ? "Yes" : "No"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-3 text-center text-gray-400 italic"
                      >
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
              <p className="font-semibold text-xs md:text-sm text-[#00a896]">
                Attending Physician
              </p>
              <p className="text-xs md:text-sm text-[#004d45]">
                Dr. {user?.firstName} {user?.lastName}
              </p>

              <div className="mt-4 md:mt-6">
                <p className="font-semibold text-xs md:text-sm text-[#00a896]">
                  Date Generated
                </p>
                <p className="text-xs md:text-sm text-[#004d45]">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="text-center mt-4 md:mt-0">
              <p className="font-semibold text-xs md:text-sm text-[#00a896]">
                Authorized Signature
              </p>
              <div className="border-t-2 border-[#00a896] w-full max-w-[200px] mx-auto mt-6 md:mt-10"></div>
              <p className="mt-2 text-xs md:text-sm text-[#004d45]">
                Dr. {user?.firstName} {user?.lastName}
              </p>
            </div>
          </div>

          {/* Bottom accent bar */}
          <div className="flex w-full h-1.5">
            <div className="w-1/2 bg-[#00a896]"></div>
            <div className="w-1/2 bg-[#ffd166]"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared sub-components ──────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="bg-[#00a896] text-white font-bold px-2 md:px-3 py-1.5 mb-3 md:mb-4 text-xs md:text-sm rounded-sm flex items-center gap-2 tracking-wide uppercase">
      {label}
    </div>
  );
}

function VitalCard({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string | number;
}) {
  return (
    <div className="bg-[#f0faf9] border border-[#b2e4df] p-3 rounded-xl">
      {icon && (
        <div className="flex items-center gap-1.5 mb-1">
          {icon}
          <p className="font-semibold text-xs text-[#007a6e]">{label}</p>
        </div>
      )}
      {!icon && (
        <p className="font-semibold text-xs text-[#007a6e] mb-1">{label}</p>
      )}
      <p className="text-sm text-[#004d45]">{value || "-"}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | number }) {
  return (
    <div>
      <p className="font-semibold text-xs md:text-sm text-[#00a896]">{label}</p>
      <p className="text-xs md:text-sm break-words text-[#004d45]">
        {value || "-"}
      </p>
    </div>
  );
}
