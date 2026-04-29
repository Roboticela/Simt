import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';
import { useAppSettings } from '../context/SettingsContext';
import { compassDirection, distanceToMakkah, qiblaBearing, saffBearing } from '../lib/qibla';
import { useLang } from '../contexts/LanguageContext';
import { t } from '../lib/i18n';

export function QiblaCard() {
  const { settings } = useAppSettings();
  const { lang } = useLang();
  const { qibla, saff, distance } = useMemo(() => {
    const qb = qiblaBearing(settings.location);
    return { qibla: qb, saff: saffBearing(qb), distance: distanceToMakkah(settings.location) };
  }, [settings.location]);

  return (
    <Card
      title={t(lang, 'qiblaDirection')}
      subtitle={t(lang, 'distanceExplain')}
      delay={0.1}
    >
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_1fr]">
        <CompassDial bearing={qibla} />
        <StatBox label={t(lang, 'qiblaFromN')} value={`${qibla.toFixed(2)}°`} sub={compassDirection(qibla)} />
        <StatBox label={t(lang, 'saffRow')} value={`${saff.toFixed(2)}°`} sub={compassDirection(saff)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge tone="primary">Makkah</Badge>
        <span className="text-xs text-foreground/50">
          {distance.toLocaleString(undefined, { maximumFractionDigits: 0 })} km {t(lang, 'fromMakkah')}
        </span>
      </div>
    </Card>
  );
}

function StatBox({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="rounded-2xl border border-border/50 bg-accent/30 p-4"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-foreground/45">{label}</p>
      <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-foreground/50">{sub}</p>}
    </motion.div>
  );
}

/* ─── SVG Compass ─────────────────────────────────────────────── */
const SIZE  = 160;
const CX    = SIZE / 2;   // 80
const CY    = SIZE / 2;   // 80
const R     = 70;         // outer ring radius

/** Degree → radians, 0° = top (North) */
function toRad(deg: number) { return (deg - 90) * (Math.PI / 180); }

/** Point on the circle at given degree and radius */
function pt(deg: number, r: number) {
  const a = toRad(deg);
  return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
}

function CompassDial({ bearing }: { bearing: number }) {
  /* ── tick marks: every 5° (72 total) ── */
  const ticks = Array.from({ length: 72 }, (_, i) => {
    const deg     = i * 5;
    const isCard  = deg % 90  === 0;   // N E S W  — longest
    const isInter = deg % 45  === 0 && !isCard;   // NE SE SW NW
    const is15    = deg % 15  === 0 && deg % 45 !== 0; // 15 30 60…
    const is10    = deg % 10  === 0 && deg % 15 !== 0;

    const innerR = isCard ? R - 16 : isInter ? R - 12 : is15 ? R - 9 : is10 ? R - 7 : R - 5;
    const sw     = isCard ? 2  : isInter ? 1.5 : is15 ? 1 : 0.7;
    const op     = isCard ? 0.75 : isInter ? 0.55 : is15 ? 0.35 : is10 ? 0.25 : 0.15;

    const inner = pt(deg, innerR);
    const outer = pt(deg, R);
    return { deg, inner, outer, sw, op };
  });

  const cardinals  = [
    { label: 'N', deg: 0   },
    { label: 'E', deg: 90  },
    { label: 'S', deg: 180 },
    { label: 'W', deg: 270 },
  ];
  const intercards = [
    { label: 'NE', deg: 45  },
    { label: 'SE', deg: 135 },
    { label: 'SW', deg: 225 },
    { label: 'NW', deg: 315 },
  ];

  /*
   * Needle drawn in absolute SVG coords, symmetric around (CX, CY).
   * Symmetric bounding-box lets `transformBox:fill-box` + `50% 50%`
   * rotate precisely around the compass center — no translate tricks needed.
   */
  const nLen  = 50;   // north tip  CY - nLen
  const sLen  = 50;   // south tip  CY + sLen  (equal → bbox centered at CY)
  const halfW = 5;
  const waist = 3;

  return (
    <div className="flex items-center justify-center rounded-3xl border border-primary/20 bg-primary/6 p-4">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        aria-label={`Compass showing ${bearing.toFixed(1)}° bearing`}
      >
        {/* Background ring */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="var(--card)" fillOpacity="0.5"
          stroke="var(--primary)" strokeOpacity="0.18" strokeWidth="1.5"
        />
        {/* Inner guide ring */}
        <circle
          cx={CX} cy={CY} r={R - 20}
          fill="none"
          stroke="var(--border)" strokeOpacity="0.3" strokeWidth="0.75"
          strokeDasharray="2 4"
        />

        {/* Tick marks */}
        {ticks.map(({ deg, inner, outer, sw, op }) => (
          <line
            key={deg}
            x1={inner.x} y1={inner.y}
            x2={outer.x} y2={outer.y}
            stroke="var(--foreground)"
            strokeOpacity={op}
            strokeWidth={sw}
            strokeLinecap="round"
          />
        ))}

        {/* Cardinal labels */}
        {cardinals.map(({ label, deg }) => {
          const p = pt(deg, R - 26);
          return (
            <text
              key={label}
              x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="11" fontWeight="800"
              fill={label === 'N' ? 'var(--primary)' : 'var(--foreground)'}
              fillOpacity={label === 'N' ? 1 : 0.65}
            >
              {label}
            </text>
          );
        })}

        {/* Intercardinal labels */}
        {intercards.map(({ label, deg }) => {
          const p = pt(deg, R - 26);
          return (
            <text
              key={label}
              x={p.x} y={p.y}
              textAnchor="middle" dominantBaseline="central"
              fontSize="7" fontWeight="700"
              fill="var(--foreground)" fillOpacity="0.3"
            >
              {label}
            </text>
          );
        })}

        {/*
         * transformBox:'fill-box' makes the CSS transform-origin relative
         * to the element's own bounding box.  Because the needle is drawn
         * symmetrically around (CX,CY), 50% 50% of the bbox == (CX,CY).
         * This is the most reliable SVG rotation technique.
         */}
        <motion.g
          style={{ transformBox: 'fill-box', transformOrigin: '50% 50%' }}
          initial={{ rotate: 0 }}
          animate={{ rotate: bearing }}
          transition={{ type: 'spring', stiffness: 90, damping: 18 }}
        >
          {/* North half — primary colour, tip at (CX, CY-nLen) */}
          <polygon
            points={`${CX},${CY - nLen}  ${CX - halfW},${CY + 4}  ${CX},${CY - waist}  ${CX + halfW},${CY + 4}`}
            fill="var(--primary)"
            fillOpacity="0.95"
          />
          {/* South half — muted, tip at (CX, CY+sLen) */}
          <polygon
            points={`${CX},${CY + sLen}  ${CX - halfW},${CY - 4}  ${CX},${CY + waist}  ${CX + halfW},${CY - 4}`}
            fill="var(--foreground)"
            fillOpacity="0.22"
          />
        </motion.g>

        {/* Centre pivot */}
        <circle cx={CX} cy={CY} r="5.5" fill="var(--foreground)" />
        <circle cx={CX} cy={CY} r="3"   fill="var(--card)" />
      </svg>
    </div>
  );
}
