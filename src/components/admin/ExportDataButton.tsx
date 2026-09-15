"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Printer, ChevronDown } from "lucide-react";

export interface ExportDataButtonProps {
  filename: string;
  title: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
  printTitle?: string;
}

export function ExportDataButton({
  filename,
  title,
  headers,
  rows,
  printTitle,
}: ExportDataButtonProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // تابع تولید و دانلود فایل CSV با پشتیبانی کامل از حروف فارسی (UTF-8 with BOM)
  const handleExportCSV = () => {
    // افزودن کاراکتر جادویی BOM برای باز شدن بی‌نقص متون فارسی در مایکروسافت اکسل
    const BOM = "\uFEFF";

    const escapeField = (val: string | number | null | undefined) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headerLine = headers.map(escapeField).join(",");
    const dataLines = rows.map((row) => row.map(escapeField).join(","));
    const csvContent = BOM + [headerLine, ...dataLines].join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute("download", `${filename}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDropdownOpen(false);
  };

  // تابع چاپ گزارش و خروجی PDF
  const handlePrint = () => {
    setDropdownOpen(false);
    window.print();
  };

  return (
    <div className="relative inline-block text-right">
      <div className="flex items-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition">
        <button
          type="button"
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold border-l border-emerald-500/50 cursor-pointer"
          title="دانلود مستقیم خروجی اکسل"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>{title}</span>
        </button>

        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-2 py-2 text-emerald-100 hover:text-white cursor-pointer"
          aria-label="سایر گزینه‌های خروجی"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {dropdownOpen && (
        <div
          className="absolute left-0 mt-1.5 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 py-1.5 text-xs text-slate-700 animate-in fade-in slide-in-from-top-1"
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <button
            type="button"
            onClick={handleExportCSV}
            className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-emerald-50 hover:text-emerald-800 transition text-right cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="font-bold">خروجی اکسل (CSV)</div>
              <div className="text-[10px] text-slate-400">سازگار با تمامی نسخه‌های Excel</div>
            </div>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="w-full px-4 py-2.5 flex items-center gap-2.5 hover:bg-indigo-50 hover:text-indigo-800 transition text-right cursor-pointer border-t border-slate-100"
          >
            <Printer className="w-4 h-4 text-indigo-600" />
            <div>
              <div className="font-bold">چاپ / خروجی PDF</div>
              <div className="text-[10px] text-slate-400">قالب رسمی پرینت و ذخیره PDF</div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
