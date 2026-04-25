import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface ParkingSlotProps {
  id: number;
  occupied: boolean;
  distance?: number;
}

export const ParkingSlot = ({ id, occupied, distance }: ParkingSlotProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={cn(
          "relative w-32 h-44 rounded-lg border-4 border-dashed flex items-center justify-center transition-all duration-500 shadow-slot",
          occupied
            ? "bg-slot-occupied/15 border-slot-occupied"
            : "bg-slot-free/15 border-slot-free"
        )}
      >
        <span className="absolute top-2 left-2 text-xs font-bold text-muted-foreground">
          P{id}
        </span>
        {occupied ? (
          <Car className="w-16 h-16 text-slot-occupied" strokeWidth={1.5} />
        ) : (
          <span className="text-slot-free font-bold text-lg">FREE</span>
        )}
      </div>
      <div className="text-center">
        <p
          className={cn(
            "text-sm font-semibold",
            occupied ? "text-slot-occupied" : "text-slot-free"
          )}
        >
          Slot {id} · {occupied ? "Occupied" : "Available"}
        </p>
        {distance !== undefined && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {distance.toFixed(1)} cm
          </p>
        )}
      </div>
    </div>
  );
};
