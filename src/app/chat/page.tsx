"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ChatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const id = crypto.randomUUID();
    router.replace(`/chat/${id}`);
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Loader2 className="text-muted-foreground h-8 w-8 animate-spin" />
    </div>
  );
}
