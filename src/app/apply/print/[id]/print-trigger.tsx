"use client";

import { useEffect } from "react";
import { Printer } from "lucide-react";

export default function PrintTrigger() {
  useEffect(() => {
    // 자동 인쇄 기능 해제됨
  }, []);

  return (
    <button
      onClick={() => window.print()}
      className="fixed bottom-8 right-8 flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition-colors print:hidden font-bold"
    >
      <Printer className="w-5 h-5" />
      인쇄하기
    </button>
  );
}
