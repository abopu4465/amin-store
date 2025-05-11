"use client"

import type * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface TableActionButtonProps extends ButtonProps {
  onAction: () => void
}

export function TableActionButton({ onAction, children, className, ...props }: TableActionButtonProps) {
  // Use stopPropagation to prevent the click event from bubbling up
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    onAction()
  }

  return (
    <Button onClick={handleClick} className={`table-action-button relative z-10 ${className || ""}`} {...props}>
      {children}
    </Button>
  )
}
