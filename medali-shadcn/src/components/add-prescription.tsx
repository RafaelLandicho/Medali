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
            <h3 className="text-xl font-semibold">
              Prescription for {patient.firstName} {patient.lastName}
            </h3>

            {/* 2 COLUMN LAYOUT */}
            <div className="space-y-10 max-w-[1100px] mx-auto">
              {/* ================= DIAGNOSIS ================= */}
              <Field className="space-y-3">
                <FieldLabel className="text-lg font-semibold">
                  Diagnosis
                </FieldLabel>

                <div className="space-y-4">
                  {diagnosisPres.map((item, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-xl bg-muted/30 space-y-3"
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
                          variant="destructive"
                          onClick={() => handleRemoveDiagnosis(index)}
                        >
                          Remove Diagnosis
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    type="button"
                    className="!bg-[#00a896] !text-white w-full"
                    onClick={handleAddDiagnosis}
                  >
                    + Add Diagnosis
                  </Button>
                </div>
              </Field>

              {/* ================= DRUGS ================= */}

              <Field className="space-y-3">
                <FieldLabel className="text-lg font-semibold">
                  Drug Prescriptions
                </FieldLabel>

                <div className="border rounded-xl overflow-hidden">
                  {/* TABLE HEADER */}
                  <div className="grid grid-cols-6 bg-muted px-4 py-3 font-medium text-sm">
                    <div>Medicine</div>
                    <div>Unit</div>
                    <div>Dosage</div>
                    <div>Purpose</div>
                    <div>Frequency</div>
                    <div className="text-center">Action</div>
                  </div>

                  {/* TABLE BODY */}
                  {prescriptions.map((drug, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-6 gap-3 px-4 py-3 border-t items-center"
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
                  className="!bg-[#00a896] !text-white w-full"
                  onClick={handleAddPrescription}
                >
                  + Add Drug Row
                </Button>
              </Field>

              {/* ================= EXAM + RECO ================= */}
              <div className="grid md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel>Examination</FieldLabel>
                  <Input
                    value={fields.patientExamination}
                    onChange={(e) =>
                      handleChange("patientExamination", e.target.value)
                    }
                  />
                </Field>

                <Field>
                  <FieldLabel>Recommendations</FieldLabel>
                  <Input
                    value={fields.patientRecommendation}
                    onChange={(e) =>
                      handleChange("patientRecommendation", e.target.value)
                    }
                  />
                </Field>
              </div>

              {/* ================= SAVE BUTTON ================= */}
              <Field className="lg:col-span-2">
                <Button
                  type="submit"
                  className="!bg-[#00a896] !text-white w-full h-12 text-lg"
                >
                  Save Prescription
                </Button>
              </Field>
            </div>
          </FieldSet>
        </FieldGroup>
      </form>
    </div>
  );
}
