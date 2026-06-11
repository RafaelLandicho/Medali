import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ClipboardList, Pill, Stethoscope, FileText, User } from "lucide-react";
import { useState, useEffect } from "react";
import { db } from "@/firebaseConfig";
import { ref, push, set } from "firebase/database";
import { useAuth } from "@/auth/authprovider";

export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  field: string;
  medicalId: string;
  type: string;
  email: string;
  requestedBy?: string[];
  requestedTo?: string[];
  uid?: string;
};

type AddPrescriptionProps = {
  patient: {
    patientId: string;
    firstName: string;
    lastName: string;
    gender?: string;
    age?: number;
    address: string;
    patientDiagnosis: {
      diagnosis: string;
      severity: string;
      notes: string;
    }[];
  };
};

export function AddPrescription({ patient }: AddPrescriptionProps) {
  const { user } = useAuth();

  const [prescriptions, setPrescriptions] = useState([
    { medicine: "", unit: "", dosage: "", purpose: "", frequency: "" },
  ]);
  const [diagnosisPres, setDiagnosisPres] = useState<
    { diagnosis: string; severity: string; notes: string }[]
  >([]);

  useEffect(() => {
    console.log("FULL PATIENT:", patient);

    if (patient) {
      console.log("Loaded patient:", patient);
      console.log(patient.patientDiagnosis);
      if (patient.patientDiagnosis && patient.patientDiagnosis.length > 0) {
        setDiagnosisPres(
          patient.patientDiagnosis.map((d) => ({
            diagnosis: d.diagnosis,
            severity: d.severity,
            notes: d.notes,
          })),
        );
      } else {
        setDiagnosisPres([{ diagnosis: "", severity: "", notes: "" }]);
      }
    }
  }, [patient]);

  const [fields, setFields] = useState({
    patientDiagnosis: "",
    patientExamination: "",
    patientRecommendation: "",
    dateIssued: "",
  });

  const handleChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddPrescription = () =>
    setPrescriptions([
      ...prescriptions,
      { medicine: "", unit: "", dosage: "", purpose: "", frequency: "" },
    ]);
  const handleRemovePrescription = (index: number) =>
    setPrescriptions(prescriptions.filter((_, i) => i !== index));

  const handlePrescriptionChange = (
    index: number,
    key: "medicine" | "unit" | "dosage" | "purpose" | "frequency",
    value: string,
  ) => {
    const updated = [...prescriptions];
    updated[index][key] = value;
    setPrescriptions(updated);
  };

  const handleAddDiagnosis = () =>
    setDiagnosisPres([
      ...diagnosisPres,
      { diagnosis: "", severity: "", notes: "" },
    ]);
  const handleRemoveDiagnosis = (index: number) =>
    setDiagnosisPres(diagnosisPres.filter((_, i) => i !== index));

  const handleDiagnosisChange = (
    index: number,
    key: "diagnosis" | "severity" | "notes",
    value: string,
  ) => {
    const updated = [...diagnosisPres];
    updated[index][key] = value;
    setDiagnosisPres(updated);
  };

  const addPrescription = async () => {
    try {
      const logsRef = ref(db, "logs/");
      const prescriptionsRef = ref(db, `prescriptions/`);
      const newPrescription = push(prescriptionsRef);
      const newLog = push(logsRef);

      await set(newPrescription, {
        patientFirstName: patient.firstName,
        patientLastName: patient.lastName,
        patientAddress: patient.address,
        patientAge: patient.age,
        patientGender: patient.gender,
        prescriptionId: newPrescription.key,
        diagnosis: diagnosisPres,
        examination: fields.patientExamination,
        recommendation: fields.patientRecommendation,
        drugs: prescriptions,
        addedBy: `${user?.firstName} ${user?.lastName}`,
        field: user?.field,
        doctorId: user?.medicalId,
        createdBy: user?.uid,
        createdAt: new Date().toLocaleString(),
      });

      await set(newLog, {
        prescriptionLog: `Prescription added by ${user?.firstName} ${user?.lastName} `,
        logTime: new Date().toLocaleString(),
      });

      toast.success(`Prescription added for ${patient.firstName}`);
      console.log("prescription added");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add prescription");
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addPrescription();
        }}
      >
        <FieldGroup>
          <FieldSet className="space-y-6">
            {/* ── HEADER ── */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
                Prescription Form
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
                  {patient.firstName} {patient.lastName}
                </p>
                {(patient.age || patient.gender) && (
                  <p className="text-sm text-gray-500">
                    {patient.gender && <span>{patient.gender}</span>}
                    {patient.age && patient.gender && <span> · </span>}
                    {patient.age && <span>{patient.age} yrs old</span>}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-10 max-w-[1100px] mx-auto">
              {/* ── DIAGNOSIS ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
                    <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
                      <ClipboardList className="w-4 h-4 text-[#00a896]" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">
                      Diagnosis
                    </h2>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="!bg-[#00a896] !text-white hover:!bg-[#028090]"
                    onClick={handleAddDiagnosis}
                  >
                    + Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {diagnosisPres.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border border-gray-200 rounded-xl bg-gray-50 space-y-3"
                    >
                      <div className="grid md:grid-cols-2 gap-3">
                        <Input
                          placeholder="Diagnosis"
                          value={item.diagnosis}
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
                          value={item.severity}
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
                        value={item.notes}
                        onChange={(e) =>
                          handleDiagnosisChange(index, "notes", e.target.value)
                        }
                      />
                      {diagnosisPres.length > 1 && (
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          className="!bg-red-400 text-white"
                          onClick={() => handleRemoveDiagnosis(index)}
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
                <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
                  <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
                    <Pill className="w-4 h-4 text-[#00a896]" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Drug Prescriptions
                  </h2>
                </div>

                {/* TABLE HEADER */}
                <div className="grid grid-cols-6 bg-gray-50 border border-gray-200 rounded-t-xl px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <div>Medicine</div>
                  <div>Unit</div>
                  <div>Dosage</div>
                  <div>Purpose</div>
                  <div>Frequency</div>
                  <div className="text-center">Action</div>
                </div>

                {/* TABLE BODY */}
                <div className="border border-t-0 border-gray-200 rounded-b-xl overflow-hidden divide-y divide-gray-200">
                  {prescriptions.map((drug, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-3 px-4 py-3 items-center hover:bg-gray-50 transition-colors"
                    >
                      <Input
                        placeholder="Paracetamol"
                        value={drug.medicine}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "medicine",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Tablet / ml"
                        value={drug.unit}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "unit",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="500mg"
                        value={drug.dosage}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "dosage",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="Pain relief"
                        value={drug.purpose}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "purpose",
                            e.target.value,
                          )
                        }
                      />
                      <Input
                        placeholder="2x a day"
                        value={drug.frequency}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "frequency",
                            e.target.value,
                          )
                        }
                      />
                      <div className="flex justify-center">
                        {prescriptions.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            className="!bg-red-400 text-white h-8 text-xs"
                            onClick={() => handleRemovePrescription(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  className="!bg-[#00a896] !text-white hover:!bg-[#028090]"
                  onClick={handleAddPrescription}
                >
                  + Add Drug Row
                </Button>
              </div>

              {/* ── EXAMINATION & RECOMMENDATIONS ── */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-l-4 border-[#00c4b4] pl-4">
                  <div className="w-8 h-8 rounded-lg bg-[#00c4b4]/10 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="w-4 h-4 text-[#00a896]" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Examination & Recommendations
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Field>
                    <FieldLabel className="text-sm text-gray-600 mb-1 block">
                      Examination
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Physical examination findings..."
                      value={fields.patientExamination}
                      onChange={(e) =>
                        handleChange("patientExamination", e.target.value)
                      }
                    />
                  </Field>

                  <Field>
                    <FieldLabel className="text-sm text-gray-600 mb-1 block">
                      Recommendations
                    </FieldLabel>
                    <Input
                      placeholder="e.g. Rest, hydration, follow-up in 3 days..."
                      value={fields.patientRecommendation}
                      onChange={(e) =>
                        handleChange("patientRecommendation", e.target.value)
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
                  Save Prescription
                </Button>
              </div>
            </div>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
