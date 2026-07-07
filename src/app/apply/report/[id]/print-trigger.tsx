"use client";
import { useEffect } from "react";

export default function PrintTrigger() {
  useEffect(() => {
    // 페이지 로드 완료 후 0.5초 뒤 인쇄 대화상자 호출
    const timer = setTimeout(() => {
      window.print();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
