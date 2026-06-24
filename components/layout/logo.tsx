import Image from "next/image";
import { cn } from "@/lib/utils";

export function HeapifyLogo({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-md", className)}>
      <Image
        src="/Heapify_withbg.jpeg"
        alt="Heapify Global Community Logo"
        fill
        className="object-cover"
        priority
      />
    </div>
  );
}
