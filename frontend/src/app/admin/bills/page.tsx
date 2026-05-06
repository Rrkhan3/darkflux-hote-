"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getBills, payBill } from "@/lib/api";
import type { Bill } from "@/lib/api";
import { ArrowLeft, Receipt, CreditCard, DollarSign } from "lucide-react";
import Link from "next/link";

export default function BillsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [payingId, setPayingId] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "staff"))) {
      router.push("/login");
      return;
    }
    if (user) {
      getBills(filter || undefined)
        .then(setBills)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router, filter]);

  const handlePayBill = async (billId: number, method: string) => {
    try {
      setPayingId(billId);
      await payBill(billId, method);
      const updated = await getBills(filter || undefined);
      setBills(updated);
    } catch {
      // ignore
    } finally {
      setPayingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Bills</h1>
          <div className="ml-auto">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setLoading(true); }}
              className="px-3 py-2 bg-card border border-card-border rounded-lg text-sm"
            >
              <option value="">All Bills</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bills.map((bill) => (
            <div
              key={bill.id}
              className="bg-card border border-card-border rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="text-primary" size={18} />
                  <span className="font-bold">{bill.bill_number}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    bill.payment_status === "paid"
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                  }`}
                >
                  {bill.payment_status.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1.5 text-sm">
                {bill.table_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Table</span>
                    <span>{bill.table_number}</span>
                  </div>
                )}
                {bill.room_number && (
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Room</span>
                    <span>{bill.room_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-fg">Subtotal</span>
                  <span>Rs. {bill.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-fg">Tax ({bill.tax_rate}%)</span>
                  <span>Rs. {bill.tax_amount.toFixed(2)}</span>
                </div>
                {bill.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-Rs. {bill.discount.toFixed(2)}</span>
                  </div>
                )}
                <hr className="border-card-border" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">Rs. {bill.total_amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs text-muted-fg mt-3">
                {bill.created_at && new Date(bill.created_at).toLocaleString()}
                {bill.payment_method && ` • ${bill.payment_method}`}
              </div>

              {bill.payment_status === "unpaid" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handlePayBill(bill.id, "cash")}
                    disabled={payingId === bill.id}
                    className="flex-1 py-2 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <DollarSign size={14} /> Cash
                  </button>
                  <button
                    onClick={() => handlePayBill(bill.id, "card")}
                    disabled={payingId === bill.id}
                    className="flex-1 py-2 bg-blue-500 text-white rounded-lg text-xs font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <CreditCard size={14} /> Card
                  </button>
                  <button
                    onClick={() => handlePayBill(bill.id, "esewa")}
                    disabled={payingId === bill.id}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    eSewa
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        {bills.length === 0 && (
          <div className="text-center py-12 text-muted-fg">
            No bills found
          </div>
        )}
      </main>
    </>
  );
}
