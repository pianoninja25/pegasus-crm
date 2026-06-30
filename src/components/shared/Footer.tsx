import Link from "next/link";
import { Github, Twitter } from "lucide-react";

import { Logo } from "./Logo";
import { siteConfig } from "@/config/site";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="relative mt-32 border-t border-border/60 bg-card/30 backdrop-blur">
      <div className="container py-12">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm space-y-4">
            <Logo />
            <p className="text-sm leading-relaxed text-muted-foreground">
              {siteConfig.description}
            </p>
            <div className="flex gap-2">
              <Link
                href="#"
                aria-label="Twitter"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                <Twitter className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="GitHub"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/60 text-muted-foreground transition-all hover:border-primary/50 hover:text-primary"
              >
                <Github className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <FooterSection
              title="Product"
              links={[
                { label: "Customers", href: "/dashboard/customers" },
                { label: "Quotations", href: "/dashboard/quotations" },
                { label: "Service contracts", href: "/dashboard/contracts" },
                { label: "Scheduling", href: "/dashboard/scheduling" },
                { label: "Reports", href: "/dashboard/reports" },
              ]}
            />
            <FooterSection
              title="Resources"
              links={[
                { label: "Next.js", href: "https://nextjs.org" },
                { label: "shadcn/ui", href: "https://ui.shadcn.com" },
                { label: "Tailwind CSS", href: "https://tailwindcss.com" },
              ]}
            />
            <FooterSection
              title="Family"
              links={[
                { label: "Pegasus Orchestrator", href: "#" },
                { label: "Pegasus WMS", href: "#" },
                { label: "Status", href: "#" },
              ]}
            />
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col-reverse gap-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {siteConfig.author}. Built on the
            same vibe-stack as Orchestrator.
          </span>
          <span className="font-mono uppercase tracking-[0.22em]">
            Next 15 · React 19 · Tailwind · Framer
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterSection({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h4>
      <ul className="space-y-2.5 text-sm">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              href={link.href}
              className="text-foreground/80 transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
