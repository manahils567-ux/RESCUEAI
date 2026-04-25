const RoadSegment = require('../models/RoadSegment');
const RiverGauge  = require('../models/RiverGauge');

const RIVER_DISTRICTS = {
  "Indus":  ["Rajanpur", "DG Khan", "Layyah", "Mianwali", "Rahim Yar Khan"],
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
  gauges.forEach(g => console.log(" ", g.river, "- level:", g.level_cm, "cm, rise:", g.rise_rate_cm_per_hr, "cm/hr"));

  const districtGauge = {};
  for (const gauge of gauges) {
    const districts = RIVER_DISTRICTS[gauge.river] || [];
    for (const d of districts) {
      districtGauge[d] = gauge;
    }
  }

  const roads = await RoadSegment.find({});
  console.log("Roads to process:", roads.length);

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

    const currentWaterM  = gauge.level_cm / 100;
    const riseRateMperHr = (gauge.rise_rate_cm_per_hr || 0) / 100;
    const headroom       = road.elevation_m - currentWaterM;

    if (riseRateMperHr <= 0) {
      bulkOps.push({
        updateOne: {
          filter: { _id: road._id },
          update: { $set: { status: "green", hours_to_cutoff: null, last_calculated: new Date() } }
        }
      });
      continue;
    }

    const distKm    = road.distance_to_river_km || 5;
    const proximity = distKm < 2 ? 1.0 : distKm < 10 ? 0.6 : 0.2;
    const hoursLeft = headroom / (riseRateMperHr * proximity);

    let status;
    if (headroom <= 0)        status = "red";
    else if (hoursLeft <= 2)  status = "red";
    else if (hoursLeft <= 12) status = "amber";
    else                      status = "green";

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
    const result = await RoadSegment.bulkWrite(bulkOps);
    console.log("Roads updated:", result.modifiedCount);
  }

  const [red, amber, green] = await Promise.all([
    RoadSegment.countDocuments({ status: "red" }),
    RoadSegment.countDocuments({ status: "amber" }),
    RoadSegment.countDocuments({ status: "green" }),
  ]);
  console.log("Status summary - red:", red, "amber:", amber, "green:", green);
}

module.exports = { updateAllRoadStatuses };