import { useEffect, useRef, useState } from "react";
import { ParkingSlot } from "@/components/ParkingSlot";
import { ConnectionBar, Status } from "@/components/ConnectionBar";
import { toast } from "sonner";

interface SlotData {
  occupied: boolean;
  distance: number;
}

const DEFAULT_URL = "ws://172.17.145.63:81";
const THRESHOLD_CM = 15;

const Index = () => {
  const [status, setStatus] = useState<Status>("disconnected");
  const [url, setUrl] = useState(DEFAULT_URL);
  const [slots, setSlots] = useState<SlotData[]>([
    { occupied: false, distance: 100 },
    { occupied: false, distance: 100 },
    { occupied: false, distance: 100 },
  ]);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = (target: string) => {
    try {
      setStatus("connecting");
      setUrl(target);
      const ws = new WebSocket(target);
      wsRef.current = ws;

      ws.onopen = () => {
        setStatus("connected");
        toast.success("Connected to ESP32");
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);
          if (Array.isArray(data.distances)) {
            setSlots(
              data.distances.slice(0, 3).map((d: number) => ({
                distance: d,
                occupied: d > 0 && d <= THRESHOLD_CM,
              }))
            );
          } else if (Array.isArray(data.slots)) {
            setSlots(data.slots.slice(0, 4));
          }
        } catch (e) {
          console.error("Bad message", evt.data);
        }
      };

      ws.onerror = () => {
        toast.error("WebSocket error");
      };

      ws.onclose = () => {
        setStatus("disconnected");
        wsRef.current = null;
      };
    } catch (e) {
      setStatus("disconnected");
      toast.error("Failed to connect");
    }
  };

  const disconnect = () => {
    wsRef.current?.close();
  };

  useEffect(() => {
    return () => wsRef.current?.close();
  }, []);

  const freeCount = slots.filter((s) => !s.occupied).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Smart Parking Monitor
          </h1>
          <p className="text-muted-foreground">
            Live ESP32 + HC-SR04 parking slot visualization
          </p>
        </header>

        <ConnectionBar
          status={status}
          url={url}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Available slots</p>
              <p className="text-3xl font-bold text-slot-free">
                {freeCount}{" "}
                <span className="text-base text-muted-foreground font-normal">
                  / {slots.length}
                </span>
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slot-free" />
                <span>Free</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-slot-occupied" />
                <span>Occupied</span>
              </div>
            </div>
          </div>

          {/* Parking lot layout */}
          <div className="bg-road rounded-xl p-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
              {slots.map((s, i) => (
                <ParkingSlot
                  key={i}
                  id={i + 1}
                  occupied={s.occupied}
                  distance={s.distance}
                />
              ))}
            </div>
            <div className="mt-6 h-2 rounded bg-yellow-400/80 [background-image:repeating-linear-gradient(90deg,transparent_0_20px,hsl(var(--road))_20px_30px)]" />
            <p className="text-center text-xs text-white/70 mt-2 tracking-widest">
              ←  DRIVEWAY  →
            </p>
          </div>
        </div>

        <details className="bg-card border rounded-xl p-4 text-sm">
          <summary className="cursor-pointer font-semibold">
            Expected WebSocket message format
          </summary>
          <pre className="mt-3 bg-muted p-3 rounded text-xs overflow-x-auto">
{`{ "distances": [12.3, 45.6, 8.1, 100.0] }`}
          </pre>
          <p className="mt-2 text-muted-foreground">
            Distance ≤ {THRESHOLD_CM} cm is treated as occupied.
          </p>
        </details>
      </div>
    </div>
  );
};

export default Index;
