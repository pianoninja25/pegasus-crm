"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Map, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapLayerMouseEvent,
  type MapRef,
} from "react-map-gl/maplibre";
import type { GeoJSONSource } from "maplibre-gl";
import { Layers } from "lucide-react";

import "maplibre-gl/dist/maplibre-gl.css";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CUSTOMER_TYPE_META,
  type Customer,
  type CustomerType,
} from "@/features/service/types";
import { cn } from "@/lib/utils";

/* ───────────────────────── Basemap styles ──────────────────────────────── */

export interface MapStyleOption {
  id: string;
  label: string;
  description: string;
  url: string;
  surface: "dark" | "light";
}

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: "liberty",
    label: "Liberty",
    description: "Rich modern colours (OpenFreeMap)",
    url: "https://tiles.openfreemap.org/styles/liberty",
    surface: "light",
  },
  {
    id: "dark",
    label: "Dark matter",
    description: "Minimal black canvas — best for ops dashboards",
    url: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    surface: "dark",
  },
  {
    id: "voyager",
    label: "Voyager",
    description: "Warm muted palette with detailed roads",
    url: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    surface: "light",
  },
  {
    id: "positron",
    label: "Positron",
    description: "Clean light grayscale",
    url: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    surface: "light",
  },
];

/** Centred on Java but zoomed out enough to see the whole archipelago. */
export const INITIAL_VIEW = { longitude: 110, latitude: -2.4, zoom: 4.2 };

export const TYPE_COLOR: Record<CustomerType, string> = {
  residential: "#38bdf8",
  commercial: "#a78bfa",
  industrial: "#fbbf24",
};

const SOURCE_ID = "customers-source";
const LAYER_CLUSTERS = "customers-clusters";
const LAYER_CLUSTER_COUNT = "customers-cluster-count";
const LAYER_POINTS = "customers-points";

/* ───────────────────────── Component ──────────────────────────────────── */

export interface CustomersMapProps {
  customers: Customer[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  /** Optional GeoJSON LineString to overlay (e.g. today's planned route). */
  route?: GeoJSON.FeatureCollection<GeoJSON.LineString> | null;
  /** Tailwind height class (defaults to `h-[520px]`). */
  heightClassName?: string;
  showLegend?: boolean;
  showStyleSwitcher?: boolean;
  overlay?: React.ReactNode;
  className?: string;
}

/**
 * Interactive MapLibre map showing customer pins across Indonesia, with
 * zoom-aware clustering for large datasets, an optional route overlay,
 * a basemap switcher and a colour legend.
 *
 * Behaviour:
 *  - Zoomed out → customers in proximity collapse into a single cluster
 *    circle showing the count. Click the cluster to fly in until it
 *    explodes into smaller clusters or individual pins.
 *  - Zoomed in → individual customer dots, coloured by type. Click a dot
 *    to set the selection (parent component decides what that means).
 *  - The currently-selected customer is rendered on top with an animated
 *    pulse so it's easy to spot even after a fly-to.
 */
export function CustomersMap({
  customers,
  selectedId,
  onSelect,
  route,
  heightClassName = "h-[520px]",
  showLegend = true,
  showStyleSwitcher = true,
  overlay,
  className,
}: CustomersMapProps) {
  const [styleId, setStyleId] = useState<string>("liberty");
  const [cursor, setCursor] = useState<string>("");
  const mapRef = useRef<MapRef | null>(null);
  const style = MAP_STYLES.find((s) => s.id === styleId) ?? MAP_STYLES[0]!;

  /* ── GeoJSON source rebuilt only when the customer list changes ── */
  const customersGeoJson = useMemo<
    GeoJSON.FeatureCollection<GeoJSON.Point>
  >(
    () => ({
      type: "FeatureCollection",
      features: customers.map((c) => ({
        type: "Feature",
        properties: { id: c.id, type: c.type, name: c.name },
        geometry: { type: "Point", coordinates: [c.lng, c.lat] },
      })),
    }),
    [customers],
  );

  const focusCustomer = useCallback(
    (lat: number, lng: number, zoom = 11) => {
      const current = mapRef.current?.getZoom() ?? INITIAL_VIEW.zoom;
      mapRef.current?.flyTo({
        center: [lng, lat],
        zoom: Math.max(current, zoom),
        duration: 700,
        essential: true,
      });
    },
    [],
  );

  /** Parent-driven selection → fly to the chosen pin. */
  useEffect(() => {
    if (!selectedId) return;
    const target = customers.find((c) => c.id === selectedId);
    if (!target) return;
    focusCustomer(target.lat, target.lng, 11);
  }, [selectedId, customers, focusCustomer]);

  /** Click handler: dispatches based on which layer was hit. */
  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) return;
      const map = mapRef.current?.getMap();
      if (!map) return;

      if (feature.layer.id === LAYER_CLUSTERS) {
        const clusterId = feature.properties?.cluster_id as number | undefined;
        if (clusterId == null) return;
        const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;
        source?.getClusterExpansionZoom(clusterId).then((zoom) => {
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          map.flyTo({
            center: coords as [number, number],
            zoom: zoom + 0.2,
            duration: 600,
            essential: true,
          });
        });
        return;
      }

      if (feature.layer.id === LAYER_POINTS) {
        const id = feature.properties?.id as string | undefined;
        if (id) {
          onSelect?.(id);
          const coords = (feature.geometry as GeoJSON.Point).coordinates;
          focusCustomer(coords[1]!, coords[0]!, 11);
        }
      }
    },
    [onSelect, focusCustomer],
  );

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    setCursor(e.features && e.features.length > 0 ? "pointer" : "");
  }, []);

  const handleMouseLeave = useCallback(() => setCursor(""), []);

  const legendEntries = useMemo(
    () =>
      (Object.keys(TYPE_COLOR) as CustomerType[]).map((t) => ({
        type: t,
        color: TYPE_COLOR[t],
        label: CUSTOMER_TYPE_META[t].label,
      })),
    [],
  );

  /* ── Selected customer rendered as an overlay so the pulse is visible. ── */
  const selected = selectedId
    ? customers.find((c) => c.id === selectedId)
    : null;

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-border/60 bg-card/30",
        heightClassName,
        className,
      )}
    >
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW}
        mapStyle={style.url}
        attributionControl={{ compact: true }}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={[LAYER_CLUSTERS, LAYER_POINTS]}
        onClick={handleMapClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        cursor={cursor}
      >
        <NavigationControl
          position="bottom-right"
          showCompass={false}
          visualizePitch={false}
        />

        {route && (
          <Source id="customers-route" type="geojson" data={route}>
            <Layer
              id="customers-route-line"
              type="line"
              paint={{
                "line-color": "hsl(217, 91%, 60%)",
                "line-width": 2.4,
                "line-dasharray": [2.5, 1.5],
                "line-opacity": 0.85,
              }}
              layout={{
                "line-cap": "round",
                "line-join": "round",
              }}
            />
          </Source>
        )}

        <Source
          id={SOURCE_ID}
          type="geojson"
          data={customersGeoJson}
          cluster
          clusterMaxZoom={9}
          clusterRadius={45}
        >
          {/* Cluster bubbles — sized + tinted by point count */}
          <Layer
            id={LAYER_CLUSTERS}
            type="circle"
            filter={["has", "point_count"]}
            paint={{
              "circle-color": [
                "step",
                ["get", "point_count"],
                "hsl(217, 91%, 60%)",
                10,
                "hsl(258, 90%, 66%)",
                25,
                "hsl(280, 87%, 60%)",
                50,
                "hsl(335, 78%, 58%)",
              ],
              "circle-radius": [
                "step",
                ["get", "point_count"],
                11,
                10,
                14,
                25,
                17,
                50,
                20,
              ],
              "circle-opacity": 0.92,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
              "circle-stroke-opacity": 0.95,
            }}
          />
          <Layer
            id={LAYER_CLUSTER_COUNT}
            type="symbol"
            filter={["has", "point_count"]}
            layout={{
              "text-field": ["get", "point_count_abbreviated"],
              "text-font": ["Noto Sans Bold"],
              "text-size": 10,
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            }}
            paint={{
              "text-color": "#ffffff",
            }}
          />

          {/* Individual customer dots, coloured by type. */}
          <Layer
            id={LAYER_POINTS}
            type="circle"
            filter={["!", ["has", "point_count"]]}
            paint={{
              "circle-color": [
                "match",
                ["get", "type"],
                "residential",
                TYPE_COLOR.residential,
                "commercial",
                TYPE_COLOR.commercial,
                "industrial",
                TYPE_COLOR.industrial,
                "hsl(217, 91%, 60%)",
              ],
              "circle-radius": 6,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 1.5,
              "circle-stroke-opacity": 0.95,
            }}
          />
        </Source>

        {/* Selected customer overlay (pulse + ring). */}
        {selected && (
          <Marker
            longitude={selected.lng}
            latitude={selected.lat}
            anchor="center"
            style={{ pointerEvents: "none" }}
          >
            <SelectedMarker
              color={TYPE_COLOR[selected.type]}
              surface={style.surface}
            />
          </Marker>
        )}
      </Map>

      {(overlay || showLegend || showStyleSwitcher) && (
        <div className="pointer-events-none absolute left-3 right-3 top-3 flex flex-wrap items-start gap-2">
          {overlay}
          <div className="pointer-events-auto ml-auto flex items-center gap-2">
            {showLegend && (
              <div className="hidden items-center gap-2 rounded-md border border-border/60 bg-background/85 px-2 py-1 text-[10px] backdrop-blur sm:flex">
                {legendEntries.map((e) => (
                  <div
                    key={e.type}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: e.color }}
                    />
                    {e.label}
                  </div>
                ))}
              </div>
            )}
            {showStyleSwitcher && (
              <MapStyleSwitcher value={styleId} onChange={setStyleId} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Sub-components ─────────────────────────────── */

/** Pulse + ring rendered above the static circle layer for the active pin. */
function SelectedMarker({
  color,
  surface,
}: {
  color: string;
  surface: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        surface === "light" && "drop-shadow-[0_0_4px_rgba(0,0,0,0.55)]",
      )}
    >
      <span
        className="absolute h-9 w-9 rounded-full animate-ping"
        style={{ backgroundColor: `${color}55` }}
      />
      <span
        className="relative inline-flex h-5 w-5 items-center justify-center rounded-full ring-4 transition-all"
        style={{
          backgroundColor: color,
          boxShadow: `0 0 0 2px ${color}33`,
        }}
      >
        <span className="block h-1.5 w-1.5 rounded-full bg-white/90" />
      </span>
    </div>
  );
}

function MapStyleSwitcher({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const current = MAP_STYLES.find((s) => s.id === value) ?? MAP_STYLES[0]!;
  return (
    <div className="pointer-events-auto">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 bg-background/85 px-2 text-xs backdrop-blur"
            title="Change basemap"
          >
            <Layers className="h-3 w-3" />
            {current.label}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Basemap style
          </DropdownMenuLabel>
          {MAP_STYLES.map((opt) => (
            <DropdownMenuItem
              key={opt.id}
              onSelect={() => onChange(opt.id)}
              className="flex flex-col items-start gap-0.5"
            >
              <span className="text-xs font-medium">{opt.label}</span>
              <span className="text-[10px] text-muted-foreground">
                {opt.description}
              </span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
