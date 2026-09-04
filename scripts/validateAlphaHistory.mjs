const URL = "http://localhost:3000/api/intel/history";

const history = await fetch(URL).then(async (res) => {
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return res.json();
});

const snapshots = history.snapshots ?? [];

console.log("");
console.log("========================================");
console.log(" AllChain Labs Alpha History Validator");
console.log("========================================");
console.log("");

console.log(`Snapshots available : ${snapshots.length}`);

if (!snapshots.length) {
  console.log("No historical snapshots available.");
  process.exit(0);
}

const dates = snapshots.map((s) => new Date(s.timestamp));

console.log(`Newest              : ${dates[0].toLocaleString()}`);
console.log(
  `Oldest              : ${dates[dates.length - 1].toLocaleString()}`
);

const ageMs =
  snapshots[0].timestamp -
  snapshots[snapshots.length - 1].timestamp;

console.log(
  `History span        : ${(ageMs / 3600000).toFixed(2)} hours`
);

console.log("");
console.log("Expected historical windows:");
console.log(`15 minutes          : ${ageMs >= 15 * 60 * 1000 ? "READY" : "NOT READY"}`);
console.log(`30 minutes          : ${ageMs >= 30 * 60 * 1000 ? "READY" : "NOT READY"}`);
console.log(`1 hour              : ${ageMs >= 60 * 60 * 1000 ? "READY" : "NOT READY"}`);

console.log("");
console.log("Recent snapshots");
console.log("----------------------------------------");

const recent = snapshots.slice(0, 20);

for (let i = 0; i < recent.length; i++) {
  const current = recent[i];

  const previous =
    snapshots[i + 1];

  let gap = "-";

  if (previous) {
    gap =
      `${(
        (current.timestamp -
          previous.timestamp) /
        60000
      ).toFixed(1)} min`;
  }

  console.log(
    `${new Date(current.timestamp).toLocaleTimeString()} | ` +
    `${current.coins} coins | gap from next: ${gap}`
  );
}

console.log("");
console.log("Window availability");
console.log("----------------------------------------");

function findClosest(targetTimestamp) {
  let closest = null;
  let distance = Infinity;

  for (const snapshot of snapshots) {
    const d = Math.abs(
      snapshot.timestamp -
      targetTimestamp
    );

    if (d < distance) {
      distance = d;
      closest = snapshot;
    }
  }

  return {
    snapshot: closest,
    distance
  };
}

const currentTimestamp =
  snapshots[0].timestamp;

for (const minutes of [15, 30, 60]) {
  const target =
    currentTimestamp -
    minutes * 60 * 1000;

  const result =
    findClosest(target);

  if (!result.snapshot) {
    console.log(
      `${minutes}m : NOT FOUND`
    );
    continue;
  }

  console.log(
    `${minutes}m : ` +
    `${new Date(result.snapshot.timestamp).toLocaleTimeString()} | ` +
    `distance ${(result.distance / 60000).toFixed(2)} min`
  );
}

console.log("");
console.log("========================================");
console.log(" Validation complete");
console.log("========================================");
console.log("");
