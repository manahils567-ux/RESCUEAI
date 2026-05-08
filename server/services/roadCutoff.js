const RoadSegment = require('../models/RoadSegment');
const RiverGauge = require('../models/RiverGauge');

const RIVER_DISTRICTS = {
  "Indus": ["Rajanpur", "DG Khan", "Layyah", "Mianwali", "Rahim Yar Khan"],
  "Chenab": ["Muzaffargarh", "Multan", "Jhang"],
  "Sutlej": ["Bahawalpur", "Bahawalnagar"],
  "Jhelum": ["Mandi Bahauddin", "Gujrat"],
};

async function updateAllRoadStatuses() {
  const gauges = await RiverGauge.aggregate([
    { $sort: { read_at: -1 } },
    { $group: { _id: "$river", doc: { $first: "$$ROOT" } } },
    { $replaceRoot: { newRoot: "$doc" } }
  ]);

  console.log("Latest gauges found:", gauges.length);
  gauges.forEach(g => console.log(" ", g.river, "- level:", g.level_cs, "Cs, rise:", g.rise_rate_cs_per_hr, "Cs/hr"));

  const districtGauge = {};
  for (const gauge of gauges) {
    const districts = RIVER_DISTRICTS[gauge.river] || [];
    for (const d of districts) districtGauge[d] = gauge;
  }

  const BATCH = 500;
  let skip = 0;
  let totalProcessed = 0;

  while (true) {
    const roads = await RoadSegment.find({})
      .select('_id district elevation_m distance_to_river_km')
      .skip(skip)
      .limit(BATCH)
      .lean();

    if (roads.length === 0) break;

    const bulkOps = [];

    for (const road of roads) {
      const gauge = districtGauge[road.district];

      if (!gauge) {
        bulkOps.push({
          updateOne: {
            filter: { _id: road._id },
            update: { $set: { status: "green", hours_to_cutoff: null, last_calculated: new Date() } }
          }
        });
        continue;
      }

      const currentWaterM = gauge.level_cs / 35.315;   // convert cusecs to m³/s approx water depth
      const riseRateMperHr = (gauge.rise_rate_cs_per_hr || 0) / 35.315;

      const headroom = road.elevation_m - currentWaterM;

      if (riseRateMperHr <= 0) {
        bulkOps.push({
          updateOne: {
            filter: { _id: road._id },
            update: { $set: { status: "green", hours_to_cutoff: null, last_calculated: new Date() } }
          }
        });
        continue;
      }

      const distKm = road.distance_to_river_km || 5;
      const proximity = distKm < 2 ? 1.0 : distKm < 10 ? 0.6 : 0.2;
      const hoursLeft = headroom / (riseRateMperHr * proximity);

      let status;
      if (headroom <= 0) status = "red";
      else if (hoursLeft <= 2) status = "red";
      else if (hoursLeft <= 12) status = "amber";
      else status = "green";

      bulkOps.push({
        updateOne: {
          filter: { _id: road._id },
          update: {
            $set: {
              status,
              hours_to_cutoff: headroom > 0 ? Math.round(hoursLeft * 10) / 10 : 0,
              last_calculated: new Date()
            }
          }
        }
      });
    }

    if (bulkOps.length > 0) {
      await RoadSegment.bulkWrite(bulkOps);
    }

    totalProcessed += roads.length;
    skip += BATCH;

    await new Promise(r => setTimeout(r, 50));
  }

  console.log("Roads updated:", totalProcessed);
}

module.exports = { updateAllRoadStatuses };