import Link from "next/link";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export type Crumb = { label: string; href: string };

/**
 * The breadcrumb every content page shares. Always ends at the current page,
 * which is never a link.
 */
export function PageCrumbs({
  trail = [],
  current,
}: {
  trail?: Crumb[];
  current: string;
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList className="text-[0.8rem] text-[color:var(--ink-3)]">
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">Home</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {trail.map((c) => (
          <Fragment key={c.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={c.href}>{c.label}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          </Fragment>
        ))}

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="text-[color:var(--ink-2)]">
            {current}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
