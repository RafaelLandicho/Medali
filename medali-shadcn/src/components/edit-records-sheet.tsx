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
import { toast } from "sonner";

type EditRecordsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

//date picker code from shadcn components
function formatDate(date: Date | undefined) {
  if (!date) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
function isValidDate(date: Date | undefined) {
  if (!date) {
    return false;
  }
  return !isNaN(date.getTime());
}

export function EditRecordsSheet({
  open,
  onOpenChange,
  patient,
}: EditRecordsSheetProps) {
  const { user } = useAuth();

  const [fields, setFields] = useState(patient);
  const [openD, setOpenDate] = React.useState(false);

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));

  console.log("PATIENT", fields);
  // const [patientDiagnosis, setDiagnosis] = useState([
  //   { diagnosis: "", severity: "", notes: "" },
  // ]);

  // //FAMILY HISTORY
  // const [familyHistory, setFamilyHistory] = useState([
  //   {
  //     relation: "",
  //     age: "",
  //     healthProblems: "",
  //     goodHealth: true,
  //     isAlive: true,
  //   },
  // ]);

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

    console.log("BEFORE UPDATIUNG", fields.patientDiagnosis);
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="overflow-y-auto !w-[75vw] !max-w-none p-0 bg-white
        [&>button]:text-white 
        [&>button]:size-7 
        [&>button]:!bg-red-500  
        [&>button_svg]:w-6 
        [&>button_svg]:h-6"
      >
        <SheetHeader>
          <SheetTitle className="text-2xl md:text-3xl font-semibold text-center text-orange-500 mt-8 mb-6">
            Edit Medical Report
          </SheetTitle>

          <SheetDescription className="text-center text-gray-500 mb-6">
            Update patient information, vitals, and medical history.
          </SheetDescription>
        </SheetHeader>

        <Card className="flex-1 border-none rounded-none">
          <div className="px-4 md:px-8 lg:px-12">
            <Card className="p-6 md:p-8 rounded-2xl rounded-none border-none">
              <div className="max-w-5xl mx-auto space-y-8">
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Patient Information
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                className="text-white "
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
                      <FieldDescription> Date of Birth</FieldDescription>
                    </Field>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <Field>
                        <Input
                          value={fields.age}
                          onChange={(e) => handleChange("age", e.target.value)}
                          placeholder="Enter age"
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
                          <SelectTrigger className="!bg-[#00a896] w-full border-gray-300 !text-white ">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem
                              className="!bg-white !text-blue-500"
                              value="MALE"
                            >
                              Male
                            </SelectItem>
                            <SelectItem
                              className="!bg-white !text-red-500"
                              value="FEMALE"
                            >
                              Female
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FieldDescription>Gender</FieldDescription>
                      </Field>
                    </div>
                  </div>
                </div>

                {/* ================= CONTACT ================= */}
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
                    />
                  </Field>
                </div>

                {/* ================= ADDRESS ================= */}
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
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 w-screen">
                    <Field>
                      <Input
                        value={fields.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Enter address"
                      />
                      <FieldDescription>City</FieldDescription>
                    </Field>

                    <Field>
                      <Input
                        value={fields.province}
                        onChange={(e) =>
                          handleChange("province", e.target.value)
                        }
                        placeholder="Enter address"
                      />
                      <FieldDescription>State/Province</FieldDescription>
                    </Field>
                  </div>
                </div>

                {/* ================= VITALS ================= */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Vital Statistics
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <FieldDescription>HeartRate</FieldDescription>
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
                {/* ================= HEALTH HISTORY ================= */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Health History
                  </h2>

                  <div className="divide-y rounded-xl border overflow-hidden">
                    {/* Medical Care */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>
                        Are you presently under medical care?
                      </FieldLabel>
                      <Checkbox
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        checked={fields.medicalCare}
                        onCheckedChange={(checked) =>
                          handleChange("medicalCare", checked)
                        }
                      />
                    </div>

                    {/* Drug Allergy */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>Do you have any drug allergies?</FieldLabel>
                      <Checkbox
                        checked={fields.drugAllergy}
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        onCheckedChange={(checked) =>
                          handleChange("drugAllergy", checked)
                        }
                      />
                    </div>

                    {/* Food Allergy */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>
                        Do you have any food or environmental allergies?
                      </FieldLabel>
                      <Checkbox
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        checked={fields.foodAllergy}
                        onCheckedChange={(checked) =>
                          handleChange("foodAllergy", checked)
                        }
                      />
                    </div>

                    {/* TB */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>
                        Have you ever had tuberculosis or a positive TB test?
                      </FieldLabel>
                      <Checkbox
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        checked={fields.isTBPositive}
                        onCheckedChange={(checked) =>
                          handleChange("isTBPositive", checked)
                        }
                      />
                    </div>

                    {/* Clinician */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>
                        Have you ever been cared for by a mental health
                        clinician?
                      </FieldLabel>
                      <Checkbox
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        checked={fields.hasClinician}
                        onCheckedChange={(checked) =>
                          handleChange("hasClinician", checked)
                        }
                      />
                    </div>

                    {/* Diet */}
                    <div className="flex items-center justify-between px-4 py-3">
                      <FieldLabel>
                        Have you ever restricted your eating?
                      </FieldLabel>
                      <Checkbox
                        className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                        checked={fields.diet}
                        onCheckedChange={(checked) =>
                          handleChange("diet", checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ================= SYMPTOMS ================= */}
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl font-semibold">Symptoms</h2>

                  <Input
                    value={fields.symptoms}
                    onChange={(e) => handleChange("symptoms", e.target.value)}
                    placeholder="e.g. fever, cough"
                  />
                </div>

                {/* ================= DIAGNOSIS ================= */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg md:text-xl font-semibold">
                      Diagnosis
                    </h2>

                    <Button
                      size="sm"
                      className="!bg-[#00a896] text-white"
                      onClick={handleAddDiagnosis}
                    >
                      + Add
                    </Button>
                  </div>

                  {fields.patientDiagnosis.map((d, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 p-4 border rounded-xl bg-gray-50"
                    >
                      <Input
                        value={d.diagnosis}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "diagnosis",
                            e.target.value,
                          )
                        }
                        placeholder="Diagnosis"
                      />

                      <Input
                        value={d.severity}
                        onChange={(e) =>
                          handleDiagnosisChange(
                            index,
                            "severity",
                            e.target.value,
                          )
                        }
                        placeholder="Severity"
                      />

                      <Input
                        value={d.notes}
                        onChange={(e) =>
                          handleDiagnosisChange(index, "notes", e.target.value)
                        }
                        placeholder="Notes"
                      />

                      {fields.patientDiagnosis.length > 1 && (
                        <Button
                          size="sm"
                          className="!bg-red-400 text-white"
                          onClick={() => handleRemoveDiagnosis(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                {/* ================= FAMILY HISTORY ================= */}
                <div className="space-y-4">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Family History
                  </h2>

                  {/* HEADER */}
                  <div className="grid grid-cols-[120px_80px_1fr_120px_80px_100px] text-gray-500 text-sm">
                    <span>Relation</span>
                    <span>Age</span>
                    <span>Health Problems</span>
                    <span className="text-center">Good Health</span>
                    <span className="text-center">Alive</span>
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        className="!bg-[#00a896] text-white"
                        onClick={handleAddHistory}
                      >
                        + Add
                      </Button>
                    </div>
                  </div>

                  {/* ROWS */}
                  <div className="divide-y border rounded-xl">
                    {fields.familyHistory.map((h, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[120px_80px_1fr_120px_80px_100px] items-center gap-3 p-3"
                      >
                        <Input
                          value={h.relation}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "relation",
                              e.target.value,
                            )
                          }
                          placeholder="Relation"
                        />

                        <Input
                          value={h.age}
                          onChange={(e) =>
                            handleHistoryChange(index, "age", e.target.value)
                          }
                          placeholder="Age"
                        />

                        <Input
                          value={h.healthProblems}
                          onChange={(e) =>
                            handleHistoryChange(
                              index,
                              "healthProblems",
                              e.target.value,
                            )
                          }
                          placeholder="Problems"
                        />

                        <div className="flex justify-center">
                          <Checkbox
                            className="size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                            checked={h.goodHealth}
                            onCheckedChange={(c) =>
                              handleHistoryChange(
                                index,
                                "goodHealth",
                                c === true,
                              )
                            }
                          />
                        </div>

                        <div className="flex justify-center">
                          <Checkbox
                            className="size-6 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                            checked={h.isAlive}
                            onCheckedChange={(c) =>
                              handleHistoryChange(index, "isAlive", c === true)
                            }
                          />
                        </div>

                        <div className="flex justify-center">
                          {fields.familyHistory.length > 1 && (
                            <Button
                              size="sm"
                              className="!bg-red-400 text-white"
                              onClick={() => handleRemoveHistory(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ================= SAVE ================= */}
                <div className="flex justify-center pt-6">
                  <Button
                    onClick={updateRecords}
                    className="!bg-orange-400 text-white"
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
