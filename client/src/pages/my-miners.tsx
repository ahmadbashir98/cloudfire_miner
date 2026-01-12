import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { ArrowLeft, Cpu, Clock, DollarSign, Calendar, Activity } from "lucide-react";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MINING_MACHINES_DATA } from "@shared/schema";

interface MinerData {
  id: string;
  machineId: string;
  machineName: string;
  purchasedAt: string;
  expirationDate: string;
  daysUsed: number;
  totalDays: number;
  earnedIncome: number;
  dailyIncome: number;
  status: string;
  remainingHours: number;
  isExpired: boolean;
}

export default function MyMiners() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"running" | "expired">("running");

  const { data: miners, isLoading } = useQuery<MinerData[]>({
    queryKey: ["/api/miners/details", user?.id],
    enabled: !!user,
  });

  const runningMiners = miners?.filter((m) => !m.isExpired) || [];
  const expiredMiners = miners?.filter((m) => m.isExpired) || [];
  const displayMiners = activeTab === "running" ? runningMiners : expiredMiners;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMachineImage = (machineId: string) => {
    const machine = MINING_MACHINES_DATA.find((m) => m.id === machineId);
    const level = machine?.level || 1;
    const colors = [
      "from-blue-500 to-blue-700",
      "from-cyan-500 to-blue-600",
      "from-indigo-500 to-purple-600",
      "from-violet-500 to-purple-700",
      "from-purple-500 to-pink-600",
      "from-pink-500 to-rose-600",
      "from-amber-500 to-orange-600",
      "from-orange-500 to-red-600",
      "from-yellow-400 to-amber-500",
      "from-yellow-300 to-yellow-500",
    ];
    return colors[(level - 1) % colors.length];
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur-lg border-b border-slate-800">
        <div className="flex items-center gap-3 px-4 py-4">
          <Link href="/dashboard">
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
              data-testid="button-back-miners"
            >
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
          </Link>
          <h1 className="text-xl font-bold text-white">Miners</h1>
        </div>

        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab("running")}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === "running"
                ? "text-blue-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
            data-testid="tab-running-miners"
          >
            Running ({runningMiners.length})
            {activeTab === "running" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("expired")}
            className={`flex-1 py-3 text-center font-medium transition-colors relative ${
              activeTab === "expired"
                ? "text-blue-400"
                : "text-slate-400 hover:text-slate-300"
            }`}
            data-testid="tab-expired-miners"
          >
            Expired ({expiredMiners.length})
            {activeTab === "expired" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-4 bg-slate-800/50 border-slate-700">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="flex gap-4">
                <Skeleton className="w-20 h-20 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </Card>
          ))
        ) : displayMiners.length === 0 ? (
          <div className="text-center py-12">
            <Cpu className="w-16 h-16 mx-auto text-slate-600 mb-4" />
            <p className="text-slate-400 text-lg">
              {activeTab === "running"
                ? "No running miners"
                : "No expired miners"}
            </p>
            {activeTab === "running" && (
              <Link href="/machines">
                <button
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                  data-testid="button-rent-first-miner"
                >
                  Rent Your First Miner
                </button>
              </Link>
            )}
          </div>
        ) : (
          displayMiners.map((miner) => (
            <Card
              key={miner.id}
              className="overflow-hidden bg-slate-800/60 border-slate-700/50 shadow-lg shadow-black/20"
              data-testid={`card-miner-${miner.id}`}
            >
              <div className="bg-gradient-to-r from-blue-900/80 to-slate-800/80 px-4 py-3 border-b border-slate-700/50">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-blue-400" />
                  {miner.machineName}
                </h3>
              </div>

              <div className="p-4">
                <div className="flex gap-4">
                  <div
                    className={`w-20 h-20 rounded-xl bg-gradient-to-br ${getMachineImage(
                      miner.machineId
                    )} flex items-center justify-center shadow-lg`}
                  >
                    <Cpu className="w-10 h-10 text-white/90" />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-400">Used/Total:</span>
                      <span className="text-white font-medium">
                        {miner.daysUsed}/{miner.totalDays} Days
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                      <span className="text-slate-400">Earned:</span>
                      <span className="text-emerald-400 font-medium">
                        ${miner.earnedIncome.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-slate-400">Daily:</span>
                      <span className="text-amber-400 font-medium">
                        ${miner.dailyIncome.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-400" />
                      <span className="text-slate-400">Status:</span>
                      <span
                        className={`font-medium ${
                          miner.isExpired ? "text-red-400" : "text-blue-400"
                        }`}
                      >
                        {miner.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/50 px-4 py-3 border-t border-slate-700/50 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Purchase Time:</span>
                  <span className="text-slate-300">
                    {formatDate(miner.purchasedAt)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Expiration Time:</span>
                  <span className="text-slate-300">
                    {formatDate(miner.expirationDate)}
                  </span>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800">
        <div className="flex justify-around py-3">
          <Link href="/dashboard">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors px-4">
              <Activity className="w-5 h-5" />
              <span className="text-xs">Dashboard</span>
            </button>
          </Link>
          <Link href="/machines">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors px-4">
              <Cpu className="w-5 h-5" />
              <span className="text-xs">Rent</span>
            </button>
          </Link>
          <Link href="/my-miners">
            <button className="flex flex-col items-center gap-1 text-blue-400 transition-colors px-4">
              <Cpu className="w-5 h-5" />
              <span className="text-xs">My Miners</span>
            </button>
          </Link>
          <Link href="/payments">
            <button className="flex flex-col items-center gap-1 text-slate-400 hover:text-blue-400 transition-colors px-4">
              <DollarSign className="w-5 h-5" />
              <span className="text-xs">Payments</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
