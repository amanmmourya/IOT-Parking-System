import { useState } from "react";
import { Wifi, WifiOff, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Status = "disconnected" | "connecting" | "connected";

interface Props {
  status: Status;
  url: string;
  onConnect: (url: string) => void;
  onDisconnect: () => void;
}

export const ConnectionBar = ({ status, url, onConnect, onDisconnect }: Props) => {
  const [input, setInput] = useState(url);

  return (
    <div className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center shadow-sm">
      <div className="flex items-center gap-2 min-w-fit">
        <div
          className={cn(
            "w-3 h-3 rounded-full",
            status === "connected" && "bg-slot-free animate-pulse-ring",
            status === "connecting" && "bg-yellow-500 animate-pulse",
            status === "disconnected" && "bg-slot-occupied"
          )}
        />
        <span className="text-sm font-medium capitalize">{status}</span>
      </div>

      <Input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="ws://192.168.1.100:81"
        disabled={status !== "disconnected"}
        className="flex-1"
      />

      {status === "connected" ? (
        <Button onClick={onDisconnect} variant="destructive">
          <WifiOff className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      ) : (
        <Button
          onClick={() => onConnect(input)}
          disabled={status === "connecting"}
        >
          {status === "connecting" ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Wifi className="w-4 h-4 mr-2" />
          )}
          Connect
        </Button>
      )}
    </div>
  );
};
