"use client"

import * as React from "react"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import type { Prescription } from "./view-prescriptions"
import { ViewFullPrescription } from "./view-full-prescription"

type PrescriptionDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  prescription: Prescription
}

export function FullPrescriptionDrawer({
  open,
  onOpenChange,
  prescription,
}: PrescriptionDrawerProps) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Full Prescription Details</DrawerTitle>
          </DrawerHeader>
          <div className="p-4">
            <ViewFullPrescription
              open={open}
              onOpenChange={onOpenChange}
              patient={prescription}
            />
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Close</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-[1200px] !w-[90vw]">
        <DialogHeader>
          <DialogTitle>Full Prescription Details</DialogTitle>
        </DialogHeader>
        <ViewFullPrescription
          open={open}
          onOpenChange={onOpenChange}
          patient={prescription}
        />
      </DialogContent>
    </Dialog>
  )
}
