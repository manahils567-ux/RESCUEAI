require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const fs = require('fs');
const PbfParser = require('osm-pbf-parser');

const RoadSegment = require('../models/RoadSegment');
const connectDB = require('../config/db');

const FILE_PATH = 'C:/dev/data/pakistan-260423.osm.pbf';

// Punjab bounds
const BOUNDS = {
  minLat: 30.0,
  maxLat: 34.5,
  minLon: 69.0,
  maxLon: 75.5
};

function isInPunjab(lat, lon) {
  return (
    lat >= BOUNDS.minLat &&
    lat <= BOUNDS.maxLat &&
    lon >= BOUNDS.minLon &&
    lon <= BOUNDS.maxLon
  );
}

const VALID_ROADS = [
  'motorway',
  'primary',
  'secondary',
  'tertiary'
];

// ─── DISTRICT RESOLUTION ───────────────────────────────────────
// Full Punjab district center list. Roads are matched to the
// nearest district center by their midpoint coordinate.
const DISTRICT_CENTERS = [
  { name: "Rajanpur",        lat: 29.10, lng: 70.33 },
  { name: "DG Khan",         lat: 30.70, lng: 70.65 },
  { name: "Muzaffargarh",    lat: 30.07, lng: 71.19 },
  { name: "Layyah",          lat: 30.96, lng: 70.94 },
  { name: "Multan",          lat: 30.19, lng: 71.47 },
  { name: "Bahawalpur",      lat: 29.39, lng: 71.68 },
  { name: "Rahim Yar Khan",  lat: 28.42, lng: 70.30 },
  { name: "Mianwali",        lat: 32.58, lng: 71.54 },
  { name: "Bhakkar",         lat: 31.63, lng: 71.06 },
  { name: "Lahore",          lat: 31.55, lng: 74.35 },
  { name: "Faisalabad",      lat: 31.42, lng: 73.09 },
  { name: "Gujranwala",      lat: 32.16, lng: 74.19 },
  { name: "Sialkot",         lat: 32.49, lng: 74.53 },
  { name: "Sargodha",        lat: 32.08, lng: 72.67 },
  { name: "Sahiwal",         lat: 30.67, lng: 73.10 },
  { name: "Gujrat",          lat: 32.57, lng: 74.08 },
  { name: "Jhelum",          lat: 32.94, lng: 73.73 },
  { name: "Sheikhupura",     lat: 31.71, lng: 73.98 },
  { name: "Kasur",           lat: 31.12, lng: 74.45 },
  { name: "Okara",           lat: 30.81, lng: 73.45 },
  { name: "Toba Tek Singh",  lat: 30.97, lng: 72.48 },
  { name: "Jhang",           lat: 31.27, lng: 72.32 },
  { name: "Chiniot",         lat: 31.72, lng: 72.98 },
  { name: "Hafizabad",       lat: 32.07, lng: 73.69 },
  { name: "Mandi Bahauddin", lat: 32.59, lng: 73.49 },
  { name: "Narowal",         lat: 32.10, lng: 74.87 },
  { name: "Attock",          lat: 33.77, lng: 72.36 },
  { name: "Chakwal",         lat: 32.93, lng: 72.86 },
  { name: "Khushab",         lat: 32.30, lng: 72.35 },
  { name: "Pakpattan",       lat: 30.34, lng: 73.39 },
  { name: "Vehari",          lat: 30.03, lng: 72.35 },
  { name: "Lodhran",         lat: 29.53, lng: 71.63 },
  { name: "Khanewal",        lat: 30.30, lng: 71.93 },
  { name: "Nankana Sahib",   lat: 31.45, lng: 73.70 },
  { name: "Bahawalnagar",    lat: 29.99, lng: 73.25 },
];

function resolveDistrict(lat, lng) {
  let nearest = null;
  let minDist = Infinity;

  for (const d of DISTRICT_CENTERS) {
    const dist = Math.sqrt(Math.pow(lat - d.lat, 2) + Math.pow(lng - d.lng, 2));
    if (dist < minDist) {
      minDist = dist;
      nearest = d.name;
    }
  }

  // ~1.1 degrees (~120km) sanity cutoff — loosened from the original 0.75
  // to account for large districts (DG Khan, Rahim Yar Khan) where the
  // true center point can be far from roads still legitimately inside
  // district bounds.
  return minDist < 1.1 ? nearest : null;
}

async function pass1CollectRefs() {
  return new Promise((resolve, reject) => {
    console.log('PASS 1: Collecting road node references...');

    const parser = new PbfParser();
    const neededNodeIds = new Set();
    const savedWays = [];

    fs.createReadStream(FILE_PATH)
      .pipe(parser)

      .on('data', (items) => {
        for (const item of items) {
          if (item.type !== 'way') continue;

          const highway = item.tags?.highway;
          if (!VALID_ROADS.includes(highway)) continue;
          if (!item.refs || item.refs.length < 2) continue;

          item.refs.forEach(ref => neededNodeIds.add(ref));

          savedWays.push({
            id: item.id,
            refs: item.refs,
            tags: item.tags
          });
        }
      })

      .on('end', () => {
        console.log(`PASS 1 complete`);
        console.log(`Needed Nodes: ${neededNodeIds.size}`);
        console.log(`Saved Ways: ${savedWays.length}`);
        resolve({ neededNodeIds, savedWays });
      })

      .on('error', reject);
  });
}

async function pass2LoadNodesAndSave(neededNodeIds, savedWays) {
  return new Promise((resolve, reject) => {
    console.log('PASS 2: Loading required nodes + saving roads...');

    const parser = new PbfParser();
    const nodeMap = new Map();

    fs.createReadStream(FILE_PATH)
      .pipe(parser)

      .on('data', async (items) => {
        for (const item of items) {
          if (item.type !== 'node') continue;

          if (neededNodeIds.has(item.id)) {
            if (isInPunjab(item.lat, item.lon)) {
              nodeMap.set(item.id, {
                lat: item.lat,
                lon: item.lon
              });
            }
          }
        }
      })

      .on('end', async () => {
        console.log(`Loaded Nodes: ${nodeMap.size}`);

        let bulkOps = [];
        let count = 0;
        let districtsAssigned = 0;
        let districtsMissing = 0;

        for (const way of savedWays) {
          const coords = [];

          for (const ref of way.refs) {
            const node = nodeMap.get(ref);
            if (node) {
              coords.push([node.lon, node.lat]);
            }
          }

          if (coords.length < 2) continue;

          // Use the midpoint of the road geometry to determine its district
          const mid = coords[Math.floor(coords.length / 2)]; // [lng, lat]
          const district = resolveDistrict(mid[1], mid[0]);

          if (district) districtsAssigned++;
          else districtsMissing++;

          bulkOps.push({
            updateOne: {
              filter: { osm_id: String(way.id) },
              update: {
                $set: {
                  osm_id: String(way.id),
                  name: way.tags?.name || way.tags?.ref || 'Unnamed',
                  road_type: way.tags?.highway || 'secondary',
                  district,
                  geometry: {
                    type: 'LineString',
                    coordinates: coords
                  },
                  elevation_m: 0,
                  status: 'green'
                }
              },
              upsert: true
            }
          });

          if (bulkOps.length >= 500) {
            await RoadSegment.bulkWrite(bulkOps, {
              ordered: false
            });

            count += bulkOps.length;
            console.log(`Inserted: ${count}`);
            bulkOps = [];
          }
        }

        if (bulkOps.length > 0) {
          await RoadSegment.bulkWrite(bulkOps, {
            ordered: false
          });

          count += bulkOps.length;
        }

        console.log(`DONE: ${count} roads stored`);
        console.log(`Districts assigned: ${districtsAssigned}`);
        console.log(`Districts unresolved (null): ${districtsMissing}`);
        resolve();
      })

      .on('error', reject);
  });
}

async function loadRoads() {
  await connectDB();

  const { neededNodeIds, savedWays } = await pass1CollectRefs();

  await pass2LoadNodesAndSave(neededNodeIds, savedWays);

  process.exit(0);
}

loadRoads().catch(err => {
  console.error('ERROR:', err);
  process.exit(1);
});