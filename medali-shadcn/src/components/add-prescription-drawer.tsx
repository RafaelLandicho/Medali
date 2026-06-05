"use client";

import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import type { Patient } from "./medical_records";

import { AddPrescription } from "./add-prescription";

type PrescriptionDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
};

export function PrescriptionDrawer({
  open,
  onOpenChange,
  patient,
}: PrescriptionDrawerProps) {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="!w-[95vw] !max-w-[1000px] h-[90vh] p-6">
          <DialogHeader>
            <DialogTitle>Add Prescription</DialogTitle>
            <DialogDescription>
              Create A Prescription for you&apos;re patient herte. Click save
              when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <AddPrescription
              patient={{
                patientId: patient.id,
                firstName: patient.firstName,
                lastName: patient.lastName,
                gender: patient.gender,
                age: patient.age,
                address: patient.address,
                patientDiagnosis: patient.patientDiagnosis ?? [],
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Prescription</DrawerTitle>
          <DrawerDescription>
            Create A Prescription for you&apos;re patient herte. Click save when
            you&apos;re done.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <AddPrescription
            patient={{
              patientId: patient.id,
              firstName: patient.firstName,
              lastName: patient.lastName,
              gender: patient.gender,
              age: patient.age,
              address: patient.address,
              patientDiagnosis: patient.patientDiagnosis ?? [],
            }}
          />
        </div>
        <DrawerFooter className="border-t mt-4">
          <DrawerClose asChild>
            <Button className="!bg-red-400 !text-white" variant="destructive">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
// function ProfileForm({ className }: React.ComponentProps<"form">) {
//   return (
//     <form className={cn("grid items-start gap-6", className)}>
//       <div className="grid gap-3">
//         <Label htmlFor="email">Firstname</Label>
//         <Input type="email" id="email" defaultValue="shadcn@example.com" />
//       </div>
//       <div className="grid gap-3">
//         <Label htmlFor="username">Username</Label>
//         <Input id="username" defaultValue="@shadcn" />
//       </div>
//       <Button type="submit">Save changes</Button>
//     </form>
//   )
// }
