"use client";

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const PasswordInput = React.forwardRef(({ className, ...props }, ref) => {
  const [visible, setVisible] = React.useState(false)
  return (
    (<div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("w-full pr-12", className)}
        ref={ref}
        {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-accent hover:text-accent-hover">
        {visible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>)
  );
})
PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
