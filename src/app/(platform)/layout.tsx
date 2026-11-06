import { PlatformGate } from "@/components/shell";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return <PlatformGate>{children}</PlatformGate>;
}
