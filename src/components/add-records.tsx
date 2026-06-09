"use client";

import * as React from "react";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "./ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "./ui/calendar";
import { CalendarIcon, Check } from "lucide-react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { toast } from "sonner";
import { db } from "@/firebaseConfig";
import { ref, set, push, onValue, get } from "firebase/database";
import { useAuth } from "@/auth/authprovider";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";

//FUNCTIONS AND INTERFACES FOR COMPONENTS

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

export function AddRecords() {
  // TEST SAVE 123
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [open, setOpen] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [month, setMonth] = React.useState<Date | undefined>(date);
  const [value, setValue] = React.useState(formatDate(date));

  const initialState = {
    patientFirstName: "",
    patientLastName: "",
    patientGender: "",
    patientAge: "",
    patientSymptoms: "",
    patientBirthdate: "",
    patientTelephone: "",
    patientAddress: "",
    patientAddress2: "",
    patientCity: "",
    patientStateProvince: "",
    patientBloodPressure: "",
    patientHeartRate: "",
    patientRespiratoryRate: "",
    patientTemperature: "",
    patientOxygenSaturation: "",
    patientHeight: "",
    patientWeight: "",

    // HEALTH HISTORY
    patientisMedicalCare: false,
    patientDrugAllergy: false,
    patientFoodAllergy: false,
    patientTBPositive: false,
    patientHasClinician: false,
    patientDiet: false,
  };

  const [fields, setFields] = useState(initialState);
  const [openSections, setOpenSections] = useState<string[]>(["basic"]);
  const [isLoading, setIsLoading] = useState(false);
  const [patientDiagnosis, setDiagnosis] = useState([
    { diagnosis: "", severity: "", notes: "" },
  ]);

  //FAMILY HISTORY
  const [familyHistory, setFamilyHistory] = useState([
    {
      relation: "",
      age: "",
      healthProblems: "",
      goodHealth: true,
      isAlive: true,
    },
  ]);

  const [linkedUsers, setLinkedUsers] = React.useState<any[]>([]);
  const [selectedLinkedUser, setSelectedLinkedUser] = React.useState("");
  const userIsAdmin = user?.type?.toLowerCase() === "admin";
  const userIsSecretary = user?.type?.toLowerCase() === "secretary";
  const userIsDoctor = user?.type?.toLowerCase() === "doctor";

  React.useEffect(() => {
    if (!user) return;

    const userRef = ref(db, `users/${user.uid}`);
    const unsubscribe = onValue(userRef, async (snapshot) => {
      const userData = snapshot.val();
      if (!userData) return;

      let linkedUserIds: string[] = [];

      if (user.type?.toLowerCase() === "secretary") {
        // Secretary: get linked doctors
        linkedUserIds = userData.doctors || [];
      } else if (user.type?.toLowerCase() === "doctor") {
        // Doctor: get linked secretaries
        linkedUserIds = userData.secretaries || [];
      }

      // Fetch details of linked users
      const linkedUsersPromises = linkedUserIds.map(async (userId: string) => {
        const linkedUserRef = ref(db, `users/${userId}`);
        const linkedUserSnap = await get(linkedUserRef);
        if (linkedUserSnap.exists()) {
          return { id: userId, ...linkedUserSnap.val() };
        }
        return null;
      });

      const linkedUsersData = await Promise.all(linkedUsersPromises);
      setLinkedUsers(linkedUsersData.filter(Boolean));
    });

    return () => unsubscribe();
  }, [user]);

  const handleChange = (key: string, value: string | boolean) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    console.log(key, value);
  };

  const handleAddDiagnosis = () =>
    setDiagnosis([
      ...patientDiagnosis,
      { diagnosis: "", severity: "", notes: "" },
    ]);
  const handleAddHistory = () =>
    setFamilyHistory([
      ...familyHistory,
      {
        relation: "",
        age: "",
        healthProblems: "",
        goodHealth: true,
        isAlive: true,
      },
    ]);

  const handleRemoveDiagnosis = (index: number) =>
    setDiagnosis(patientDiagnosis.filter((_, i) => i !== index));

  const handleRemoveHistory = (index: number) =>
    setFamilyHistory(familyHistory.filter((_, i) => i !== index));

  const handleDiagnosisChange = (
    index: number,
    key: "diagnosis" | "severity" | "notes",
    value: string,
  ) => {
    const updated = [...patientDiagnosis];
    updated[index][key] = value;
    setDiagnosis(updated);
  };
  const handleHistoryChange = (
    index: number,
    key: "relation" | "age" | "healthProblems" | "goodHealth" | "isAlive",
    value: string | boolean,
  ) => {
    const updated = [...familyHistory];
    if (key == "goodHealth" || key == "isAlive") {
      updated[index][key] = value as boolean;
    } else {
      updated[index][key] = value as string;
    }

    setFamilyHistory(updated);
  };

  const addRecords = async () => {
    if (
      !fields.patientFirstName ||
      !fields.patientLastName ||
      !fields.patientGender ||
      !fields.patientAge
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);

    try {
      const logsRef = ref(db, "logs/");
      const patientsRef = ref(db, "patients");
      const pendingRef = ref(db, "pending");
      const patient = push(patientsRef);
      const pending = push(pendingRef);
      const newLog = push(logsRef);

      const sharedWith = [user?.uid];

      if (selectedLinkedUser) {
        sharedWith.push(selectedLinkedUser);
      }
      if (userIsSecretary) {
        await set(pending, {
          patientId: patient.key,
          firstName: fields.patientFirstName,
          lastName: fields.patientLastName,
          gender: fields.patientGender,
          age: fields.patientAge,
          birthdate: date ? date.toISOString().split("T")[0] : null,
          telephone: fields.patientTelephone,
          address:
            fields.patientAddress +
            fields.patientAddress2 +
            fields.patientCity +
            fields.patientStateProvince,
          address1: fields.patientAddress,
          address2: fields.patientAddress2,
          city: fields.patientCity,
          province: fields.patientStateProvince,

          //Measurements and Symptoms
          diagnosis: patientDiagnosis,
          symptoms: fields.patientSymptoms,
          bloodPressure: fields.patientBloodPressure,
          heartRate: fields.patientHeartRate,
          respiratoryRate: fields.patientRespiratoryRate,
          temperature: fields.patientTemperature,
          oxygenSaturation: fields.patientOxygenSaturation,
          weight: fields.patientWeight,
          height: fields.patientHeight,

          //Health History
          medicalCare: fields.patientisMedicalCare,
          drugAllergy: fields.patientDrugAllergy,
          foodAllergy: fields.patientFoodAllergy,
          isTBPositive: fields.patientTBPositive,
          hasClinician: fields.patientHasClinician,
          diet: fields.patientDiet,

          //family history
          familyHistory: familyHistory,

          status: "pending",
          addedBy: user?.email,
          createdBy: user?.uid,
          createdAt: Date.now(),
          sharedWith: sharedWith,
        });

        await set(newLog, {
          medicalRecordLog: `Medical Record added for approval  by ${user?.firstName} ${user?.lastName} `,
          logTime: new Date().toLocaleString(),
        });
        toast.success("Record has been added for approval!");
      } else {
        await set(patient, {
          //Patient Info
          patientId: patient.key,
          firstName: fields.patientFirstName,
          lastName: fields.patientLastName,
          gender: fields.patientGender,
          age: fields.patientAge,
          birthdate: date ? date.toISOString().split("T")[0] : null,
          telephone: fields.patientTelephone,
          address:
            fields.patientAddress +
            fields.patientAddress2 +
            fields.patientCity +
            fields.patientStateProvince,

          address1: fields.patientAddress,
          address2: fields.patientAddress2,
          city: fields.patientCity,
          province: fields.patientStateProvince,

          //Measurements and Symptoms
          patientDiagnosis: patientDiagnosis,
          symptoms: fields.patientSymptoms,
          bloodPressure: fields.patientBloodPressure,
          heartRate: fields.patientHeartRate,
          respiratoryRate: fields.patientRespiratoryRate,
          temperature: fields.patientTemperature,
          oxygenSaturation: fields.patientOxygenSaturation,
          weight: fields.patientWeight,
          height: fields.patientHeight,

          //Health History
          medicalCare: fields.patientisMedicalCare,
          drugAllergy: fields.patientDrugAllergy,
          foodAllergy: fields.patientFoodAllergy,
          isTBPositive: fields.patientTBPositive,
          hasClinician: fields.patientHasClinician,
          diet: fields.patientDiet,

          //family history
          familyHistory: familyHistory,

          addedBy: user?.email,
          createdBy: user?.uid,
          createdAt: Date.now(),
          sharedWith: sharedWith,
        });

        await set(newLog, {
          medicalRecordLog: `Medical Record added by ${user?.firstName} ${user?.lastName} `,
          logTime: new Date().toLocaleString(),
        });
        toast.success("Record has been added successfully!");
      }

      setFields(initialState);
      setSelectedLinkedUser("");
      setOpenSections(["basic"]);
    } catch (error) {
      console.error("Error adding record:", error);
      toast.error("Failed to add record. Please try again.");
    } finally {
      setIsLoading(false);
      navigate("/records");
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        addRecords();
      }}
      className="space-y-6 md:space-y-8"
    >
      <Card className="flex-1">
        <h1 className="text-2xl md:text-3xl font-semibold text-center text-orange-500 mb-6 md:mb-8">
          Medical Report Form
        </h1>

        <div className="px-4 md:px-8 lg:px-12">
          <Card className="p-6 md:p-8 rounded-2xl">
            <div className="max-w-5xl mx-auto space-y-8">
              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  Patient Information
                </h2>

                {/*PATIENT FULL NAME */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/*First Name */}

                  <Field>
                    <Input
                      placeholder="Enter first name"
                      value={fields.patientFirstName}
                      onChange={(e) =>
                        handleChange("patientFirstName", e.target.value)
                      }
                      required
                    />
                    <FieldDescription>First Name</FieldDescription>
                  </Field>

                  {/*Last Name */}
                  <Field>
                    <Input
                      // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                      placeholder="Enter last name"
                      value={fields.patientLastName}
                      onChange={(e) =>
                        handleChange("patientLastName", e.target.value)
                      }
                      required
                    />
                    <FieldDescription>Last Name</FieldDescription>
                  </Field>

                  {/* BIRTHDAY FIELD */}

                  <Field>
                    <InputGroup>
                      <InputGroupInput
                        id="date-required"
                        value={value}
                        placeholder="June 01, 2025"
                        onChange={(e) => {
                          handleChange("patientBirthDate", e.target.value);
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
                            setOpen(true);
                          }
                        }}
                      />
                      <InputGroupAddon align="inline-end">
                        <Popover open={open} onOpenChange={setOpen}>
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
                                setOpen(false);
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription> Date of Birth</FieldDescription>
                  </Field>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/*AGE*/}
                  <div>
                    <Field>
                      <Input
                        type="number"
                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                        placeholder="Enter age"
                        value={fields.patientAge}
                        onChange={(e) =>
                          handleChange("patientAge", e.target.value)
                        }
                        required
                      />
                      <FieldDescription>Patient Age</FieldDescription>
                    </Field>
                  </div>

                  {/*GENDER*/}

                  <Select
                    value={fields.patientGender}
                    onValueChange={(value) =>
                      handleChange("patientGender", value)
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
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold">Address</h2>
                {/* ADDRESS DETAILS*/}
                <div className="grid grid-cols-1 gap-4">
                  <Field>
                    <Input
                      type="text"
                      // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                      placeholder="Enter address"
                      value={fields.patientAddress}
                      onChange={(e) =>
                        handleChange("patientAddress", e.target.value)
                      }
                    />
                    <FieldDescription>Address Line 1</FieldDescription>
                  </Field>
                  <Field>
                    <Input
                      type="text"
                      // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                      placeholder="Enter address"
                      value={fields.patientAddress2}
                      onChange={(e) =>
                        handleChange("patientAddress2", e.target.value)
                      }
                    />
                    <FieldDescription>Address Line 2</FieldDescription>
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field>
                      <Input
                        type="text"
                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                        placeholder="Enter City"
                        value={fields.patientCity}
                        onChange={(e) =>
                          handleChange("patientCity", e.target.value)
                        }
                      />
                      <FieldDescription>City</FieldDescription>
                    </Field>
                    <Field className="mx-auto w-full">
                      <Input
                        type="text"
                        // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                        placeholder="Enter State or Province"
                        value={fields.patientStateProvince}
                        onChange={(e) =>
                          handleChange("patientStateProvince", e.target.value)
                        }
                      />
                      <FieldDescription>State/Province</FieldDescription>
                    </Field>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-lg md:text-xl font-semibold">
                  Contact Number
                </h2>
                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="Enter contact number"
                    value={fields.patientTelephone}
                    onChange={(e) =>
                      handleChange("patientTelephone", e.target.value)
                    }
                  />
                </Field>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Vital Statistics
                </h2>
              </div>
              <div
                className={`${
                  isMobile ? "grid grid-cols-1 gap-4" : "flex flex-row gap-8"
                }`}
              >
                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="120/80"
                    value={fields.patientBloodPressure}
                    onChange={(e) =>
                      handleChange("patientBloodPressure", e.target.value)
                    }
                  />
                  <FieldDescription>Blood Pressure (mmHg)</FieldDescription>
                </Field>
                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="72"
                    value={fields.patientHeartRate}
                    onChange={(e) =>
                      handleChange("patientHeartRate", e.target.value)
                    }
                  />
                  <FieldDescription>Heart Rate (BPM)</FieldDescription>
                </Field>
                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="16"
                    value={fields.patientRespiratoryRate}
                    onChange={(e) =>
                      handleChange("patientRespiratoryRate", e.target.value)
                    }
                  />
                  <FieldDescription>Respiratory Rate</FieldDescription>
                </Field>
                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="98"
                    value={fields.patientOxygenSaturation}
                    onChange={(e) =>
                      handleChange("patientOxygenSaturation", e.target.value)
                    }
                  />
                  <FieldDescription>Oxygen Saturation (%)</FieldDescription>
                </Field>
              </div>
              <div
                className={`${
                  isMobile ? "grid grid-cols-1 gap-4" : "flex flex-row gap-8"
                }`}
              >
                <Field className="mx-auto w-full">
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="170"
                    value={fields.patientHeight}
                    onChange={(e) =>
                      handleChange("patientHeight", e.target.value)
                    }
                  />
                  <FieldDescription>Height (cm)</FieldDescription>
                </Field>

                <Field className="mx-auto w-full">
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="62"
                    value={fields.patientWeight}
                    onChange={(e) =>
                      handleChange("patientWeight", e.target.value)
                    }
                  />
                  <FieldDescription>Weight (kg)</FieldDescription>
                </Field>

                <Field>
                  <Input
                    type="text"
                    // className="h-12 md:h-14 !text-lg md:!text-xl px-4 md:px-5"
                    placeholder="36.5"
                    value={fields.patientTemperature}
                    onChange={(e) =>
                      handleChange("patientTemperature", e.target.value)
                    }
                  />
                  <FieldDescription>Temperature (°C)</FieldDescription>
                </Field>
              </div>
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg md:text-xl font-semibold">
                    Health History
                  </h2>
                  <p className="text-sm text-gray-500">
                    Please check if any of the following apply
                  </p>
                </div>

                {/* CHECKLIST */}
                <div className="divide-y rounded-xl border overflow-hidden">
                  {/* Medical Care */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <FieldLabel>
                      Are you presently under medical care?
                    </FieldLabel>
                    <Checkbox
                      className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                      checked={fields.patientisMedicalCare}
                      onCheckedChange={(checked) =>
                        handleChange("patientisMedicalCare", checked)
                      }
                    />
                  </div>

                  {/* Drug Allergy */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <FieldLabel>Do you have any drug allergies?</FieldLabel>
                    <Checkbox
                      checked={fields.patientDrugAllergy}
                      className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                      onCheckedChange={(checked) =>
                        handleChange("patientDrugAllergy", checked)
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
                      checked={fields.patientFoodAllergy}
                      onCheckedChange={(checked) =>
                        handleChange("patientFoodAllergy", checked)
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
                      checked={fields.patientTBPositive}
                      onCheckedChange={(checked) =>
                        handleChange("patientTBPositive", checked)
                      }
                    />
                  </div>

                  {/* Clinician */}
                  <div className="flex items-center justify-between px-4 py-3">
                    <FieldLabel>
                      Have you ever been cared for by a mental health clinician?
                    </FieldLabel>
                    <Checkbox
                      className="size-5 border-gray-300 data-[state=unchecked]:!bg-gray-300 data-[state=checked]:!bg-[#00a896]"
                      checked={fields.patientHasClinician}
                      onCheckedChange={(checked) =>
                        handleChange("patientHasClinician", checked)
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
                      checked={fields.patientDiet}
                      onCheckedChange={(checked) =>
                        handleChange("patientDiet", checked)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* ================= SYMPTOMS ================= */}
              <div className="space-y-3">
                <h2 className="text-lg md:text-xl font-semibold">Symptoms</h2>

                <Field>
                  <Input
                    placeholder="e.g. fever, cough, headache"
                    value={fields.patientSymptoms}
                    onChange={(e) =>
                      handleChange("patientSymptoms", e.target.value)
                    }
                  />
                  <FieldDescription>Describe current symptoms</FieldDescription>
                </Field>
              </div>

              {/* ================= DIAGNOSIS ================= */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg md:text-xl font-semibold">
                    Diagnosis
                  </h2>

                  <Button
                    type="button"
                    size="sm"
                    className="!bg-[#00a896] text-white hover:bg-[#028090]"
                    onClick={handleAddDiagnosis}
                  >
                    + Add
                  </Button>
                </div>

                <div className="space-y-3">
                  {patientDiagnosis.map((diagnosis, index) => (
                    <div
                      key={index}
                      className={`grid ${
                        isMobile ? "grid-cols-1" : "md:grid-cols-4"
                      } gap-3 p-4 border rounded-xl bg-gray-50`}
                    >
                      <Field>
                        <Input
                          placeholder="Diagnosis"
                          value={diagnosis.diagnosis}
                          onChange={(e) =>
                            handleDiagnosisChange(
                              index,
                              "diagnosis",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field>
                        <Input
                          placeholder="Severity"
                          value={diagnosis.severity}
                          onChange={(e) =>
                            handleDiagnosisChange(
                              index,
                              "severity",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      <Field>
                        <Input
                          placeholder="Notes"
                          value={diagnosis.notes}
                          onChange={(e) =>
                            handleDiagnosisChange(
                              index,
                              "notes",
                              e.target.value,
                            )
                          }
                        />
                      </Field>

                      {patientDiagnosis.length > 1 && (
                        <div className="flex items-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="!bg-red-400 text-white hover:bg-[#028090]"
                            onClick={() => handleRemoveDiagnosis(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-semibold">
                  Family History
                </h2>
                <p className="text-sm text-gray-500">
                  Provide age and indicate relevant conditions
                </p>
              </div>

              {/* TABLE HEADER */}
              {isMobile ? (
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      className="!bg-[#00a896] text-white hover:bg-[#028090]"
                      onClick={handleAddHistory}
                    >
                      + Add
                    </Button>
                  </div>

                  {familyHistory.map((history, index) => (
                    <Card key={index} className="p-4 space-y-4">
                      <Input
                        placeholder="Relation"
                        value={history.relation}
                        onChange={(e) =>
                          handleHistoryChange(index, "relation", e.target.value)
                        }
                      />

                      <Input
                        placeholder="Age"
                        value={history.age}
                        onChange={(e) =>
                          handleHistoryChange(index, "age", e.target.value)
                        }
                      />

                      <Input
                        placeholder="Health Problems"
                        value={history.healthProblems}
                        onChange={(e) =>
                          handleHistoryChange(
                            index,
                            "healthProblems",
                            e.target.value,
                          )
                        }
                      />

                      <div className="flex justify-between items-center">
                        <span>In Good Health</span>
                        <Checkbox
                          checked={history.goodHealth}
                          className="size-6"
                          onCheckedChange={(checked) =>
                            handleHistoryChange(
                              index,
                              "goodHealth",
                              checked === true,
                            )
                          }
                        />
                      </div>

                      <div className="flex justify-between items-center">
                        <span>Alive</span>
                        <Checkbox
                          checked={history.isAlive}
                          className="size-6"
                          onCheckedChange={(checked) =>
                            handleHistoryChange(
                              index,
                              "isAlive",
                              checked === true,
                            )
                          }
                        />
                      </div>

                      {familyHistory.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          className="w-full"
                          onClick={() => handleRemoveHistory(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {/* TABLE HEADER */}
                  <div className="grid grid-cols-[120px_80px_1fr_120px_80px_100px] px-3 text-l text-gray-600 uppercase items-center">
                    <span>Relation</span>
                    <span>Age</span>
                    <span>Health Problems</span>
                    <span className="text-center">In Good Health</span>
                    <span className="text-center">Alive</span>

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        size="sm"
                        className="!bg-[#00a896] text-white hover:bg-[#028090]"
                        onClick={handleAddHistory}
                      >
                        + Add
                      </Button>
                    </div>
                  </div>

                  {/* ROWS */}
                  <div className="divide-y border rounded-xl overflow-hidden">
                    {familyHistory.map((history, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-[120px_80px_1fr_120px_80px_100px] items-center gap-3 p-3"
                      >
                        {/* your existing row code unchanged */}
                      </div>
                    ))}
                  </div>
                </>
              )}
              <h2 className="text-lg md:text-xl font-semibold">
                Privacy Notice
              </h2>
              <div>
                <Field>
                  <label className="flex items-start gap-3 p-3 ">
                    <Checkbox
                      className="size-5 rounded-none !border-black
                        data-[state=unchecked]:!bg-white
                        data-[state=checked]:!bg-[#00a896]"
                    />

                    <span className="text-sm text-gray-700 leading-relaxed">
                      I confirm that I have informed the patient about the
                      privacy notice.
                    </span>
                  </label>
                </Field>
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {!userIsAdmin && linkedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <Label className="text-lg md:text-xl font-medium text-blue-800 mb-2">
            {userIsSecretary && "Share with Doctor"}
            {userIsDoctor && "Share with Secretary"}
          </Label>
          <Select
            value={selectedLinkedUser}
            onValueChange={setSelectedLinkedUser}
          >
            <SelectTrigger className="!bg-white !text-base md:!text-lg h-12 md:h-14 border-blue-300">
              <SelectValue
                placeholder={`Select a ${
                  userIsSecretary ? "doctor" : "secretary"
                } to share this record with`}
              />
            </SelectTrigger>
            <SelectContent>
              {linkedUsers.map((linkedUser) => (
                <SelectItem key={linkedUser.id} value={linkedUser.id}>
                  {linkedUser.firstName} {linkedUser.lastName}
                  {linkedUser.field && ` - ${linkedUser.field}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex justify-center mt-8 md:mt-10">
        <Button
          type="submit"
          disabled={isLoading}
          className="!bg-orange-400 hover:!bg-orange-500 !text-white !px-8 md:!px-10 !py-4 md:!py-6 !text-xl md:!text-2xl rounded-lg md:rounded-xl transition-all disabled:opacity-50"
        >
          {isLoading ? "Saving..." : "Save Record"}
        </Button>
      </div>
    </form>
  );
}
