"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { ref, update, push, set } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";
import { ClipboardList, Pill, Stethoscope, User } from "lucide-react";
import type { Prescription } from "./view-prescriptions";

type EditPrescriptionProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prescription: Prescription;
};

// ── Shared section header matching AddPrescription style ─────────────────────
function SectionHeader({
  icon,
  title,
}: {
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
      <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
    </div>
  );
}

export function EditPrescription({
  prescription,
  onOpenChange,
}: EditPrescriptionProps) {
  const { user } = useAuth();
  const [fields, setFields] = useState(prescription);
  const [drugs, setDrugs] = useState(prescription.drugs || []);
  const [diagnosis, setDiagnosis] = useState(prescription.diagnosis || []);

  useEffect(() => {
    setFields(prescription);
    setDrugs(prescription.drugs || []);
    setDiagnosis(prescription.diagnosis || []);
  }, [prescription]);

  const handleChange = (key: keyof Prescription, value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const handleDrugChange = (
    index: number,
    key: keyof (typeof drugs)[0],
    value: string,
  ) => {
    const updated = [...drugs];
    updated[index][key] = value;
    setDrugs(updated);
  };

  const addDrug = () =>
    setDrugs([
      ...drugs,
      { medicine: "", dosage: "", unit: "", purpose: "", frequency: "" },
    ]);
  const removeDrug = (index: number) =>
    setDrugs(drugs.filter((_, i) => i !== index));

  const handleDiagnosisChange = (
    index: number,
    key: keyof (typeof diagnosis)[0],
    value: string,
  ) => {
    const updated = [...diagnosis];
    updated[index][key] = value;
    setDiagnosis(updated);
  };

  const addDiagnosis = () =>
    setDiagnosis([...diagnosis, { diagnosis: "", severity: "", notes: "" }]);
  const removeDiagnosis = (index: number) =>
    setDiagnosis(diagnosis.filter((_, i) => i !== index));

  const updatePrescription = async () => {
    const logsRef = ref(db, "logs/");
    const newLog = push(logsRef);
    if (!fields.id) {
      toast.error("Prescription record missing ID.");
      return;
    }

    await update(ref(db, `prescriptions/${fields.id}`), {
      diagnosis,
      examination: fields.examination,
      recommendation: fields.recommendation,
      drugs,
      updatedBy: user?.uid,
      updatedAt: Date.now(),
    });

    await set(newLog, {
      prescriptionLog: `Prescription updated by ${user?.firstName} ${user?.lastName}`,
      logTime: new Date().toLocaleString(),
    });

    toast.success("Prescription updated.");
    onOpenChange(false);
  };

  return (
    <div className="w-full h-full overflow-y-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updatePrescription();
        }}
      >
        <FieldGroup>
          <FieldSet className="space-y-6">
            {/* ── HEADER ── */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Edit Prescription
              </h1>
              <div className="mt-4 h-1 w-16 bg-[#00c4b4] rounded-full mx-auto" />
            </div>

            {/* ── PATIENT BANNER ── */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-[#00c4b4]/30 bg-[#00c4b4]/5">
              <div className="w-10 h-10 rounded-full bg-[#00c4b4]/15 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-[#00a896]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-[#00a896] uppercase tracking-widest mb-0.5">
                  Patient
                </p>
                <p className="text-base font-bold text-gray-800">
                  {fields.patientFirstName} {fields.patientLastName}
                </p>
                {(fields.patientAge || fields.patientGender) && (
                  <p className="text-sm text-gray-500">
                    {fields.patientGender && (
                      <span>{fields.patientGender}</span>
                    )}
                    {fields.patientAge && fields.patientGender && (
                      <span> · </span>
                    )}
                    {fields.patientAge && (
                      <span>{fields.patientAge} yrs old</span>
                    )}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-10 max-w-[1100px] mx-auto">
              {/* ── DIAGNOSIS ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <SectionHeader
                    icon={<ClipboardList className="w-4 h-4 text-[#00a896]" />}
                    title="Diagnosis"
                  />
                  <Button
                    type="button"
                    size="sm"
                    className="!bg-[#00a896] !text-white hover:!bg-[#028090]"
                    onClick={addDiagnosis}
                  >
                    + Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {diagnosis.map((d, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Diagnosis"
                          value={d.diagnosis}
                          onChange={(e) =>
                            handleDiagnosisChange(
                              index,
                              "diagnosis",
                              e.target.value,
                            )
                          }
                        />
                        <Input
                          placeholder="Severity"
                          value={d.severity}
                          onChange={(e) =>
                            handleDiagnosisChange(
                              index,
                              "severity",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <Input
                        placeholder="Notes"
                        value={d.notes}
                        onChange={(e) =>
                          handleDiagnosisChange(index, "notes", e.target.value)
                        }
                      />
                      {diagnosis.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="!bg-red-400 text-white"
                          onClick={() => removeDiagnosis(index)}
                        >
                          Remove Diagnosis
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ── DRUG PRESCRIPTIONS ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<Pill className="w-4 h-4 text-[#00a896]" />}
                  title="Drug Prescriptions"
                />

                {/* DRUG ROWS — 2-col grid on small, 5-col + action on large */}
                <div className="space-y-3">
                  {drugs.map((drug, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-xl bg-gray-50 p-4 space-y-3"
                    >
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Medicine
                          </label>
                          <Input
                            placeholder="Paracetamol"
                            value={drug.medicine}
                            onChange={(e) =>
                              handleDrugChange(
                                index,
                                "medicine",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Unit
                          </label>
                          <Input
                            placeholder="Tablet / ml"
                            value={drug.unit}
                            onChange={(e) =>
                              handleDrugChange(index, "unit", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Dosage
                          </label>
                          <Input
                            placeholder="500mg"
                            value={drug.dosage}
                            onChange={(e) =>
                              handleDrugChange(index, "dosage", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Purpose
                          </label>
                          <Input
                            placeholder="Pain relief"
                            value={drug.purpose}
                            onChange={(e) =>
                              handleDrugChange(index, "purpose", e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Frequency
                          </label>
                          <Input
                            placeholder="2x a day"
                            value={drug.frequency}
                            onChange={(e) =>
                              handleDrugChange(
                                index,
                                "frequency",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </div>
                      {drugs.length > 1 && (
                        <div className="flex justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="!bg-red-400 text-white h-8 text-xs"
                            onClick={() => removeDrug(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="!bg-[#00a896] !text-white hover:!bg-[#028090]"
                  onClick={addDrug}
                >
                  + Add Drug Row
                </Button>
              </div>

              {/* ── EXAMINATION & RECOMMENDATIONS ── */}
              <div className="space-y-4">
                <SectionHeader
                  icon={<Stethoscope className="w-4 h-4 text-[#00a896]" />}
                  title="Examination & Recommendations"
                />

                <div className="grid md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-sm text-gray-600 mb-1 block">
                      Examination
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Physical examination findings..."
                      value={fields.examination}
                      onChange={(e) =>
                        handleChange("examination", e.target.value)
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-sm text-gray-600 mb-1 block">
                      Recommendations
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Rest, hydration, follow-up in 3 days..."
                      value={fields.recommendation}
                      onChange={(e) =>
                        handleChange("recommendation", e.target.value)
                      }
                    />
                  </Field>
                </div>
              </div>

              {/* ── SAVE BUTTON ── */}
              <div className="flex justify-center pb-6">
                <Button
                  type="submit"
                  className="!bg-[#00a896] hover:!bg-[#028090] !text-white !px-12 !py-6 !text-lg font-semibold rounded-xl transition-all shadow-md"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
