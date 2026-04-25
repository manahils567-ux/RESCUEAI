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

async function pass1CollectRefs() {
  return new Promise((resolve, reject) => {
    console.log('🚀 PASS 1: Collecting road node references...');

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
        console.log(`✅ PASS 1 complete`);
        console.log(`Needed Nodes: ${neededNodeIds.size}`);
        console.log(`Saved Ways: ${savedWays.length}`);
        resolve({ neededNodeIds, savedWays });
      })

      .on('error', reject);
  });
}

async function pass2LoadNodesAndSave(neededNodeIds, savedWays) {
  return new Promise((resolve, reject) => {
    console.log('🚀 PASS 2: Loading required nodes + saving roads...');

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

        for (const way of savedWays) {
          const coords = [];

          for (const ref of way.refs) {
            const node = nodeMap.get(ref);
            if (node) {
              coords.push([node.lon, node.lat]);
            }
          }

          if (coords.length < 2) continue;

          bulkOps.push({
            updateOne: {
              filter: { osm_id: String(way.id) },
              update: {
                $set: {
                  osm_id: String(way.id),
                  name: way.tags?.name || way.tags?.ref || 'Unnamed',
                  road_type: way.tags?.highway || 'secondary',
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
            console.log(`💾 Inserted: ${count}`);
            bulkOps = [];
          }
        }

        if (bulkOps.length > 0) {
          await RoadSegment.bulkWrite(bulkOps, {
            ordered: false
          });

          count += bulkOps.length;
        }

        console.log(`🎉 DONE: ${count} roads stored`);
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
  console.error('❌ ERROR:', err);
  process.exit(1);
});