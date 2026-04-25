import ee
import json
from datetime import datetime, timedelta, timezone

ee.Initialize(project="velvety-matter-400614")

PUNJAB = ee.Geometry.Rectangle([70.0, 27.5, 75.5, 34.0])


def get_flood_extent(days_back=10):
    now = datetime.now(timezone.utc)

    recent_start   = (now - timedelta(days=days_back)).strftime("%Y-%m-%d")
    recent_end     = now.strftime("%Y-%m-%d")
    baseline_start = (now - timedelta(days=60)).strftime("%Y-%m-%d")
    baseline_end   = (now - timedelta(days=30)).strftime("%Y-%m-%d")

    dummy = ee.Image.constant(-25.0).rename("VH").clip(PUNJAB)
    dummy_col = ee.ImageCollection([dummy])

    def safe_col(start, end):
        real = (
            ee.ImageCollection("COPERNICUS/S1_GRD")
            .filterBounds(PUNJAB)
            .filterDate(start, end)
            .filter(ee.Filter.eq("instrumentMode", "IW"))
            .filter(ee.Filter.listContains("transmitterReceiverPolarisation", "VH"))
            .select("VH")
        )
        return real.merge(dummy_col)

    recent_mean   = safe_col(recent_start, recent_end).mean()
    baseline_mean = safe_col(baseline_start, baseline_end).mean()

    diff    = baseline_mean.subtract(recent_mean)
    flooded = diff.gt(3)

    flooded_clean = (
        flooded
        .focal_min(radius=1, kernelType="square")
        .focal_max(radius=1, kernelType="square")
        .selfMask()
    )

    map_id = flooded_clean.getMapId({
        "min": 0,
        "max": 1,
        "palette": ["white", "0077ff"]
    })

    return {"mapid": map_id["mapid"]}


if __name__ == "__main__":
    result = get_flood_extent()
    print("RESULT:", result)
    with open("flood_result.json", "w") as f:
        json.dump(result, f)
