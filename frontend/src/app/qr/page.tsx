"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, Download } from "lucide-react";

function QRContent() {
  const searchParams = useSearchParams();
  const [tableNumber, setTableNumber] = useState(searchParams.get("table") || "1");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const menuUrl = `${baseUrl}/menu?table=${tableNumber}`;

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      <div className="text-center mb-8">
        <QrCode className="mx-auto text-primary mb-3" size={40} />
        <h1 className="text-3xl font-bold">QR Code Generator</h1>
        <p className="text-muted-fg mt-2">
          Generate QR codes for each table for easy ordering
        </p>
      </div>

      <div className="bg-card border border-card-border rounded-2xl p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Table Number</label>
          <input
            type="text"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full px-4 py-2.5 bg-muted border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter table number"
          />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="bg-white p-6 rounded-xl">
            <QRCodeSVG
              value={menuUrl}
              size={250}
              level="H"
              includeMargin
            />
          </div>
          <p className="text-sm text-muted-fg">Table {tableNumber}</p>
          <p className="text-xs text-muted-fg break-all">{menuUrl}</p>
          <button
            onClick={() => {
              const svg = document.querySelector(".bg-white svg");
              if (!svg) return;
              const svgData = new XMLSerializer().serializeToString(svg);
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              const img = new Image();
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);
                const link = document.createElement("a");
                link.download = `table-${tableNumber}-qr.png`;
                link.href = canvas.toDataURL();
                link.click();
              };
              img.src = "data:image/svg+xml;base64," + btoa(svgData);
            }}
            className="px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Download size={16} /> Download QR Code
          </button>
        </div>
      </div>
    </main>
  );
}

export default function QRPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>}>
        <QRContent />
      </Suspense>
    </>
  );
}
