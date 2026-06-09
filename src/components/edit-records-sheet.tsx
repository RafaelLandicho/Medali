import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "./ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "./ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Patient } from "./medical_records";
import { ref, update, get, push } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";

type EditRecordsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

function formatDate(date: Date | undefined) {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function isValidDate(date: Date | undefined) {
  if (!date) return false;
  return !isNaN(date.getTime());
}

export function EditRecordsSheet({
  open,
  onOpenChange,
  patient,
}: EditRecordsSheetProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [fields, setFields] = useState(patient);
  const [openD, setOpenDate] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));

  useEffect(() => {
    if (patient) {
      setFields(patient);
    }
  }, [patient]);

  const handleChange = (key: keyof Patient, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddDiagnosis = () => {
    setFields((prev) => ({
      ...prev,
      patientDiagnosis: [
        ...(prev.patientDiagnosis || []),
        { diagnosis: "", severity: "", notes: "" },
      ],
    }));
  };

  const handleAddHistory = () => {
    setFields((prev) => ({
      ...prev,
      familyHistory: [
        ...(prev.familyHistory || []),
        {
          relation: "",
          age: "",
          healthProblems: "",
          goodHealth: true,
          isAlive: true,
        },
      ],
    }));
  };

  const handleRemoveDiagnosis = (index: number) => {
    setFields((prev) => ({
      ...prev,
      patientDiagnosis: prev.patientDiagnosis.filter((_, i) => i !== index),
    }));
  };

  const handleRemoveHistory = (index: number) => {
    setFields((prev) => ({
      ...prev,
      familyHistory: prev.familyHistory.filter((_, i) => i !== index),
    }));
  };

  const handleDiagnosisChange = (
    index: number,
    key: "diagnosis" | "severity" | "notes",
    value: string,
  ) => {
    setFields((prev) => {
      const updated = [...prev.patientDiagnosis];
      updated[index][key] = value;
      return { ...prev, patientDiagnosis: updated };
    });
  };

  const handleHistoryChange = (
    index: number,
    key: "relation" | "age" | "healthProblems" | "goodHealth" | "isAlive",
    value: string | boolean,
  ) => {
    setFields((prev) => {
      const updated = [...prev.familyHistory];
      if (key == "goodHealth" || key == "isAlive") {
        updated[index][key] = value as boolean;
      } else {
        updated[index][key] = value as string;
      }
      return { ...prev, familyHistory: updated };
    });
  };

  const updateRecords = async () => {
    if (!fields.id) {
      toast.error("Invalid patient record.");
      return;
    }

    const patientRef = ref(db, `patients/${fields.id}`);
    const patientHistoryRef = ref(db, `patients/${fields.id}/medicalHistory`);

    const snapshot = await get(patientRef);
    const currentPatient = snapshot.val();

    const { medicalHistory, ...oldHistory } = currentPatient || {};

    await update(patientRef, {
      ...fields,
      address:
        fields.address1 + fields.address2 + fields.city + fields.province,
      updatedBy: user?.uid || "",
      updatedAt: Date.now(),
    });
    await push(patientHistoryRef, {
      ...oldHistory,
      savedAt: Date.now(),
    });

    toast.success("Patient record updated successfully.");
    onOpenChange(false);
  };

  // Mobile-optimized Diagnosis component
  const DiagnosisSection = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-semibold">Diagnosis</h2>
        <Button
          size={isMobile ? "default" : "sm"}
          className="!bg-[#00a896] text-white"
          onClick={handleAddDiagnosis}
        >
          + Add
        </Button>
      </div>

      {fields.patientDiagnosis.map((d, index) => (
        <div
          key={index}
          className={`p-4 border rounded-xl bg-gray-50 ${
            isMobile ? "space-y-3" : "grid grid-cols-4 gap-3"
          }`}
        >
          <div className={isMobile ? "space-y-1" : ""}>
            <label className="text-sm font-medium text-gray-700 block md:hidden">
              Diagnosis
            </label>
            <Input
              value={d.diagnosis}
              onChange={(e) =>
                handleDiagnosisChange(index, "diagnosis", e.target.value)
              }
              placeholder="Diagnosis"
              className="w-full"
            />
          </div>

          <div className={isMobile ? "space-y-1" : ""}>
            <label className="text-sm font-medium text-gray-700 block md:hidden">
              Severity
            </label>
            <Input
              value={d.severity}
              onChange={(e) =>
                handleDiagnosisChange(index, "severity", e.target.value)
              }
              placeholder="Severity"
              className="w-full"
            />
          </div>

          <div className={isMobile ? "space-y-1" : ""}>
            <label className="text-sm font-medium text-gray-700 block md:hidden">
              Notes
            </label>
            <Input
              value={d.notes}
              onChange={(e) =>
                handleDiagnosisChange(index, "notes", e.target.value)
              }
              placeholder="Notes"
              className="w-full"
            />
          </div>

          {fields.patientDiagnosis.length > 1 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleRemoveDiagnosis(index)}
              className="w-full md:w-auto"
            >
              Remove
            </Button>
          )}
        </div>
      ))}
    </div>
  );

  // Mobile-optimized Family History component
  const FamilyHistorySection = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-semibold">Family History</h2>
        <Button
          size={isMobile ? "default" : "sm"}
          className="!bg-[#00a896] text-white"
          onClick={handleAddHistory}
        >
          + Add
        </Button>
      </div>

      <div className="divide-y border rounded-xl">
        {fields.familyHistory.map((h, index) => (
          <div key={index} className="p-4 space-y-3">
            {/* Relation */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Relation
              </label>
              <Input
                value={h.relation}
                onChange={(e) =>
                  handleHistoryChange(index, "relation", e.target.value)
                }
                placeholder="e.g., Mother, Father"
              />
            </div>

            {/* Age */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">Age</label>
              <Input
                value={h.age}
                onChange={(e) =>
                  handleHistoryChange(index, "age", e.target.value)
                }
                placeholder="Age"
                type="number"
              />
            </div>

            {/* Health Problems */}
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Health Problems
              </label>
              <Input
                value={h.healthProblems}
                onChange={(e) =>
                  handleHistoryChange(index, "healthProblems", e.target.value)
                }
                placeholder="Any health conditions"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Good Health
                </label>
                <Checkbox
                  className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                  checked={h.goodHealth}
                  onCheckedChange={(c) =>
                    handleHistoryChange(index, "goodHealth", c === true)
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Alive
                </label>
                <Checkbox
                  className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                  checked={h.isAlive}
                  onCheckedChange={(c) =>
                    handleHistoryChange(index, "isAlive", c === true)
                  }
                />
              </div>
            </div>

            {/* Remove Button */}
            {fields.familyHistory.length > 1 && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleRemoveHistory(index)}
                className="w-full mt-2"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : "right"}
        className={
          isMobile
            ? `
            overflow-y-auto
            h-[90vh]
            w-full
            p-0
            bg-white
            rounded-t-2xl
            [&>button]:text-white
            [&>button]:size-6
            [&>button]:!bg-red-500
            [&>button]:top-4
            [&>button]:right-4
          `
            : `
            overflow-y-auto
            !w-[75vw]
            !max-w-none
            p-0
            bg-white
            [&>button]:text-white
            [&>button]:size-7
            [&>button]:!bg-red-500
            [&>button_svg]:w-6
            [&>button_svg]:h-6
          `
        }
      >
        <SheetHeader className="sticky top-0 bg-white z-10 border-b">
          <SheetTitle className="text-xl md:text-3xl font-semibold text-center text-orange-500 py-4">
            Edit Medical Report
          </SheetTitle>
          <SheetDescription className="text-center text-gray-500 pb-4">
            Update patient information, vitals, and medical history.
          </SheetDescription>
        </SheetHeader>

        <Card className="flex-1 border-none rounded-none">
          <div className="px-4 md:px-8 lg:px-12 py-4">
            <Card className="p-4 md:p-8 rounded-2xl border-none">
              <div className="max-w-5xl mx-auto space-y-6 md:space-y-8">
                {/* Patient Information */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Patient Information
                  </h2>

                  <div className="grid grid-cols-1 gap-4">
                    {/* Name fields - stack on mobile, grid on desktop */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Field>
                        <Input
                          value={fields.firstName}
                          onChange={(e) =>
                            handleChange("firstName", e.target.value)
                          }
                          placeholder="Enter first name"
                        />
                        <FieldDescription>First Name</FieldDescription>
                      </Field>

                      <Field>
                        <Input
                          value={fields.lastName}
                          onChange={(e) =>
                            handleChange("lastName", e.target.value)
                          }
                          placeholder="Enter last name"
                        />
                        <FieldDescription>Last Name</FieldDescription>
                      </Field>
                    </div>

                    {/* Date of Birth */}
                    <Field>
                      <InputGroup>
                        <InputGroupInput
                          id="date-required"
                          value={value}
                          placeholder={fields.birthdate}
                          onChange={(e) => {
                            handleChange("birthdate", e.target.value);
                            const date = new Date(e.target.value);
                            setValue(e.target.value);
                            if (isValidDate(date)) {
                              setDate(date);
                              setMonth(date);
                            }
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowDown") {
                              e.preventDefault();
                              setOpenDate(true);
                            }
                          }}
                        />
                        <InputGroupAddon align="inline-end">
                          <Popover open={openD} onOpenChange={setOpenDate}>
                            <PopoverTrigger asChild>
                              <InputGroupButton
                                id="date-picker"
                                variant="ghost"
                                size="icon-xs"
                                aria-label="Select date"
                                className="!bg-[#00a896] text-white !hover:bg-[#028090] border-none"
                              >
                                <CalendarIcon />
                                <span className="sr-only">Select date</span>
                              </InputGroupButton>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto overflow-hidden p-0"
                              align="end"
                              alignOffset={-8}
                              sideOffset={10}
                            >
                              <Calendar
                                mode="single"
                                selected={date}
                                month={month}
                                onMonthChange={setMonth}
                                onSelect={(date) => {
                                  setDate(date);
                                  setValue(formatDate(date));
                                  setOpenDate(false);
                                }}
                              />
                            </PopoverContent>
                          </Popover>
                        </InputGroupAddon>
                      </InputGroup>
                      <FieldDescription>Date of Birth</FieldDescription>
                    </Field>

                    {/* Age and Gender - side by side on mobile */}
                    <div className="grid grid-cols-2 gap-4">
                      <Field>
                        <Input
                          value={fields.age}
                          onChange={(e) => handleChange("age", e.target.value)}
                          placeholder="Enter age"
                          type="number"
                        />
                        <FieldDescription>Age</FieldDescription>
                      </Field>

                      <Field>
                        <Select
                          value={fields.gender}
                          onValueChange={(value) =>
                            handleChange("gender", value)
                          }
                        >
                          <SelectTrigger className="!bg-[#00a896] w-full border-gray-300 !text-white">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MALE">Male</SelectItem>
                            <SelectItem value="FEMALE">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldDescription>Gender</FieldDescription>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* Contact Number */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Contact Number
                  </h2>
                  <Field>
                    <Input
                      value={fields.telephone}
                      onChange={(e) =>
                        handleChange("telephone", e.target.value)
                      }
                      placeholder="Enter contact number"
                      type="tel"
                    />
                  </Field>
                </div>

                {/* Address */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">Address</h2>

                  <Field>
                    <Input
                      value={fields.address1}
                      onChange={(e) => handleChange("address1", e.target.value)}
                      placeholder="Enter address"
                    />
                    <FieldDescription>Address Line 1</FieldDescription>
                  </Field>

                  <Field>
                    <Input
                      value={fields.address2}
                      onChange={(e) => handleChange("address2", e.target.value)}
                      placeholder="Enter address"
                    />
                    <FieldDescription>Address Line 2</FieldDescription>
                  </Field>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field>
                      <Input
                        value={fields.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Enter city"
                      />
                      <FieldDescription>City</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.province}
                        onChange={(e) =>
                          handleChange("province", e.target.value)
                        }
                        placeholder="Enter state/province"
                      />
                      <FieldDescription>State/Province</FieldDescription>
                    </Field>
                  </div>
                </div>

                {/* Vital Statistics - 2 columns on mobile, 3 on desktop */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Vital Statistics
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    <Field>
                      <Input
                        value={fields.bloodPressure}
                        onChange={(e) =>
                          handleChange("bloodPressure", e.target.value)
                        }
                        placeholder="Blood Pressure"
                      />
                      <FieldDescription>Blood Pressure</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.heartRate}
                        onChange={(e) =>
                          handleChange("heartRate", e.target.value)
                        }
                        placeholder="Heart Rate"
                      />
                      <FieldDescription>Heart Rate</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.temperature}
                        onChange={(e) =>
                          handleChange("temperature", e.target.value)
                        }
                        placeholder="Temperature"
                      />
                      <FieldDescription>Temperature</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.oxygenSaturation}
                        onChange={(e) =>
                          handleChange("oxygenSaturation", e.target.value)
                        }
                        placeholder="Oxygen Saturation"
                      />
                      <FieldDescription>Oxygen Saturation</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.respiratoryRate}
                        onChange={(e) =>
                          handleChange("respiratoryRate", e.target.value)
                        }
                        placeholder="Respiratory Rate"
                      />
                      <FieldDescription>Respiratory Rate</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.height}
                        onChange={(e) => handleChange("height", e.target.value)}
                        placeholder="Height"
                      />
                      <FieldDescription>Height</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.weight}
                        onChange={(e) => handleChange("weight", e.target.value)}
                        placeholder="Weight"
                      />
                      <FieldDescription>Weight</FieldDescription>
                    </Field>
                  </div>
                </div>

                {/* Health History - improved touch targets */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Health History
                  </h2>

                  <div className="divide-y rounded-xl border overflow-hidden">
                    {[
                      {
                        label: "Are you presently under medical care?",
                        checked: fields.medicalCare,
                        key: "medicalCare",
                      },
                      {
                        label: "Do you have any drug allergies?",
                        checked: fields.drugAllergy,
                        key: "drugAllergy",
                      },
                      {
                        label:
                          "Do you have any food or environmental allergies?",
                        checked: fields.foodAllergy,
                        key: "foodAllergy",
                      },
                      {
                        label:
                          "Have you ever had tuberculosis or a positive TB test?",
                        checked: fields.isTBPositive,
                        key: "isTBPositive",
                      },
                      {
                        label:
                          "Have you ever been cared for by a mental health clinician?",
                        checked: fields.hasClinician,
                        key: "hasClinician",
                      },
                      {
                        label: "Have you ever restricted your eating?",
                        checked: fields.diet,
                        key: "diet",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center justify-between px-4 py-4 min-h-[56px]"
                      >
                        <label className="text-sm font-medium text-gray-700 flex-1 mr-4">
                          {item.label}
                        </label>
                        <Checkbox
                          className="size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                          checked={item.checked as boolean}
                          onCheckedChange={(checked) =>
                            handleChange(item.key as keyof Patient, checked)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Symptoms */}
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-semibold">Symptoms</h2>
                  <Input
                    value={fields.symptoms}
                    onChange={(e) => handleChange("symptoms", e.target.value)}
                    placeholder="e.g., fever, cough"
                  />
                </div>

                {/* Diagnosis Section */}
                <DiagnosisSection />

                {/* Family History Section */}
                <FamilyHistorySection />

                {/* Save Button */}
                <div className="flex justify-center pt-6 sticky bottom-0 bg-white pb-4">
                  <Button
                    onClick={updateRecords}
                    className="!bg-orange-400 text-white w-full md:w-auto px-8 py-6 md:py-2 text-base md:text-sm"
                    size={isMobile ? "lg" : "default"}
                  >
                    Update Record
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </Card>
      </SheetContent>
    </Sheet>
  );
}
