"use client";

import { useState } from "react";
import { Calculator, Pencil, Check, X, Loader2 } from "lucide-react";
import { updateTotalBudget } from "./actions";

interface Props {
  initialBudget: number;
}

export default function BudgetEditor({ initialBudget }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [budget, setBudget] = useState(initialBudget.toString());
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    const numBudget = parseInt(budget.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numBudget) || numBudget < 0) {
      alert("유효한 금액을 입력해 주세요.");
      return;
    }

    setIsSaving(true);
    const res = await updateTotalBudget(numBudget);
    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error);
    }
  }

  function formatNumber(val: string) {
    const num = parseInt(val.replace(/[^0-9]/g, ""), 10);
    if (isNaN(num)) return "";
    return num.toLocaleString();
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 transition-transform group-hover:scale-110" />
      
      <div className="flex items-center justify-between mb-2 relative z-10">
        <p className="text-sm font-semibold text-slate-500">총 배정 예산</p>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-md transition-colors"
          >
            <Pencil className="w-3 h-3" />
            수정
          </button>
        )}
      </div>

      <div className="relative z-10 mt-2 h-[40px] flex items-center">
        {isEditing ? (
          <div className="flex items-center gap-2 w-full">
            <input
              type="text"
              value={formatNumber(budget)}
              onChange={(e) => setBudget(e.target.value)}
              className="flex-1 w-full text-lg font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent px-1 py-1"
              autoFocus
            />
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="p-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 rounded-md transition-colors disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setBudget(initialBudget.toString());
              }}
              disabled={isSaving}
              className="p-1.5 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-md transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <p className="text-3xl font-extrabold text-slate-800">
            {initialBudget.toLocaleString()} <span className="text-lg text-slate-500 font-bold">원</span>
          </p>
        )}
      </div>
    </div>
  );
}
