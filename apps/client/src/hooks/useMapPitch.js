import { useState, useEffect } from "react";
import { useMap } from "react-map-gl/maplibre";

const useMapPitch = (step = 5) => {
  const { current: map } = useMap();
  const [pitch, setPitch] = useState(0);

  useEffect(() => {
    if (!map) return;

    const updatePitch = () => {
      const rounded = Math.round(map.getPitch() / step) * step;
      setPitch((prev) => (prev === rounded ? prev : rounded));
    };

    updatePitch();
    map.on("pitchend", updatePitch);

    return () => map.off("pitchend", updatePitch);
  }, [map, step]);

  return pitch;
};

export default useMapPitch;
