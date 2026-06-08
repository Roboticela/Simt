import { useCallback, useEffect, useRef } from 'react';
import type { MapMouseEvent } from 'maplibre-gl';
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  useMap,
  type MapRef,
} from '@/components/ui/map';
import { useThemeCtx } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

export interface MapFocus {
  lng: number;
  lat: number;
  zoom: number;
}

interface MapClickPickerProps {
  enabled: boolean;
  onPick: (lat: number, lng: number) => void;
}

function MapClickPicker({ enabled, onPick }: MapClickPickerProps) {
  const { map, isLoaded } = useMap();
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    if (!map || !isLoaded || !enabled) return;

    const handleClick = (e: MapMouseEvent) => {
      onPickRef.current(e.lngLat.lat, e.lngLat.lng);
    };

    map.getCanvas().style.cursor = 'crosshair';
    map.on('click', handleClick);
    return () => {
      map.off('click', handleClick);
      map.getCanvas().style.cursor = '';
    };
  }, [map, isLoaded, enabled]);

  return null;
}

interface Props {
  focus: MapFocus;
  pin: { lat: number; lng: number } | null;
  pickOnMap: boolean;
  onPinChange: (lat: number, lng: number) => void;
  onLocate?: (lat: number, lng: number) => void;
  pickHint?: string;
  className?: string;
}

export function WorldLocationMap({
  focus,
  pin,
  pickOnMap,
  onPinChange,
  onLocate,
  pickHint,
  className,
}: Props) {
  const { isDark } = useThemeCtx();
  const mapRef = useRef<MapRef>(null);
  const lastFocus = useRef<string>('');

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const key = `${focus.lng.toFixed(4)}:${focus.lat.toFixed(4)}:${focus.zoom}`;
    if (key === lastFocus.current) return;
    lastFocus.current = key;

    map.flyTo({
      center: [focus.lng, focus.lat],
      zoom: focus.zoom,
      duration: 1100,
      essential: true,
    });
  }, [focus]);

  const handleLocate = useCallback(
    (coords: { longitude: number; latitude: number }) => {
      onLocate?.(coords.latitude, coords.longitude);
      onPinChange(coords.latitude, coords.longitude);
    },
    [onLocate, onPinChange],
  );

  return (
    <div className={cn('no-theme-transition relative h-full w-full overflow-hidden', className)}>
      <Map
        ref={mapRef}
        theme={isDark ? 'dark' : 'light'}
        center={[focus.lng, focus.lat]}
        zoom={focus.zoom}
        className="h-full w-full"
      >
        <MapControls
          position="top-right"
          showZoom
          showLocate={pickOnMap}
          onLocate={handleLocate}
        />
        {pin && (
          <MapMarker
            longitude={pin.lng}
            latitude={pin.lat}
            draggable={pickOnMap}
            onDragEnd={(lngLat) => onPinChange(lngLat.lat, lngLat.lng)}
          >
            <MarkerContent
              className={cn(
                'flex h-10 w-10 -translate-y-1/2 items-center justify-center',
                'rounded-full border-[3px] border-white bg-primary shadow-lg shadow-primary/30',
                pickOnMap && 'ring-4 ring-primary/25',
              )}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-white" />
            </MarkerContent>
          </MapMarker>
        )}
        <MapClickPicker enabled={pickOnMap} onPick={onPinChange} />
      </Map>
      {pickOnMap && pickHint && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/40 to-transparent px-4 pb-3 pt-8">
          <p className="text-center text-[11px] font-semibold uppercase tracking-wide text-foreground/55">
            {pickHint}
          </p>
        </div>
      )}
    </div>
  );
}
