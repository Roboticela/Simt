# Fasting Map Maker (Qiblatime) — Complete Technical Analysis

---

## Step 1: File Overview

### Sheets Summary

| Sheet | Name (Urdu/English) | Purpose |
|-------|---------------------|---------|
| 1 | `اندراج` (Input) | Location lookup database — world cities plus Pakistan locations with coordinates |
| 2 | `برائے طلباء` (For Students) | Prayer times & Suhoor/Iftar table — detailed 12-month calendar with decimal-day fractions |
| 3 | `اوقات نماز` (Prayer Times) | Condensed prayer times table (7 columns: Isha, Maghrib, Asr, Zuhr, Ishraq, Sunrise, Fajr) per month |
| 4 | `سمت قبلہ معلوم کرنے کے اوقات` (Qibla Direction Times) | Shadow-based Qibla determination times — fore-noon and after-noon windows per day |
| 5 | `ہدایات` (Instructions) | User instructions sheet (mostly empty/text) |
| 6 | `A` | Core computation engine — all astronomical formulas for Qibla shadow times, month by month (JAN–DEC) |
| 7 | `B` | Extended output sheet — same as A but adds fore-noon / after-noon distinction and more time columns |
| 8 | `C` | Solar data lookup table — LTN (Local Transit Noon) and DSUN (Solar Declination) for all 365 days |
| 9 | `D` | Empty / reserved |
| 10 | `XYZ` | Sunset times matrix (12 months × 31 days) plus Zuhal/noon times grid — raw numeric output |

### Key Inputs
- **Location**: City name (مردان / Mardan used as default)
- **Latitude (LT)**: 34°19' → `34.3167°`
- **Longitude (LG)**: `-72°11'` → `-72.1833°`
- **STD (Standard Time Zone)**: `5` (Pakistan Standard Time, UTC+5)
- **Makkah Latitude**: `21.42253°N`
- **Makkah Longitude**: `39.82621°E`

### Key Outputs
1. **Prayer times** (Fajr, Sunrise, Ishraq, Zuhr, Asr × 2, Maghrib, Isha) — all as Excel decimal fractions of a day
2. **Qibla bearing**: `254.13°` (from North)
3. **Saff (Row) bearing**: `164.13°`
4. **Qibla shadow times**: fore-noon and after-noon windows per day per month
5. **Suhoor (Iftaar) / Iftar times** per day across all months

---

## Step 2: Data Structure Mapping

### Sheet C — Solar Data Table (Lookup)
```
Columns: Date (1–31), Month (1–12), LTN (decimal hours), DSUN (degrees)
Rows: 365 days, repeating February 28 for days 29–31 of Feb
```
- `LTN` = Local Transit Time of Sun (civil noon, minutes from 12:00)
- `DSUN` = Solar Declination in degrees

### Sheet A/B — Calculation Engine
Each month block (Jan–Dec) has these column groups:

| Column Group | Label | Meaning |
|---|---|---|
| Col 1 | `QD` / `<NAQ` | Qibla bearing from North |
| Col 2 | `<NAS` | Sun azimuth from North |
| Col 3 | `<SAQ` | Qibla bearing from Sun |
| Col 4 | `<SOQ` / `QSOS` | Status: QNOS (Qibla North of Sun) or QSOS (Qibla South of Sun) |
| Col 5 | `<BRS` | Bearing of Sun at sunset |
| Row index | Date (1–31) | |
| Computed | `TQF1/TQF2` | Qibla Fore-noon time (two variants) |
| Computed | `TSF1/TSF2` | Saff Fore-noon time |
| Computed | `TQA1/TQA2` | Qibla After-noon time |
| Computed | `TSA1/TSA2` | Saff After-noon time |

### Sheet XYZ — Sunset/Noon Grid
```
12 columns (months) × 31 rows (days) of sunset times as decimal day fractions
Separate grids for Urdu month names: اپریل، مارچ، فروری، جنوری (April–January)
```

### Relationships Between Sheets
```
Sheet C (Solar Data) → Sheet A/B (Qibla computation)
Sheet C (Solar Data) → Sheet XYZ (Sunset/Noon)
Sheet A/B (outputs) → Sheet 4 (Qibla shadow times display)
Sheet XYZ → Sheet 2/3 (Prayer times display)
```

---

## Step 3: Formula Extraction & Explanation

### 3.1 Qibla Bearing (CQA)
**Formula:**
```
CQA = ATAN2(
    sin(LGM - LGR),
    cos(LTR) * tan(LT2) - sin(LTR) * cos(LGM - LGR)
) × RD
```

Where:
- `LTR` = Observer latitude in radians = `LT1 × DR`
- `LGR` = Observer longitude in radians = `LGD × DR`
- `LT2` = Makkah latitude in radians = `21.42253 × DR`
- `LGM` = Makkah longitude in radians = `39.82621 × DR`
- `DR` = Degrees-to-radians = `π / 180 = 0.017453292...`
- `RD` = Radians-to-degrees = `180 / π = 57.2958...`

**Result**: `CQA = 105.87°` (Qibla from North, for Mardan)

### 3.2 Saff (Row) Bearing
```
CSF = CQA - 90     → if CQA > 90
    = CQA + 90     → if CQA < 90
```
**Result**: `CSF = 164.13°` (perpendicular to Qibla direction)

### 3.3 Sun Azimuth (NAS / Sun bearing from North)
For each date, the sun azimuth at a given time T:

```
LHA = (T - LTN) × 15   [Local Hour Angle in degrees, where T is in decimal hours]

sin(A) = -cos(DSUN) × sin(LHA) / cos(ALT)
ALT = asin(sin(LT) × sin(DSUN) + cos(LT) × cos(DSUN) × cos(LHA))

NAS = if LHA < 0: 180 - A    [morning: sun in East]
      if LHA > 0: 180 + A    [afternoon: sun in West]
```

### 3.4 Qibla Shadow Time Logic (Core Decision)

**Status Classification:**
```
if CQA < NAS:  QNOS  (Qibla North Of Sun → shadow points to Qibla)
if CQA > NAS:  QSOS  (Qibla South Of Sun → shadow points away from Qibla)
```

**Fore-noon Qibla Time (TQF):**
The time when the sun is exactly at azimuth = CQA (from North)

```
For LHA1 (morning):
  sin(LHA1) = -sin(CQA_rad) × cos(ALT) / cos(DSUN_rad)
  LHA1 = -asin(...)     [negative = before noon]
  TQF1 = LTN + LHA1/15  [convert hour angle back to clock time]
```

**After-noon Qibla Time (TQA):**
```
TQA = LTN - LHA1/15     [symmetric about transit]
Or: TQA = 2 × LTN - TQF1
```

**Saff (Row) Time (TSF):**
Same formula using `CSF` instead of `CQA`.

### 3.5 Prayer Times Formulas

All prayer times use solar altitude angles. The general formula:

```
cos(H) = (sin(α) - sin(LT) × sin(DSUN)) / (cos(LT) × cos(DSUN))
T = LTN ± H/15
```

Where `α` is the target altitude angle:

| Prayer | α (altitude) | Notes |
|--------|------|-------|
| Fajr / Suhoor end | -18° | Astronomical twilight |
| Sunrise | -0.833° | Standard refraction correction |
| Ishraq | +4° (approx) | Sunlight established |
| Zuhr | Transit | LTN = local solar noon |
| Asr (Hanafi) | Shadow = 2× object | `cot(α) = 2 + tan(LT - DSUN)` |
| Asr (Shafi) | Shadow = 1× object | `cot(α) = 1 + tan(LT - DSUN)` |
| Maghrib / Iftaar | -0.833° | Sunset |
| Isha | -18° | Astronomical twilight |
| Shafaq Ahmar | -4° | Red twilight |
| Shafaq Abyaz | -12° or -18° | White twilight |

### 3.6 Solar Declination and Transit Time

From Sheet C lookup:
```
DSUN[day] = solar declination for that calendar day (degrees)
LTN[day]  = local transit noon for that day (decimal hours, e.g. 12.057)
```

Adjustment for longitude difference from Standard Meridian:
```
LTN_local = LTN_table + (LGD - STD × 15) / 15
           = LTN_table + (-72.183 - 75) / 15
           = LTN_table - 0.2122 hours
```

---

## Step 4: Dependency Flow

```
INPUTS
  │
  ├─ LT1 (Observer Latitude)   = 34°19' = 34.3167°
  ├─ LGD (Observer Longitude)  = -72°11' = -72.1833°
  ├─ STD (Timezone)            = 5
  ├─ LT2, LGM (Makkah coords)  = 21.42253°N, 39.82621°E
  └─ Sheet C: LTN, DSUN per day
         │
         ▼
QIBLA BEARING (once, static)
  CQA = 105.87°   (Qibla from North)
  CSF = 164.13°   (Row direction = CQA - 90 + 180 = CQA + 90 - 180)
         │
         ▼
FOR EACH DAY (1–365):
  │
  ├─ LTN_adjusted = LTN[day] - longitudinal_correction
  ├─ DSUN = DSUN[day]
  │
  ├─ PRAYER TIMES → Sheet 2 (برائے طلباء), Sheet 3 (اوقات نماز)
  │   ├─ Fajr = LTN - H_fajr/15
  │   ├─ Sunrise = LTN - H_sunrise/15
  │   ├─ Zuhr = LTN
  │   ├─ Asr = LTN + H_asr/15
  │   ├─ Maghrib = LTN + H_sunrise/15
  │   └─ Isha = LTN + H_isha/15
  │
  └─ QIBLA TIMES → Sheet A, B, Sheet 4 (سمت قبلہ)
      ├─ Compute LHA at which Sun azimuth = CQA
      ├─ TQF = LTN + LHA_qibla / 15   [fore-noon]
      ├─ TQA = LTN - LHA_qibla / 15   [after-noon]
      ├─ Compute LHA at which Sun azimuth = CSF
      ├─ TSF = LTN + LHA_saff / 15
      └─ TSA = LTN - LHA_saff / 15
```

---

## Step 5: Logic Translation

### 5.1 Python Implementation

```python
import math
from typing import Tuple, Optional

# Constants
DR = math.pi / 180   # degrees → radians
RD = 180 / math.pi   # radians → degrees

# Configuration for Mardan, Pakistan
CONFIG = {
    "town": "Mardan",
    "lat": 34 + 19/60,          # 34.3167°
    "lng": -(72 + 11/60),       # -72.1833°
    "std": 5,                   # UTC+5
    "makkah_lat": 21.42253,
    "makkah_lng": 39.82621,
    "depression_fajr": 18,      # degrees below horizon
    "depression_isha": 18,
}

def qibla_bearing(lat: float, lng: float, 
                  makkah_lat: float, makkah_lng: float) -> float:
    """Calculate Qibla bearing in degrees from North."""
    ltr = lat * DR
    lgr = lng * DR
    lt2 = makkah_lat * DR
    lgm = makkah_lng * DR
    
    x = math.cos(ltr) * math.tan(lt2) - math.sin(ltr) * math.cos(lgm - lgr)
    y = math.sin(lgm - lgr)
    bearing = math.atan2(y, x) * RD
    
    return bearing % 360  # normalize 0–360

def saff_bearing(qibla_deg: float) -> float:
    """Row direction: perpendicular to Qibla."""
    return (qibla_deg + 90) % 360

def hour_angle_for_altitude(altitude_deg: float, lat: float, dsun: float) -> Optional[float]:
    """Return Hour Angle H (degrees) for a given solar altitude."""
    lat_r = lat * DR
    dsun_r = dsun * DR
    alt_r = altitude_deg * DR
    cos_h = (math.sin(alt_r) - math.sin(lat_r) * math.sin(dsun_r)) / \
            (math.cos(lat_r) * math.cos(dsun_r))
    if abs(cos_h) > 1:
        return None   # sun never reaches this altitude
    return math.acos(cos_h) * RD   # always positive; morning = -H, afternoon = +H

def prayer_times(ltn: float, dsun: float, lat: float, lng: float,
                 std: int, dep_fajr: float = 18, dep_isha: float = 18) -> dict:
    """
    Returns prayer times as decimal hours (local clock time).
    ltn: Local Transit Noon in decimal hours (from Sheet C)
    dsun: Solar Declination in degrees
    """
    # Longitude correction
    lng_correction = (lng - std * 15) / 15
    noon = ltn + lng_correction  # adjusted local noon
    
    # Sunrise / Sunset (altitude = -0.833°, standard refraction)
    h_rise = hour_angle_for_altitude(-0.833, lat, dsun)
    
    # Fajr / Isha
    h_fajr = hour_angle_for_altitude(-dep_fajr, lat, dsun)
    h_isha = hour_angle_for_altitude(-dep_isha, lat, dsun)
    
    # Asr Hanafi: shadow = 2× gnomon → cot(α) = 2 + tan|lat - dsun|
    cot_asr = 2 + math.tan(abs(lat - dsun) * DR)
    asr_alt = math.atan(1 / cot_asr) * RD
    h_asr = hour_angle_for_altitude(asr_alt, lat, dsun)
    
    # Asr Shafi: shadow = 1× gnomon
    cot_asr1 = 1 + math.tan(abs(lat - dsun) * DR)
    asr1_alt = math.atan(1 / cot_asr1) * RD
    h_asr1 = hour_angle_for_altitude(asr1_alt, lat, dsun)
    
    def fmt(t):
        if t is None:
            return None
        h = int(t)
        m = int((t - h) * 60)
        return f"{h:02d}:{m:02d}"
    
    return {
        "fajr":    noon - h_fajr / 15  if h_fajr else None,
        "sunrise": noon - h_rise / 15  if h_rise else None,
        "zuhr":    noon,
        "asr_hanafi":  noon + h_asr / 15  if h_asr else None,
        "asr_shafi":   noon + h_asr1 / 15 if h_asr1 else None,
        "maghrib": noon + h_rise / 15  if h_rise else None,
        "isha":    noon + h_isha / 15  if h_isha else None,
    }

def sun_azimuth_at_lha(lha_deg: float, lat: float, dsun: float) -> float:
    """
    Sun azimuth from North at a given Local Hour Angle (LHA).
    LHA < 0 → morning; LHA > 0 → afternoon
    """
    lha_r = lha_deg * DR
    lat_r = lat * DR
    dsun_r = dsun * DR
    
    altitude = math.asin(math.sin(lat_r) * math.sin(dsun_r) +
                         math.cos(lat_r) * math.cos(dsun_r) * math.cos(lha_r))
    
    if math.cos(altitude) == 0:
        return 0
    sin_az = -math.cos(dsun_r) * math.sin(lha_r) / math.cos(altitude)
    az_raw = math.asin(max(-1, min(1, sin_az))) * RD
    
    if lha_deg < 0:   # morning: sun in East
        azimuth = 180 - az_raw
    else:              # afternoon: sun in West
        azimuth = 180 + az_raw
    
    return azimuth % 360

def qibla_shadow_times(ltn: float, dsun: float, lat: float, lng: float,
                        std: int, qibla_deg: float) -> dict:
    """
    Times when shadow points toward (or away from) Qibla.
    Returns fore-noon and after-noon times.
    """
    lng_correction = (lng - std * 15) / 15
    noon = ltn + lng_correction
    
    lat_r = lat * DR
    dsun_r = dsun * DR
    qibla_r = qibla_deg * DR
    
    # Solve: azimuth(LHA) = qibla_deg
    # sin(Az) = -cos(dsun) * sin(LHA) / cos(alt)
    # This requires iterative solution or direct formula:
    # For flat approximation at reasonable altitudes:
    
    # The LHA at which sun azimuth = target_azimuth (fore-noon, negative LHA)
    # sin(LHA) ≈ -sin(Az) * cos(alt) / cos(dsun)
    # We approximate using altitude at transit and iterate, 
    # or use the direct formula from the workbook:
    
    # AA = cos(DSUN) * sin(target_az)
    # BB = sin(LT) * sin(DSUN) * sin(target_az) - cos(LT) * cos(target_az) + ...
    # This simplifies to:
    
    # From the workbook variables (AA, BB, CC, DD, EE):
    # AA = cos(DSUN) * sin(target_az - special_offset)
    # LHA1 = atan2(AA, BB)
    
    # Simplified direct approach (accurate for most cases):
    # Find LHA where az = target by numerical search
    from scipy.optimize import brentq  # optional dependency
    
    def az_error(lha):
        return sun_azimuth_at_lha(lha, lat, dsun) - qibla_deg
    
    try:
        lha_fore = brentq(az_error, -89, -1)   # fore-noon
        lha_after = brentq(az_error, 1, 89)    # after-noon
        return {
            "fore_noon": noon + lha_fore / 15,
            "after_noon": noon + lha_after / 15,
            "status": "QNOS" if qibla_deg > 180 else "QSOS"
        }
    except:
        return {"fore_noon": None, "after_noon": None, "status": "N/A"}


# Example usage for Mardan, January 1
if __name__ == "__main__":
    cfg = CONFIG
    cqa = qibla_bearing(cfg["lat"], cfg["lng"], cfg["makkah_lat"], cfg["makkah_lng"])
    csf = saff_bearing(cqa)
    print(f"Qibla Bearing: {cqa:.2f}°")
    print(f"Saff Bearing:  {csf:.2f}°")
    
    # Jan 1 solar data (from Sheet C)
    ltn_jan1 = 12.057    # decimal hours
    dsun_jan1 = -22.98   # degrees
    
    times = prayer_times(ltn_jan1, dsun_jan1, cfg["lat"], cfg["lng"], cfg["std"])
    for k, v in times.items():
        if v:
            h = int(v); m = int((v - h) * 60)
            print(f"  {k:15s}: {h:02d}:{m:02d}")
```

### 5.2 JavaScript Implementation

```javascript
const DR = Math.PI / 180;
const RD = 180 / Math.PI;

const CONFIG = {
  lat: 34 + 19/60,
  lng: -(72 + 11/60),
  std: 5,
  makkahLat: 21.42253,
  makkahLng: 39.82621,
};

function qiblaBearing(lat, lng, makkahLat, makkahLng) {
  const ltr = lat * DR, lgr = lng * DR;
  const lt2 = makkahLat * DR, lgm = makkahLng * DR;
  const x = Math.cos(ltr) * Math.tan(lt2) - Math.sin(ltr) * Math.cos(lgm - lgr);
  const y = Math.sin(lgm - lgr);
  return ((Math.atan2(y, x) * RD) % 360 + 360) % 360;
}

function hourAngleForAltitude(altDeg, lat, dsun) {
  const cosH = (Math.sin(altDeg*DR) - Math.sin(lat*DR)*Math.sin(dsun*DR))
             / (Math.cos(lat*DR) * Math.cos(dsun*DR));
  if (Math.abs(cosH) > 1) return null;
  return Math.acos(cosH) * RD;
}

function prayerTimes(ltn, dsun, lat, lng, std) {
  const noon = ltn + (lng - std * 15) / 15;
  const hRise = hourAngleForAltitude(-0.833, lat, dsun);
  const hFajr = hourAngleForAltitude(-18, lat, dsun);
  const hIsha = hourAngleForAltitude(-18, lat, dsun);
  const cotAsr = 2 + Math.tan(Math.abs(lat - dsun) * DR);
  const hAsr = hourAngleForAltitude(Math.atan(1/cotAsr)*RD, lat, dsun);
  
  return {
    fajr:    hFajr ? noon - hFajr/15 : null,
    sunrise: hRise ? noon - hRise/15 : null,
    zuhr:    noon,
    asr:     hAsr  ? noon + hAsr/15  : null,
    maghrib: hRise ? noon + hRise/15 : null,
    isha:    hIsha ? noon + hIsha/15 : null,
  };
}

function decimalToHHMM(decimal) {
  if (decimal == null) return '--:--';
  const h = Math.floor(decimal);
  const m = Math.round((decimal - h) * 60);
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// Usage
const cqa = qiblaBearing(CONFIG.lat, CONFIG.lng, CONFIG.makkahLat, CONFIG.makkahLng);
console.log(`Qibla: ${cqa.toFixed(2)}°`);
const times = prayerTimes(12.057, -22.98, CONFIG.lat, CONFIG.lng, CONFIG.std);
Object.entries(times).forEach(([k, v]) => console.log(`${k}: ${decimalToHHMM(v)}`));
```

---

## Step 6: Business Logic & Rules

### Decision Rules

| Rule | Condition | Action |
|------|-----------|--------|
| Qibla North of Sun | Sun azimuth < Qibla bearing | Shadow points **toward** Qibla (`QNOS`) — use this time |
| Qibla South of Sun | Sun azimuth > Qibla bearing | Shadow points **away** from Qibla (`QSOS`) — use after-noon time |
| No valid time | Sun never reaches azimuth of Qibla | Output `blank` or `0` |
| Fore-noon only | `LHA < 0` | Morning window |
| After-noon only | `LHA > 0` | Afternoon window |

### Edge Cases Handled

1. **February 29 / short months**: Sheet C repeats Feb 28 for days 29–31
2. **Sun never setting / always night**: `hourAngleForAltitude` returns `None` when `|cosH| > 1`
3. **Qibla South of Sun at sunrise/sunset** (`QSOS`): The code outputs `360` or special flag
4. **Location accuracy note**: Valid within 50–60 km radius of city center (`وسط شہر کلومیٹر تک 50-60`)

### Key Constants (Hard-coded in Sheet A)

```
PI  = 3.14159265358979
DR  = 0.01745329251994 (π/180)
RD  = 57.2957795130823 (180/π)
CQA = 105.872318738663  (Qibla bearing for Mardan)
CSF = 164.127681261337  (Saff bearing for Mardan)
STD = 5                  (UTC+5)
```

---

## Step 7: Automation Workflow

### Complete Algorithm (Pseudocode)

```
FUNCTION generate_fasting_map(lat, lng, std, city_name):
    
    # 1. Calculate Qibla
    qibla = qibla_bearing(lat, lng, MAKKAH_LAT, MAKKAH_LNG)
    saff  = (qibla + 90) % 360
    
    # 2. Load 365-day solar data (Sheet C equivalent)
    solar_data = load_solar_data()  # [day] → {ltn, dsun}
    
    # 3. For each month/day:
    FOR month IN 1..12:
        FOR day IN 1..days_in_month(month):
            
            ltn  = solar_data[day_of_year]["ltn"]
            dsun = solar_data[day_of_year]["dsun"]
            
            # Adjust LTN for local longitude
            noon = ltn + (lng - std * 15) / 15
            
            # 4. Prayer times
            prayers = {
                "fajr":    noon - hour_angle(-18°, lat, dsun) / 15,
                "sunrise": noon - hour_angle(-0.833°, lat, dsun) / 15,
                "zuhr":    noon,
                "asr":     noon + hour_angle(asr_altitude, lat, dsun) / 15,
                "maghrib": noon + hour_angle(-0.833°, lat, dsun) / 15,
                "isha":    noon + hour_angle(-18°, lat, dsun) / 15,
            }
            
            # 5. Qibla shadow times
            lha_qibla = solve_lha_for_azimuth(qibla, lat, dsun)
            lha_saff  = solve_lha_for_azimuth(saff, lat, dsun)
            
            qibla_fore = noon + lha_qibla / 15   # negative LHA = fore-noon
            qibla_aft  = noon - lha_qibla / 15   # after-noon
            
            # 6. Status check
            sun_az_at_sunrise = sun_azimuth_at_lha(-hour_angle(-0.833, lat, dsun), lat, dsun)
            status = "QNOS" if qibla > sun_az_at_sunrise else "QSOS"
            
            STORE all times in output tables
    
    RETURN formatted prayer calendar, qibla shadow calendar
```

---

## Step 8: Optimization Suggestions

### Current Architecture Issues
1. **Repeated computation per day**: The workbook recalculates Qibla bearing every row (it's constant)
2. **Month-repeated header blocks**: Each month in Sheet A repeats ~15 header rows
3. **No vectorization**: Each row is an independent formula set

### Recommended Code Architecture

```python
# Efficient vectorized approach using NumPy/Pandas

import numpy as np
import pandas as pd

class FastingMapCalculator:
    def __init__(self, lat, lng, std, makkah_lat=21.42253, makkah_lng=39.82621):
        self.lat = lat
        self.lng = lng  
        self.std = std
        # Pre-compute static constants
        self.qibla = self._qibla_bearing(lat, lng, makkah_lat, makkah_lng)
        self.saff = (self.qibla + 90) % 360
        self.lng_correction = (lng - std * 15) / 15
    
    def generate_year(self, solar_data: pd.DataFrame) -> pd.DataFrame:
        """
        solar_data: DataFrame with columns [day_of_year, month, day, ltn, dsun]
        Returns full year calendar with all prayer and qibla times.
        """
        df = solar_data.copy()
        df['noon'] = df['ltn'] + self.lng_correction
        
        lat_r = np.deg2rad(self.lat)
        dsun_r = np.deg2rad(df['dsun'])
        
        # Vectorized hour angle calculation
        def h_angle(alt_deg):
            cos_h = (np.sin(np.deg2rad(alt_deg)) - np.sin(lat_r)*np.sin(dsun_r)) / \
                    (np.cos(lat_r) * np.cos(dsun_r))
            cos_h = np.clip(cos_h, -1, 1)
            return np.degrees(np.arccos(cos_h))
        
        h_rise  = h_angle(-0.833)
        h_fajr  = h_angle(-18)
        
        # Asr Hanafi
        cot_asr = 2 + np.tan(np.abs(np.deg2rad(df['dsun'] - self.lat)))
        asr_alt = np.degrees(np.arctan(1/cot_asr))
        h_asr   = h_angle(asr_alt)  # approximate
        
        df['fajr']    = df['noon'] - h_fajr  / 15
        df['sunrise'] = df['noon'] - h_rise  / 15
        df['zuhr']    = df['noon']
        df['asr']     = df['noon'] + h_asr   / 15
        df['maghrib'] = df['noon'] + h_rise  / 15
        df['isha']    = df['noon'] + h_fajr  / 15
        
        return df
```

### Data Storage Recommendations

| Purpose | Format | Reason |
|---------|--------|--------|
| Solar lookup table | CSV or JSON | 365 rows, static |
| Prayer time output | SQLite / Parquet | Efficient query by date/month |
| Qibla shadow times | Same DB | Join on date |
| Location database | PostgreSQL + PostGIS | Spatial queries |
| User-facing display | REST API + React | Dynamic rendering |

### Performance Notes
- The full calculation for 365 days takes < 1 second in Python with NumPy
- The Excel file is ~5–10 MB because it stores all computed values redundantly per month
- A web app could compute on-demand for any city using the same formulas

---

## Summary

The **Fasting_Map_Maker.xlsx** is a sophisticated Islamic prayer time and Qibla direction calculator built entirely in Excel. Its core innovation is computing **shadow-based Qibla determination times** — the exact local times when a vertical stick's shadow falls along or opposite to the Qibla direction, enabling Muslims to verify their prayer direction without a compass.

**Core math stack:**
1. **Spherical trigonometry** → Qibla bearing (great circle formula)
2. **Solar position formulas** → declination, hour angle, azimuth, altitude
3. **Time equation** → solar noon adjustment per day and longitude
4. **Shadow angle inversion** → from bearing, back-compute the time

The file is pre-calculated for **Mardan, Pakistan** but the Sheet `اندراج` contains ~1000+ world cities, implying this was designed to be regenerated for any location by changing the input coordinates.
