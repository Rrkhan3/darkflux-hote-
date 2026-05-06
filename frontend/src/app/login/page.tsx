"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { login as apiLogin } from "@/lib/api";
import Navbar from "@/components/layout/Navbar";
import { LogIn, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiLogin(username, password);
      login(res.access_token, res.user);
      if (res.user.role === "kitchen") {
        router.push("/kitchen");
      } else if (res.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/menu");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-card-border rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-6">
              <LogIn className="mx-auto text-primary mb-2" size={40} />
              <h1 className="text-2xl font-bold">Staff Login</h1>
              <p className="text-sm text-muted-fg mt-1">
                Sign in to access the management system
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-muted border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter password"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-6 p-4 bg-muted rounded-lg text-xs text-muted-fg">
              <p className="font-medium mb-2">Demo Accounts:</p>
              <p>Admin: admin / admin123</p>
              <p>Staff: waiter1 / staff123</p>
              <p>Kitchen: kitchen1 / kitchen123</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
