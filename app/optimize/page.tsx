"use client";

import { FlowProvider } from "@/lib/store";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { OptimizeFlow } from "./optimize-flow";

export default function OptimizePage() {
  return (
    <FlowProvider>
      <Header />
      <main className="flex-1 pt-24 pb-16 px-6">
        <div className="max-w-3xl mx-auto">
          <OptimizeFlow />
        </div>
      </main>
      <Footer />
    </FlowProvider>
  );
}
