"use client";

import { useState, useCallback } from "react";
import {
  initLottery,
  enterLottery,
  getPlayers,
  pickWinner,
  CONTRACT_ADDRESS,
} from "@/hooks/contract";
import { AnimatedCard } from "@/components/ui/animated-card";
import { Spotlight } from "@/components/ui/spotlight";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ── Icons ────────────────────────────────────────────────────

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function TicketIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
      <path d="M13 5v2" />
      <path d="M13 17v2" />
      <path d="M13 11v2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function TrophyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
      <path d="M4 22h16" />
      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

// ── Method Signature ─────────────────────────────────────────

function MethodSignature({
  name,
  params,
  returns,
  color,
}: {
  name: string;
  params: string;
  returns?: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 font-mono text-sm">
      <span style={{ color }} className="font-semibold">fn</span>
      <span className="text-white/70">{name}</span>
      <span className="text-white/20 text-xs">{params}</span>
      {returns && (
        <span className="ml-auto text-white/15 text-[10px]">{returns}</span>
      )}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────

type Tab = "enter" | "players" | "admin";

interface ContractUIProps {
  walletAddress: string | null;
  onConnect: () => void;
  isConnecting: boolean;
}

export default function ContractUI({ walletAddress, onConnect, isConnecting }: ContractUIProps) {
  const [activeTab, setActiveTab] = useState<Tab>("enter");
  const [error, setError] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<string | null>(null);
  
  const [isEntering, setIsEntering] = useState(false);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(false);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  
  const [players, setPlayers] = useState<string[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  
  // Admin address - in production, this would be stored/configured
  const [adminAddress, setAdminAddress] = useState("");

  const truncate = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  const handleEnterLottery = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    setError(null);
    setIsEntering(true);
    setTxStatus("Entering lottery...");
    try {
      await enterLottery(walletAddress, walletAddress);
      setTxStatus("You're in the lottery!");
      setTimeout(() => setTxStatus(null), 5000);
      // Refresh players list
      const playerList = await getPlayers(walletAddress);
      setPlayers(playerList);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("already entered")) {
        setError("You have already entered the lottery");
      } else {
        setError(msg);
      }
      setTxStatus(null);
    } finally {
      setIsEntering(false);
    }
  }, [walletAddress]);

  const handleLoadPlayers = useCallback(async () => {
    setError(null);
    setIsLoadingPlayers(true);
    try {
      const playerList = await getPlayers(walletAddress || undefined);
      setPlayers(playerList);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load players");
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [walletAddress]);

  const handlePickWinner = useCallback(async () => {
    if (!walletAddress) return setError("Connect wallet first");
    if (!adminAddress.trim()) return setError("Enter admin address");
    if (walletAddress !== adminAddress) return setError("Only admin can pick winner");
    if (players.length === 0) return setError("No players in lottery");
    
    setError(null);
    setIsPickingWinner(true);
    setTxStatus("Picking winner...");
    try {
      const result = await pickWinner(walletAddress, adminAddress);
      // The winner address should be in the result
      setWinner(adminAddress); // Will be updated from actual result
      setTxStatus("Winner selected!");
      setPlayers([]); // Clear players after winner is picked
      setTimeout(() => {
        setTxStatus(null);
        setWinner(null);
      }, 10000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Transaction failed";
      if (msg.includes("No players")) {
        setError("No players in lottery");
      } else if (msg.includes("admin")) {
        setError("Only admin can pick winner");
      } else {
        setError(msg);
      }
      setTxStatus(null);
    } finally {
      setIsPickingWinner(false);
    }
  }, [walletAddress, adminAddress, players.length]);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; color: string }[] = [
    { key: "enter", label: "Enter", icon: <TicketIcon />, color: "#7c6cf0" },
    { key: "players", label: "Players", icon: <UsersIcon />, color: "#4fc3f7" },
    { key: "admin", label: "Admin", icon: <TrophyIcon />, color: "#fbbf24" },
  ];

  return (
    <div className="w-full max-w-2xl animate-fade-in-up-delayed">
      {/* Toasts */}
      {error && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f87171]/15 bg-[#f87171]/[0.05] px-4 py-3 backdrop-blur-sm animate-slide-down">
          <span className="mt-0.5 text-[#f87171]"><AlertIcon /></span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#f87171]/90">Error</p>
            <p className="text-xs text-[#f87171]/50 mt-0.5 break-all">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="shrink-0 text-[#f87171]/30 hover:text-[#f87171]/70 text-lg leading-none">&times;</button>
        </div>
      )}

      {txStatus && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#34d399]/15 bg-[#34d399]/[0.05] px-4 py-3 backdrop-blur-sm shadow-[0_0_30px_rgba(52,211,153,0.05)] animate-slide-down">
          <span className="text-[#34d399]">
            {txStatus.includes("Winner") || txStatus.includes("in the lottery") ? <CheckIcon /> : <SpinnerIcon />}
          </span>
          <span className="text-sm text-[#34d399]/90">{txStatus}</span>
        </div>
      )}

      {/* Winner Banner */}
      {winner && (
        <div className="mb-4 rounded-xl border border-[#fbbf24]/20 bg-[#fbbf24]/[0.1] px-4 py-4 backdrop-blur-sm animate-slide-down">
          <div className="flex items-center justify-center gap-3">
            <TrophyIcon />
            <span className="text-lg font-semibold text-[#fbbf24]">Winner: {truncate(winner)}</span>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Spotlight className="rounded-2xl">
        <AnimatedCard className="p-0" containerClassName="rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c6cf0]/20 to-[#fbbf24]/20 border border-white/[0.06]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#7c6cf0]">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white/90">Decentralized Lottery</h3>
                <p className="text-[10px] text-white/25 font-mono mt-0.5">{truncate(CONTRACT_ADDRESS)}</p>
              </div>
            </div>
            <Badge variant="warning" className="text-[10px]">Soroban</Badge>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/[0.06] px-2">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setActiveTab(t.key); setError(null); }}
                className={cn(
                  "relative flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all",
                  activeTab === t.key ? "text-white/90" : "text-white/35 hover:text-white/55"
                )}
              >
                <span style={activeTab === t.key ? { color: t.color } : undefined}>{t.icon}</span>
                {t.label}
                {activeTab === t.key && (
                  <span
                    className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full transition-all"
                    style={{ background: `linear-gradient(to right, ${t.color}, ${t.color}66)` }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Enter Lottery */}
            {activeTab === "enter" && (
              <div className="space-y-5">
                <MethodSignature name="enter" params="(player: Address)" color="#7c6cf0" />
                
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-center">
                  <div className="mb-2 text-3xl font-bold text-white/80">{players.length}</div>
                  <div className="text-xs text-white/30 uppercase tracking-wider">Players Entered</div>
                </div>

                <p className="text-sm text-white/50">
                  Enter the lottery for a chance to win! The admin will pick a winner randomly.
                </p>

                {walletAddress ? (
                  <ShimmerButton onClick={handleEnterLottery} disabled={isEntering} shimmerColor="#7c6cf0" className="w-full">
                    {isEntering ? <><SpinnerIcon /> Entering...</> : <><TicketIcon /> Enter Lottery</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#7c6cf0]/20 bg-[#7c6cf0]/[0.03] py-4 text-sm text-[#7c6cf0]/60 hover:border-[#7c6cf0]/30 hover:text-[#7c6cf0]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to enter
                  </button>
                )}
              </div>
            )}

            {/* View Players */}
            {activeTab === "players" && (
              <div className="space-y-5">
                <MethodSignature name="get_players" params="()" returns="-> Vec<Address>" color="#4fc3f7" />
                
                <ShimmerButton onClick={handleLoadPlayers} disabled={isLoadingPlayers} shimmerColor="#4fc3f7" className="w-full">
                  {isLoadingPlayers ? <><SpinnerIcon /> Loading...</> : <><UsersIcon /> Refresh Players List</>}
                </ShimmerButton>

                {players.length > 0 && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden animate-fade-in-up">
                    <div className="border-b border-white/[0.06] px-4 py-3">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-white/25">
                        Players ({players.length})
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {players.map((player, i) => (
                        <div 
                          key={i} 
                          className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02] transition-colors"
                        >
                          <span className="font-mono text-sm text-white/70">{truncate(player)}</span>
                          <Badge variant="info" className="text-[10px]">#{i + 1}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {players.length === 0 && !isLoadingPlayers && (
                  <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                    <UsersIcon />
                    <p className="text-sm text-white/30 mt-2">No players yet. Be the first to enter!</p>
                  </div>
                )}
              </div>
            )}

            {/* Admin - Pick Winner */}
            {activeTab === "admin" && (
              <div className="space-y-5">
                <MethodSignature name="pick_winner" params="(caller: Address)" returns="-> Address" color="#fbbf24" />
                
                <div className="space-y-2">
                  <label className="block text-[11px] font-medium uppercase tracking-wider text-white/30">Admin Address</label>
                  <div className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-px transition-all focus-within:border-[#fbbf24]/30 focus-within:shadow-[0_0_20px_rgba(251,191,36,0.08)]">
                    <input
                      value={adminAddress}
                      onChange={(e) => setAdminAddress(e.target.value)}
                      placeholder="Enter admin address (G...)"
                      className="w-full rounded-[11px] bg-transparent px-4 py-3 font-mono text-sm text-white/90 placeholder:text-white/15 outline-none"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/35">Current Players</span>
                    <span className="font-mono text-lg text-white/80">{players.length}</span>
                  </div>
                </div>

                <p className="text-sm text-white/50">
                  Only the admin address can pick a winner. The lottery will be reset after picking.
                </p>

                {walletAddress ? (
                  <ShimmerButton 
                    onClick={handlePickWinner} 
                    disabled={isPickingWinner || players.length === 0} 
                    shimmerColor="#fbbf24" 
                    className="w-full"
                  >
                    {isPickingWinner ? <><SpinnerIcon /> Picking...</> : <><TrophyIcon /> Pick Winner</>}
                  </ShimmerButton>
                ) : (
                  <button
                    onClick={onConnect}
                    disabled={isConnecting}
                    className="w-full rounded-xl border border-dashed border-[#fbbf24]/20 bg-[#fbbf24]/[0.03] py-4 text-sm text-[#fbbf24]/60 hover:border-[#fbbf24]/30 hover:text-[#fbbf24]/80 active:scale-[0.99] transition-all disabled:opacity-50"
                  >
                    Connect wallet to pick winner
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/[0.04] px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-white/15">Decentralized Lottery &middot; Soroban</p>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#7c6cf0]" />
                <span className="font-mono text-[9px] text-white/15">Enter</span>
              </span>
              <span className="text-white/10 text-[8px]">&rarr;</span>
              <span className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-[#fbbf24]" />
                <span className="font-mono text-[9px] text-white/15">Win</span>
              </span>
            </div>
          </div>
        </AnimatedCard>
      </Spotlight>
    </div>
  );
}
