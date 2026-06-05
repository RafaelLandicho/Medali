import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { Patient } from "./medical_records";
import { ref, update, push, set } from "firebase/database";
import { db } from "@/firebaseConfig";
import { useAuth } from "@/auth/authprovider";
import { toast } from "sonner";

type EditRecordsSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function EditRecordsSheet({
  open,
  onOpenChange,
  patient,
}: EditRecordsSheetProps) {
  const { user } = useAuth();
  const [fields, setFields] = useState(patient);

  useEffect(() => {
    if (patient) setFields(patient);
  }, [patient]);

  const handleChange = (key: keyof Patient, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  };

  const updateRecords = async () => {
    if (!fields.id) {
      toast.error("Invalid patient record.");
      return;
    }
    const logsRef = ref(db, "logs/");
    const patientRef = ref(db, `patients/${fields.id}`);
    const newLog = push(logsRef);
    await update(patientRef, {
      ...fields,
      updatedBy: user?.uid || "",
      updatedAt: Date.now(),
    });
    await set(newLog, {
      medicalRecordLog: `Medical Record updated by ${user?.firstName} ${user?.lastName} `,
      logTime: new Date().toLocaleString(),
    });
    toast.success("Patient record updated successfully.");
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <div className="text-lg space-y-6">
        <SheetContent className="overflow-y-auto p-10 !w-[50vw] !max-w-none !h-screen ">
          <SheetClose
            className="
            absolute top-6 right-6 
            flex items-center justify-center
            rounded-full p-3
            !bg-red-600 hover:!bg-red-700 active:!bg-red-800
            !text-white
            !shadow-none !ring-0 !outline-none !border-none
            transition-colors duration-200
          "
          >
            <X className="w-6 h-6" />
          </SheetClose>

          <SheetHeader>
            <SheetTitle className="text-2xl font-semibold">
              Edit Patient Record
            </SheetTitle>
            <SheetDescription className="text-base  text-2xl text-muted-foreground">
              Make changes to the patient’s record here.
            </SheetDescription>
          </SheetHeader>
          <div className="grid gap-6 py-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <div className="flex justify-center mt-6">
                  <AccordionTrigger className="!text-white !text-2xl !font-semibold !bg-[#00a896] flex items-center gap-2 ">
                    <span>Basic Details</span>
                  </AccordionTrigger>
                </div>
                <AccordionContent className=" !mt-5">
                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="firstName">
                      First Name
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="firstName"
                      placeholder="Enter first name"
                      value={fields.firstName || ""}
                      onChange={(e) =>
                        handleChange("firstName", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="lastName">
                      Last Name
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="lastName"
                      placeholder="Enter last name"
                      value={fields.lastName || ""}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="gender">
                      Gender
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="gender"
                      placeholder="Enter gender"
                      value={fields.gender || ""}
                      onChange={(e) => handleChange("gender", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="age">
                      Age
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="age"
                      placeholder="Enter age"
                      value={fields.age || ""}
                      onChange={(e) => handleChange("age", e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="telephone">
                      Contact Number
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="telephone"
                      placeholder="Enter contact number"
                      value={fields.telephone || ""}
                      onChange={(e) =>
                        handleChange("telephone", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="address">
                      Address
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="address"
                      placeholder="Enter address"
                      value={fields.address || ""}
                      onChange={(e) => handleChange("address", e.target.value)}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <div className="flex justify-center mt-6">
                  <AccordionTrigger className="!text-white !text-2xl !font-semibold !bg-[#00a896] flex items-center gap-2 ">
                    <span>Vital Signs</span>
                  </AccordionTrigger>
                </div>

                <AccordionContent className=" !mt-5">
                  <div className="grid gap-2">
                    <Label
                      className="text-2xl font-medium"
                      htmlFor="bloodPressure"
                    >
                      Blood Pressure
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="bloodPressure"
                      placeholder="Enter blood pressure"
                      value={fields.bloodPressure || ""}
                      onChange={(e) =>
                        handleChange("bloodPressure", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label className="text-2xl font-medium" htmlFor="heartRate">
                      Heart Rate
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="heartRate"
                      placeholder="Enter heart rate"
                      value={fields.heartRate || ""}
                      onChange={(e) =>
                        handleChange("heartRate", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-2xl font-medium"
                      htmlFor="respiratoryRate"
                    >
                      Respiratory Rate
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="respiratoryRate"
                      placeholder="Enter respiratory rate"
                      value={fields.respiratoryRate || ""}
                      onChange={(e) =>
                        handleChange("respiratoryRate", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-2xl font-medium"
                      htmlFor="temperature"
                    >
                      Temperature
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="temperature"
                      placeholder="Enter temperature"
                      value={fields.temperature || ""}
                      onChange={(e) =>
                        handleChange("temperature", e.target.value)
                      }
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label
                      className="text-2xl font-medium"
                      htmlFor="oxygenSaturation"
                    >
                      Oxygen Saturation
                    </Label>
                    <Input
                      className="h-14 !text-2xl px-4"
                      id="oxygenSaturation"
                      placeholder="Enter oxygen saturation"
                      value={fields.oxygenSaturation || ""}
                      onChange={(e) =>
                        handleChange("oxygenSaturation", e.target.value)
                      }
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <SheetFooter>
            <div className="flex justify-center mt-6">
              <Button
                type="button"
                className="!bg-orange-500 !text-white !p-5 !text-2xl w-50"
                onClick={updateRecords}
              >
                Save changes
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </div>
    </Sheet>
  );
}
