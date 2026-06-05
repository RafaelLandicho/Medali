import { IconFolderCode } from "@tabler/icons-react"
import { ArrowUpRightIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export function EmptyRecords({ children }: { children?: React.ReactNode }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <IconFolderCode />
        </EmptyMedia>
        <EmptyTitle>No Records Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any records yet. Get started by creating
          your first record.
        </EmptyDescription>
            {children}
      </EmptyHeader>
      <EmptyContent>
      
      </EmptyContent>
     
    </Empty>
  )
}
