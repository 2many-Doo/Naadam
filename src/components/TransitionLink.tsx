"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

interface Props {
  href: string;
  children: ReactNode;
  className?: string;
}

export default function TransitionLink({ href, children, className }: Props) {
  const router = useRouter();

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0
    ) {
      return;
    }

    e.preventDefault();

    const navigate = () => {
      router.push(href);
    };

    if (typeof document !== "undefined" && "startViewTransition" in document) {
      (
        document as Document & {
          startViewTransition: (cb: () => void | Promise<void>) => void;
        }
      ).startViewTransition(async () => {
        navigate();
        // Give Next.js time to paint the next page inside the transition
        await new Promise((resolve) => setTimeout(resolve, 80));
      });
    } else {
      navigate();
    }
  };

  return (
    <Link href={href} onClick={handleClick} className={className}>
      {children}
    </Link>
  );
}
