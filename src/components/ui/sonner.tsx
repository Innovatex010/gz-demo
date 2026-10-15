"use client";

import {
  IconAlertOctagon,
  IconAlertTriangle,
  IconCircleCheck,
  IconInfoCircle,
  IconLoader,
} from "@tabler/icons-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Registry: shadcn/sonner, repointed. The default reads the theme from
 * next-themes; this site is light-only, so depending on a theme provider for a
 * single constant is not worth it.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-center"
      icons={{
        info: <IconInfoCircle size={16} />,
        success: <IconCircleCheck size={16} />,
        warning: <IconAlertTriangle size={16} />,
        error: <IconAlertOctagon size={16} />,
        loading: <IconLoader size={16} className="animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-none !border-[color:var(--line-2)] !bg-[color:var(--paper)] !text-[color:var(--ink)] !shadow-[0_18px_40px_-24px_rgba(0,0,0,.45)]",
          title: "!text-[0.9rem] !font-medium",
          description: "!text-[0.82rem] !text-[color:var(--ink-2)]",
          actionButton:
            "!rounded-4xl !bg-[color:var(--ink)] !text-[color:var(--paper)]",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
