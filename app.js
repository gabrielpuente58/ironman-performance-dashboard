// Current race file
let currentRaceFile = "ironmanarizona2024_clean.csv";

// Expand/collapse chart functionality
function toggleExpand(cardId) {
  const card = document.getElementById(cardId);
  const btn = card.querySelector(".expand-btn i");

  if (card.classList.contains("expanded")) {
    card.classList.remove("expanded");
    btn.classList.remove("fa-compress");
    btn.classList.add("fa-expand");
    document.body.style.overflow = "";

    // Remove backdrop
    const backdrop = document.querySelector(".chart-modal-backdrop");
    if (backdrop) {
      backdrop.remove();
    }
  } else {
    // Create backdrop
    const backdrop = document.createElement("div");
    backdrop.className = "chart-modal-backdrop";
    backdrop.onclick = () => toggleExpand(cardId);
    document.body.appendChild(backdrop);

    card.classList.add("expanded");
    btn.classList.remove("fa-expand");
    btn.classList.add("fa-compress");
    document.body.style.overflow = "hidden";
  }
}

// Close expanded chart on Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const expandedCard = document.querySelector(".chart-card.expanded");
    if (expandedCard) {
      const btn = expandedCard.querySelector(".expand-btn i");
      expandedCard.classList.remove("expanded");
      btn.classList.remove("fa-compress");
      btn.classList.add("fa-expand");
      document.body.style.overflow = "";

      // Remove backdrop
      const backdrop = document.querySelector(".chart-modal-backdrop");
      if (backdrop) {
        backdrop.remove();
      }
    }
  }
});

// Distances (in miles) for known datasets. Swim is in miles; we'll convert to yards when needed.
const raceDistances = {
  "ironmanarizona2024_clean.csv": {
    swimMiles: 2.4,
    bikeMiles: 112,
    runMiles: 26.2,
  },
  "ironman70.3st.george2025_clean.csv": {
    swimMiles: 1.2,
    bikeMiles: 56,
    runMiles: 13.1,
  },
  "ironmanworldchampionship2025_clean.csv": {
    swimMiles: 2.4,
    bikeMiles: 112,
    runMiles: 26.2,
  },
};

// starting athlete for Chart 1
const athleteName = "Zachary Bernier-Michaud";

// helper functions
function hmsToSeconds(t) {
  if (!t) return null;
  const [h, m, s] = t.split(":").map(Number);
  return (h || 0) * 3600 + (m || 0) * 60 + (s || 0);
}
function secondsToHMS(sec) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function shortHMS(sec) {
  const s = Math.round(sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(ss).padStart(2, "0")}`
    : `${m}:${String(ss).padStart(2, "0")}`;
}

function labelPlacementY(d, y, height) {
  const yTop = y(d.value);
  // Always place labels above the bars
  return { y: yTop - 8, inside: false };
}

// Race selector functionality
const raceSelect = document.getElementById("raceSelect");

raceSelect.addEventListener("change", (e) => {
  currentRaceFile = e.target.value;
  loadRaceData(currentRaceFile);
  updatePredictorPlaceholders(); // Update placeholders when race changes
});

// Modal functionality
const statsModal = document.getElementById("statsModal");
const aboutModal = document.getElementById("aboutModal");
const insightBtn1 = document.getElementById("insightBtn1");
const insightBtn2 = document.getElementById("insightBtn2");
const closeStatsModal = document.getElementById("closeStatsModal");
const closeAboutModal = document.getElementById("closeAboutModal");

// Finish Time Predictor functionality
const predictBtn = document.getElementById("predictBtn");
const predictSwim = document.getElementById("predictSwim");
const predictBike = document.getElementById("predictBike");
const predictRun = document.getElementById("predictRun");
const predictorModal = document.getElementById("predictorModal");
const closePredictorModal = document.getElementById("closePredictorModal");
const togglePredictorMode = document.getElementById("togglePredictorMode");

let predictorMode = "time"; // "time" or "pace"

// Function to update predictor placeholders based on current race and mode
function updatePredictorPlaceholders() {
  const distances =
    raceDistances[currentRaceFile] ||
    raceDistances["ironmanarizona2024_clean.csv"];
  const isHalfDistance = distances.runMiles < 20; // 70.3 has 13.1 mile run

  if (predictorMode === "pace") {
    // Pace mode placeholders
    predictSwim.placeholder = isHalfDistance ? "1:45" : "1:50";
    predictBike.placeholder = isHalfDistance ? "22" : "20";
    predictRun.placeholder = isHalfDistance ? "8:00" : "9:00";
  } else {
    // Time mode placeholders
    predictSwim.placeholder = isHalfDistance ? "0:40:00" : "1:30:00";
    predictBike.placeholder = isHalfDistance ? "2:45:00" : "5:45:00";
    predictRun.placeholder = isHalfDistance ? "1:50:00" : "4:15:00";
  }
}

// Toggle between time and pace modes
togglePredictorMode.addEventListener("click", () => {
  const distances =
    raceDistances[currentRaceFile] ||
    raceDistances["ironmanarizona2024_clean.csv"];
  const isHalfDistance = distances.runMiles < 20; // 70.3 has 13.1 mile run

  if (predictorMode === "time") {
    predictorMode = "pace";
    togglePredictorMode.innerHTML =
      '<i class="fa-solid fa-repeat"></i> Switch to Time Mode';

    // Update labels and placeholders for pace mode
    document.querySelector('label[for="predictSwim"]').innerHTML =
      '<i class="fa-solid fa-person-swimming"></i> Swim Pace (min/100yd)';
    predictSwim.value = "";

    document.querySelector('label[for="predictBike"]').innerHTML =
      '<i class="fa-solid fa-person-biking"></i> Bike Pace (mph)';
    predictBike.value = "";

    document.querySelector('label[for="predictRun"]').innerHTML =
      '<i class="fa-solid fa-person-running"></i> Run Pace (min/mile)';
    predictRun.value = "";
  } else {
    predictorMode = "time";
    togglePredictorMode.innerHTML =
      '<i class="fa-solid fa-repeat"></i> Switch to Pace Mode';

    // Update labels and placeholders for time mode
    document.querySelector('label[for="predictSwim"]').innerHTML =
      '<i class="fa-solid fa-person-swimming"></i> Swim Time';
    predictSwim.value = "";

    document.querySelector('label[for="predictBike"]').innerHTML =
      '<i class="fa-solid fa-person-biking"></i> Bike Time';
    predictBike.value = "";

    document.querySelector('label[for="predictRun"]').innerHTML =
      '<i class="fa-solid fa-person-running"></i> Run Time';
    predictRun.value = "";
  }

  // Update placeholders after mode change
  updatePredictorPlaceholders();
});

predictBtn.addEventListener("click", () => {
  let swimSec, bikeSec, runSec;

  if (predictorMode === "time") {
    const swimInput = predictSwim.value.trim();
    const bikeInput = predictBike.value.trim();
    const runInput = predictRun.value.trim();

    // Validate inputs
    if (!swimInput || !bikeInput || !runInput) {
      alert(
        "Please enter all three split times in HH:MM:SS format (e.g., 1:30:00)"
      );
      return;
    }

    // Parse times
    swimSec = hmsToSeconds(swimInput);
    bikeSec = hmsToSeconds(bikeInput);
    runSec = hmsToSeconds(runInput);

    if (!swimSec || !bikeSec || !runSec) {
      alert("Invalid time format. Please use HH:MM:SS (e.g., 1:30:00)");
      return;
    }
  } else {
    // Pace mode
    const swimPaceInput = predictSwim.value.trim(); // min/100yd
    const bikePaceInput = predictBike.value.trim(); // mph
    const runPaceInput = predictRun.value.trim(); // min/mile

    if (!swimPaceInput || !bikePaceInput || !runPaceInput) {
      alert("Please enter all three paces");
      return;
    }

    // Convert paces to times using selected race distances
    const distances =
      raceDistances[currentRaceFile] ||
      raceDistances["ironmanarizona2024_clean.csv"];

    // Swim: pace in min/100yd -> convert swim distance (miles) to yards
    const swimPaceSeconds = hmsToSeconds("0:" + swimPaceInput);
    if (!swimPaceSeconds) {
      alert("Invalid swim pace format. Use MM:SS (e.g., 1:50)");
      return;
    }
    const swimYards = distances.swimMiles * 1760; // yards in the swim
    const swimSegments = swimYards / 100; // number of 100yd segments
    swimSec = swimPaceSeconds * swimSegments;

    // Bike: pace in mph -> use bikeMiles
    const bikeSpeed = parseFloat(bikePaceInput);
    if (!bikeSpeed || bikeSpeed <= 0) {
      alert("Invalid bike speed. Use number (e.g., 20)");
      return;
    }
    bikeSec = (distances.bikeMiles / bikeSpeed) * 3600; // hours to seconds

    // Run: pace in min/mile -> use runMiles
    const runPaceSeconds = hmsToSeconds("0:" + runPaceInput);
    if (!runPaceSeconds) {
      alert("Invalid run pace format. Use MM:SS (e.g., 9:00)");
      return;
    }
    runSec = runPaceSeconds * distances.runMiles;
  }

  // Calculate total time (add estimated transition times)
  const transitionTime = 600; // 10 minutes total for both transitions (T1 + T2)
  const totalSeconds = swimSec + bikeSec + runSec + transitionTime;
  const finishTime = secondsToHMS(totalSeconds);

  // Calculate percentages
  const swimPct = ((swimSec / totalSeconds) * 100).toFixed(1);
  const bikePct = ((bikeSec / totalSeconds) * 100).toFixed(1);
  const runPct = ((runSec / totalSeconds) * 100).toFixed(1);
  const transPct = ((transitionTime / totalSeconds) * 100).toFixed(1);

  // Update modal content
  document.getElementById("modalPredictedTime").textContent = finishTime;
  document.getElementById("modalSwimTime").textContent = secondsToHMS(swimSec);
  document.getElementById("modalSwimPercent").textContent = `${swimPct}%`;
  document.getElementById("modalBikeTime").textContent = secondsToHMS(bikeSec);
  document.getElementById("modalBikePercent").textContent = `${bikePct}%`;
  document.getElementById("modalRunTime").textContent = secondsToHMS(runSec);
  document.getElementById("modalRunPercent").textContent = `${runPct}%`;
  document.getElementById("modalTransitionTime").textContent =
    secondsToHMS(transitionTime);
  document.getElementById(
    "modalTransitionPercent"
  ).textContent = `${transPct}%`;

  // Calculate percentile if we have current data
  let percentileHTML = "";
  if (currentDataset) {
    const validTimes = currentDataset
      .map((d) => hmsToSeconds(d["Overall Time"]))
      .filter((t) => t != null && t > 0)
      .sort((a, b) => a - b);

    const fasterCount = validTimes.filter((t) => t < totalSeconds).length;
    const percentile = ((fasterCount / validTimes.length) * 100).toFixed(1);

    percentileHTML = `<strong>Estimated Performance:</strong> Top ${percentile}% of finishers in this race`;
  } else {
    percentileHTML = "Select a race to see percentile ranking";
  }

  document.getElementById("modalPercentile").innerHTML = percentileHTML;

  // Show modal
  predictorModal.classList.add("show");
});

// Close predictor modal
closePredictorModal.addEventListener("click", () => {
  predictorModal.classList.remove("show");
});

// Close predictor modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === predictorModal) {
    predictorModal.classList.remove("show");
  }
});

// Open modals
insightBtn1.addEventListener("click", () => {
  statsModal.classList.add("show");
});

insightBtn2.addEventListener("click", () => {
  aboutModal.classList.add("show");
  updateAboutModal();
});

// Close modals
closeStatsModal.addEventListener("click", () => {
  statsModal.classList.remove("show");
});

closeAboutModal.addEventListener("click", () => {
  aboutModal.classList.remove("show");
});

// Close modal when clicking outside
window.addEventListener("click", (e) => {
  if (e.target === statsModal) {
    statsModal.classList.remove("show");
  }
  if (e.target === aboutModal) {
    aboutModal.classList.remove("show");
  }
});

// Close modal with Escape key
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    statsModal.classList.remove("show");
    aboutModal.classList.remove("show");
  }
});

// Function to update About modal with race info
function updateAboutModal() {
  const raceOption = raceSelect.options[raceSelect.selectedIndex];
  const raceName = raceOption.textContent;

  document.getElementById("eventName").textContent = raceName;

  if (raceName.includes("70.3")) {
    document.getElementById("eventDistance").textContent =
      "Half Distance (70.3 miles / 113 km)";
  } else {
    document.getElementById("eventDistance").textContent =
      "Full Distance (140.6 miles / 226 km)";
  }

  if (raceName.includes("Arizona")) {
    document.getElementById("eventLocation").textContent =
      "Tempe, Arizona, USA";
  } else if (raceName.includes("St. George")) {
    document.getElementById("eventLocation").textContent =
      "St. George, Utah, USA";
  } else {
    document.getElementById("eventLocation").textContent = "See race details";
  }
}

// Store current dataset for modal stats
let currentDataset = null;

// Function to update stats modal with current data
function updateStatsModal(data) {
  currentDataset = data;

  const validAthletes = data
    .map((d) => ({
      ...d,
      overallSeconds: hmsToSeconds(d["Overall Time"]),
      swimSeconds: hmsToSeconds(d["Swim Time"]),
      bikeSeconds: hmsToSeconds(d["Bike Time"]),
      runSeconds: hmsToSeconds(d["Run Time"]),
    }))
    .filter((d) => d.overallSeconds != null && d.overallSeconds > 0);

  // Total finishers
  document.getElementById("totalFinishers").textContent = validAthletes.length;

  // Average finish time
  const avgOverall =
    validAthletes.reduce((sum, d) => sum + d.overallSeconds, 0) /
    validAthletes.length;
  document.getElementById("avgTime").textContent = secondsToHMS(avgOverall);

  // Fastest time
  const fastest = Math.min(...validAthletes.map((d) => d.overallSeconds));
  document.getElementById("fastestTime").textContent = secondsToHMS(fastest);

  // Average swim time
  const validSwim = validAthletes.filter((d) => d.swimSeconds > 0);
  const avgSwim =
    validSwim.reduce((sum, d) => sum + d.swimSeconds, 0) / validSwim.length;
  document.getElementById("avgSwim").textContent = secondsToHMS(avgSwim);

  // Average bike time
  const validBike = validAthletes.filter((d) => d.bikeSeconds > 0);
  const avgBike =
    validBike.reduce((sum, d) => sum + d.bikeSeconds, 0) / validBike.length;
  document.getElementById("avgBike").textContent = secondsToHMS(avgBike);

  // Average run time
  const validRun = validAthletes.filter((d) => d.runSeconds > 0);
  const avgRun =
    validRun.reduce((sum, d) => sum + d.runSeconds, 0) / validRun.length;
  document.getElementById("avgRun").textContent = secondsToHMS(avgRun);
}

// Function to load and initialize all charts with race data
function loadRaceData(file) {
  // Clear all existing SVG content
  d3.select("#chart1").selectAll("*").remove();
  d3.select("#chart2").selectAll("*").remove();
  d3.select("#chart3").selectAll("*").remove();
  d3.select("#chart4").selectAll("*").remove();

  // Remove any existing map tooltips
  d3.selectAll(".map-tooltip").remove();

  d3.csv(file)
    .then((data) => {
      updateStatsModal(data);
      initializeDashboard(data);
    })
    .catch((error) => {
      console.error("Error loading race data:", error);
      alert(
        `Error loading race data from ${file}. Please make sure the file exists.`
      );
    });
}

// Main initialization function
function initializeDashboard(data) {
  // Populate Top Finisher Cards
  (() => {
    // Parse overall times and filter valid data
    const validAthletes = data
      .map((d) => ({
        ...d,
        overallSeconds: hmsToSeconds(d["Overall Time"]),
      }))
      .filter((d) => d.overallSeconds != null && d.overallSeconds > 0);

    // Determine gender and find top finishers
    const maleAthletes = validAthletes.filter((d) => {
      const g = (d.gender ?? "").toString().trim().toLowerCase();
      return g.startsWith("m");
    });

    const femaleAthletes = validAthletes.filter((d) => {
      const g = (d.gender ?? "").toString().trim().toLowerCase();
      return g.startsWith("f");
    });

    // Find fastest times
    const topMale = maleAthletes.sort(
      (a, b) => a.overallSeconds - b.overallSeconds
    )[0];
    const topFemale = femaleAthletes.sort(
      (a, b) => a.overallSeconds - b.overallSeconds
    )[0];

    // Populate Male Finisher Card
    if (topMale) {
      document.querySelector("#male-finisher-info .finisher-name").textContent =
        topMale.Name || "Unknown";
      document.querySelector("#male-finisher-info .finisher-time").textContent =
        topMale["Overall Time"] || "--:--:--";
      document.querySelector(
        "#male-finisher-info .finisher-country"
      ).textContent = topMale.Country || "Unknown";

      // Stats on back
      const maleStats = document.querySelectorAll("#male-stats .stat-value");
      maleStats[0].textContent = topMale["Swim Time"] || "--:--:--";
      maleStats[1].textContent = topMale["Bike Time"] || "--:--:--";
      maleStats[2].textContent = topMale["Run Time"] || "--:--:--";
      maleStats[3].textContent = topMale.Division || "--";
    }

    // Populate Female Finisher Card
    if (topFemale) {
      document.querySelector(
        "#female-finisher-info .finisher-name"
      ).textContent = topFemale.Name || "Unknown";
      document.querySelector(
        "#female-finisher-info .finisher-time"
      ).textContent = topFemale["Overall Time"] || "--:--:--";
      document.querySelector(
        "#female-finisher-info .finisher-country"
      ).textContent = topFemale.Country || "Unknown";

      // Stats on back
      const femaleStats = document.querySelectorAll(
        "#female-stats .stat-value"
      );
      femaleStats[0].textContent = topFemale["Swim Time"] || "--:--:--";
      femaleStats[1].textContent = topFemale["Bike Time"] || "--:--:--";
      femaleStats[2].textContent = topFemale["Run Time"] || "--:--:--";
      femaleStats[3].textContent = topFemale.Division || "--";
    }
  })();

  const names = Array.from(new Set(data.map((d) => d.Name))).sort(d3.ascending);

  // Clear and rebuild Athlete A selector
  const selectA = d3.select("#athleteSelect");
  selectA.selectAll("option").remove();
  selectA
    .selectAll("option")
    .data(names)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  const defaultName =
    typeof athleteName !== "undefined" && names.includes(athleteName)
      ? athleteName
      : names[0];
  selectA.property("value", defaultName);

  // Clear and rebuild Athlete B selector
  const selectB = d3.select("#athleteSelectB");
  selectB.selectAll("option").remove();

  // Add "-- None --" option first
  selectB.append("option").attr("value", "").text("-- None --");

  // Populate Select B with athletes
  selectB
    .selectAll("option:not([value=''])")
    .data(names)
    .enter()
    .append("option")
    .attr("value", (d) => d)
    .text((d) => d);

  // --- Chart scaffolding ---
  const svg = d3.select("#chart1");
  const margin = { top: 40, right: 30, bottom: 70, left: 110 };
  const width = 800 - margin.left - margin.right;
  const height = 420 - margin.top - margin.bottom;

  // Set viewBox for responsive scaling
  svg
    .attr("viewBox", `0 0 800 420`)
    .attr("preserveAspectRatio", "xMidYMid meet")
    .style("max-width", "100%")
    .style("height", "auto");

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // x0 = categories (Swim/Bike/Run/Overall), x1 = inner band for athlete A/B
  const x0 = d3.scaleBand().range([0, width]).padding(0.5);
  const x1 = d3.scaleBand().padding(0.2);
  const y = d3.scaleLinear().range([height, 0]);

  const xAxisG = g.append("g").attr("transform", `translate(0,${height})`);
  const yAxisG = g.append("g");

  // Title & axes labels
  const title1 = svg
    .append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .style("font-weight", 600)
    .style("font-size", "18px");

  svg
    .append("text")
    .attr("x", margin.left + width / 2)
    .attr("y", margin.top + height + 50)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Split");

  svg
    .append("text")
    .attr(
      "transform",
      `translate(${margin.left - 80}, ${margin.top + height / 2}) rotate(-90)`
    )
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .text("Time (H:MM:SS)");

  // Colors for athlete comparison
  const COLOR_A = "#3e92ccff"; // celestial-blue
  const COLOR_B = "#0a2463ff"; // royal-blue
  const COLOR_HOVER = "#d8315bff"; // cerise
  const nameColor = (n, nA, nB) => (n === nA ? COLOR_A : COLOR_B);

  // Convert a data row to an array of {category, value, label}
  function rowToSplits(row) {
    if (!row) return [];
    return [
      {
        category: "Swim",
        value: hmsToSeconds(row["Swim Time"]),
        label: row["Swim Time"],
      },
      {
        category: "Bike",
        value: hmsToSeconds(row["Bike Time"]),
        label: row["Bike Time"],
      },
      {
        category: "Run",
        value: hmsToSeconds(row["Run Time"]),
        label: row["Run Time"],
      },
      {
        category: "Overall",
        value: hmsToSeconds(row["Overall Time"]),
        label: row["Overall Time"],
      },
    ].filter((d) => d.value != null);
  }

  // Main render
  function renderAthletes() {
    const nA = selectA.property("value");
    const nB = selectB.property("value");
    // Only compare if nB is not empty
    const compare = nB && nB !== "";

    const rowA = data.find((d) => d.Name === nA);
    const rowB = compare ? data.find((d) => d.Name === nB) : null;

    const A = rowToSplits(rowA).map((d) => ({ ...d, name: nA }));
    const B = rowB ? rowToSplits(rowB).map((d) => ({ ...d, name: nB })) : [];
    const all = [...A, ...B];

    const categories = ["Swim", "Bike", "Run", "Overall"].filter((c) =>
      all.some((d) => d.category === c)
    );
    x0.domain(categories);

    const namesUsed = Array.from(new Set(all.map((d) => d.name)));
    x1.domain(namesUsed).range([0, x0.bandwidth()]);

    y.domain([0, d3.max(all, (d) => d.value) || 0]).nice();

    // Category groups
    const groups = g.selectAll("g.cat").data(categories, (d) => d);

    const groupsEnter = groups
      .enter()
      .append("g")
      .attr("class", "cat")
      .attr("transform", (d) => `translate(${x0(d)},0)`);

    groups
      .merge(groupsEnter)
      .transition()
      .duration(400)
      .attr("transform", (d) => `translate(${x0(d)},0)`);

    groups.exit().remove();

    // Bars (grouped by category, keyed by athlete name)
    const bars = g
      .selectAll("g.cat")
      .selectAll("rect.bar")
      .data(
        (cat) => all.filter((d) => d.category === cat),
        (d) => d.name
      );

    const barsEnter = bars
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => x1(d.name))
      .attr("y", y(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", (d) => nameColor(d.name, nA, nB))
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", COLOR_HOVER);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", nameColor(d.name, nA, nB));
      });

    // Add title elements to new bars for native tooltips
    barsEnter
      .append("title")
      .text((d) => `${d.name}\n${d.category}: ${d.label || shortHMS(d.value)}`);

    // Merge and update positions
    const allBars = bars.merge(barsEnter);

    // Apply hover events to all bars (new and existing)
    allBars
      .on("mouseover", function (event, d) {
        d3.select(this).attr("fill", COLOR_HOVER);
      })
      .on("mouseout", function (event, d) {
        d3.select(this).attr("fill", nameColor(d.name, nA, nB));
      });

    allBars
      .transition()
      .duration(400)
      .attr("x", (d) => x1(d.name))
      .attr("y", (d) => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", (d) => height - y(d.value))
      .attr("fill", (d) => nameColor(d.name, nA, nB));

    // Update tooltip text for all bars
    allBars
      .select("title")
      .text((d) => `${d.name}\n${d.category}: ${d.label || shortHMS(d.value)}`);

    bars.exit().remove();

    // Axes
    xAxisG
      .transition()
      .duration(400)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .style("font-size", "16px");

    yAxisG
      .transition()
      .duration(400)
      .call(d3.axisLeft(y).tickFormat(secondsToHMS))
      .selectAll("text")
      .style("font-size", "16px");

    // Title
    title1.text(compare && nB ? `${nA} vs ${nB} ` : `Split times for ${nA}`);
  }

  selectA.on("change", renderAthletes);
  selectB.on("change", renderAthletes);

  renderAthletes();

  // ===== Chart 2 (FINAL): Metric vs Metric scatter with cached regressions =====
  // - Precompute all OLS fits for ordered pairs (Swim|Bike, Bike|Run, etc.)
  // - Brush zoom only repositions line; NO recomputation
  // - Axis click swaps to the cached fit

  (() => {
    let zoomed = false;

    const svg2 = d3.select("#chart2");
    const margin2 = { top: 30, right: 30, bottom: 70, left: 100 };
    const width2 = 700 - margin2.left - margin2.right;
    const height2 = 460 - margin2.top - margin2.bottom;

    // Set viewBox for responsive scaling
    svg2
      .attr("viewBox", `0 0 700 460`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("max-width", "100%")
      .style("height", "auto");

    const g2 = svg2
      .append("g")
      .attr("transform", `translate(${margin2.left},${margin2.top})`);

    const x2 = d3.scaleLinear().range([0, width2]);
    const y2 = d3.scaleLinear().range([height2, 0]);

    const xAxisG2 = g2.append("g").attr("transform", `translate(0,${height2})`);
    const yAxisG2 = g2.append("g");

    // Title
    const title2 = svg2
      .append("text")
      .attr("x", margin2.left + width2 / 2)
      .attr("y", 22)
      .attr("text-anchor", "middle")
      .style("font-weight", 600)
      .style("font-size", "18px");

    // Metrics & accessors
    const METRICS = ["Swim", "Bike", "Run"];
    let xMetric = "Bike";
    let yMetric = "Run";
    const labelText = (m) => `${m} time (H:MM:SS) ▾`;
    const metricValue = (row, m) => hmsToSeconds(row[m + " Time"]);

    // Trend toggle
    // Trend toggle (now in HTML header)
    const trendToggle = d3.select("#trendToggle");

    // Axis label "pills"
    const xLabelGroup = svg2
      .append("g")
      .attr(
        "transform",
        `translate(${margin2.left + width2 / 2}, ${margin2.top + height2 + 50})`
      )
      .style("cursor", "pointer")
      .attr("data-axis", "x");
    const xLabelBg = xLabelGroup
      .append("rect")
      .attr("class", "axis-label-bg")
      .attr("x", -60)
      .attr("y", -12)
      .attr("width", 120)
      .attr("height", 24)
      .attr("rx", 6)
      .attr("ry", 6);
    const xLabel2 = xLabelGroup
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "15px")
      .style("font-weight", "500")
      .text(labelText(xMetric));

    const yLabelGroup = svg2
      .append("g")
      .attr(
        "transform",
        `translate(${margin2.left - 70}, ${
          margin2.top + height2 / 2
        }) rotate(-90)`
      )
      .style("cursor", "pointer")
      .attr("data-axis", "y");
    const yLabelBg = yLabelGroup
      .append("rect")
      .attr("class", "axis-label-bg")
      .attr("x", -60)
      .attr("y", -12)
      .attr("width", 120)
      .attr("height", 24)
      .attr("rx", 6)
      .attr("ry", 6);
    const yLabel2 = yLabelGroup
      .append("text")
      .attr("class", "axis-label")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "middle")
      .style("font-size", "15px")
      .style("font-weight", "500")
      .text(labelText(yMetric));

    // Layers
    const points = g2.append("g").attr("class", "points");
    const trendLayer = g2.append("g").attr("class", "trend");

    g2.append("defs")
      .append("clipPath")
      .attr("id", "plot-clip")
      .append("rect")
      .attr("width", width2)
      .attr("height", height2);
    points.attr("clip-path", "url(#plot-clip)");
    trendLayer.attr("clip-path", "url(#plot-clip)");

    // Helpers
    function ensureDistinct(changedAxis) {
      if (xMetric === yMetric) {
        const alt =
          METRICS.find(
            (m) => m !== (changedAxis === "x" ? xMetric : yMetric)
          ) || "Swim";
        if (changedAxis === "x") yMetric = alt;
        else xMetric = alt;
      }
    }
    function resizeLabelBg(lbl, bg) {
      const padX = 12,
        padY = 6;
      const bbox = lbl.node().getBBox();
      bg.attr("x", bbox.x - padX / 2)
        .attr("y", bbox.y - padY / 2)
        .attr("width", bbox.width + padX)
        .attr("height", bbox.height + padY);
    }
    function buildPoints() {
      return data
        .map((row) => ({
          x: metricValue(row, xMetric),
          y: metricValue(row, yMetric),
        }))
        .filter((d) => d.x != null && d.y != null && d.x > 0 && d.y > 0);
    }

    // OLS + precompute cache
    function ols(pts) {
      const n = pts.length;
      let sx = 0,
        sy = 0,
        sxx = 0,
        syy = 0,
        sxy = 0;
      for (const { x, y } of pts) {
        sx += x;
        sy += y;
        sxx += x * x;
        syy += y * y;
        sxy += x * y;
      }
      const denom = n * sxx - sx * sx;
      if (denom === 0) return { m: 0, b: d3.mean(pts, (d) => d.y), r: 0 };
      const m = (n * sxy - sx * sy) / denom;
      const b = (sy - m * sx) / n;
      const rDen = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy));
      const r = rDen === 0 ? 0 : (n * sxy - sx * sy) / rDen;
      return { m, b, r };
    }

    // --- Precomputed regressions for ordered pairs ---
    const trendCache = new Map(); // key "X|Y" -> {m,b,r} or null

    function buildPointsFor(xKey, yKey) {
      return data
        .map((row) => ({
          x: hmsToSeconds(row[xKey + " Time"]),
          y: hmsToSeconds(row[yKey + " Time"]),
        }))
        .filter((d) => d.x != null && d.y != null && d.x > 0 && d.y > 0);
    }

    function computeAllTrendCoeffs() {
      trendCache.clear();
      for (let i = 0; i < METRICS.length; i++) {
        for (let j = 0; j < METRICS.length; j++) {
          if (i === j) continue;
          const X = METRICS[i],
            Y = METRICS[j];
          const pts = buildPointsFor(X, Y);
          const coeffs = pts.length >= 2 ? ols(pts) : null;
          trendCache.set(`${X}|${Y}`, coeffs);
        }
      }
    }

    function renderTrendFromCache() {
      trendLayer.selectAll("*").remove();

      if (!trendToggle.property("checked")) return;
      const coeffs = trendCache.get(`${xMetric}|${yMetric}`);
      if (!coeffs) return;

      const { m, b, r } = coeffs;
      const [xMin, xMax] = x2.domain();
      const yMin = m * xMin + b;
      const yMax = m * xMax + b;

      const accent2 =
        getComputedStyle(document.documentElement).getPropertyValue(
          "--accent"
        ) || "#d8315bff"; // cerise

      trendLayer
        .append("line")
        .attr("x1", x2(xMin))
        .attr("y1", y2(yMin))
        .attr("x2", x2(xMax))
        .attr("y2", y2(yMax))
        .attr("stroke", accent2.trim())
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "6,5");

      trendLayer
        .append("text")
        .attr("x", 6)
        .attr("y", 14)
        .attr("fill", accent2.trim())
        .style("font-size", "12px")
        .style("font-weight", "600")
        .text(`r = ${d3.format(".2f")(r)}`);
    }

    // Brush-zoom
    const PAD_FRAC = 0.2;
    const MIN_FRACTION = 0.25;

    function paddedDomain(selMin, selMax, fullMin, fullMax) {
      const selSpan = Math.max(selMax - selMin, 1e-9);
      const fullSpan = Math.max(fullMax - fullMin, 1e-9);
      const desired = Math.max(
        selSpan * (1 + PAD_FRAC * 2),
        fullSpan * MIN_FRACTION
      );
      const c = (selMin + selMax) / 2;
      let lo = c - desired / 2;
      let hi = c + desired / 2;
      if (lo < fullMin) {
        hi += fullMin - lo;
        lo = fullMin;
      }
      if (hi > fullMax) {
        lo -= hi - fullMax;
        hi = fullMax;
      }
      return [Math.max(fullMin, lo), Math.min(fullMax, hi)];
    }

    const brushG = g2.append("g").attr("class", "brush");
    const brush = d3
      .brush()
      .extent([
        [0, 0],
        [width2, height2],
      ])
      .on("end", brushed);
    brushG.call(brush);

    // Reset button
    let resetBtn = document.getElementById("scatterReset");
    if (!resetBtn) {
      const btn = document.createElement("button");
      btn.id = "scatterReset";
      btn.textContent = "Reset zoom";
      btn.className = "expand-btn";
      btn.style.margin = "6px 0 0 0";
      btn.style.display = "none";
      svg2.node().parentNode.insertBefore(btn, svg2.node());
      resetBtn = btn;
    }
    resetBtn.addEventListener("click", () => {
      zoomed = false;
      const pts = buildPoints();
      x2.domain(d3.extent(pts, (d) => d.x)).nice();
      y2.domain(d3.extent(pts, (d) => d.y)).nice();
      brushG.call(brush.move, null);
      updateScatter();
      renderTrendFromCache(); // just reposition cached line
      resetBtn.style.display = "none";
    });

    function brushed({ selection }) {
      if (!selection) return;
      const [[x0, y0], [x1, y1]] = selection;

      if (Math.abs(x1 - x0) < 4 || Math.abs(y1 - y0) < 4) {
        brushG.call(brush.move, null);
        return;
      }

      const selX = [x2.invert(x0), x2.invert(x1)].sort((a, b) => a - b);
      const selY = [y2.invert(y1), y2.invert(y0)].sort((a, b) => a - b); // y inverted

      const [xFullLo, xFullHi] = x2.domain();
      const [yFullLo, yFullHi] = y2.domain();

      const xNew = paddedDomain(selX[0], selX[1], xFullLo, xFullHi);
      const yNew = paddedDomain(selY[0], selY[1], yFullLo, yFullHi);

      x2.domain(xNew);
      y2.domain(yNew);

      zoomed = true;
      brushG.call(brush.move, null);
      updateScatter(); // redraw points/axes
      renderTrendFromCache(); // reposition cached line ONLY
      resetBtn.style.display = "inline-block";
    }

    function updateScatter() {
      const pts = buildPoints();

      if (!zoomed) {
        x2.domain(d3.extent(pts, (d) => d.x)).nice();
        y2.domain(d3.extent(pts, (d) => d.y)).nice();
      }

      const [xLo, xHi] = x2.domain();
      const [yLo, yHi] = y2.domain();
      const visible = pts.filter(
        (d) => d.x >= xLo && d.x <= xHi && d.y >= yLo && d.y <= yHi
      );

      xAxisG2
        .transition()
        .duration(400)
        .call(d3.axisBottom(x2).tickFormat(secondsToHMS))
        .selectAll("text")
        .style("font-size", "14px");

      yAxisG2
        .transition()
        .duration(400)
        .call(d3.axisLeft(y2).tickFormat(secondsToHMS))
        .selectAll("text")
        .style("font-size", "14px");

      const sel = points
        .selectAll("circle")
        .data(visible, (d) => `${d.x},${d.y}`);

      const enter = sel
        .enter()
        .append("circle")
        .attr("r", 3)
        .attr("opacity", 0.7)
        .attr("fill", "#3e92ccff") // celestial-blue
        .attr("cx", (d) => x2(d.x))
        .attr("cy", (d) => y2(d.y));

      enter
        .append("title")
        .text((d) => `x: ${secondsToHMS(d.x)}\ny: ${secondsToHMS(d.y)}`);

      sel
        .merge(enter)
        .transition()
        .duration(300)
        .attr("cx", (d) => x2(d.x))
        .attr("cy", (d) => y2(d.y));

      sel.exit().remove();

      // Titles/labels
      title2.text(`${xMetric} vs ${yMetric} (All Athletes)`);
      xLabel2.text(labelText(xMetric));
      yLabel2.text(labelText(yMetric));
      resizeLabelBg(xLabel2, xLabelBg);
      resizeLabelBg(yLabel2, yLabelBg);
    }

    // Axis menu
    function showAxisMenu(evt, axis) {
      d3.selectAll(".axis-menu").remove();
      const card = document.getElementById("chart2-card") || document.body;
      const menu = document.createElement("div");
      menu.className = "axis-menu";

      METRICS.forEach((opt) => {
        const btn = document.createElement("button");
        btn.textContent =
          opt + ((axis === "x" ? xMetric : yMetric) === opt ? " ✓" : "");
        btn.addEventListener("click", () => {
          if (axis === "x") xMetric = opt;
          else yMetric = opt;
          ensureDistinct(axis);

          zoomed = false;
          resetBtn.style.display = "none";

          updateScatter(); // redraw points & axes
          renderTrendFromCache(); // draw cached fit for new pair
          menu.remove();
        });
        menu.appendChild(btn);
      });

      // Style/position
      const { clientX, clientY } = evt;
      const rect = card.getBoundingClientRect();
      Object.assign(menu.style, {
        position: "absolute",
        zIndex: "1000",
        background: "#fff",
        border:
          "1px solid " +
          (getComputedStyle(document.documentElement).getPropertyValue(
            "--border"
          ) || "#d9e1ec"),
        borderRadius: "8px",
        boxShadow:
          getComputedStyle(document.documentElement).getPropertyValue(
            "--shadow"
          ) || "0 6px 24px rgba(0,0,0,0.1)",
        padding: "4px",
        minWidth: "140px",
        left: clientX - rect.left + 8 + "px",
        top: clientY - rect.top + 8 + "px",
      });

      const close = () => {
        menu.remove();
        document.removeEventListener("click", outside, { capture: true });
        document.removeEventListener("keydown", onKey);
      };
      const outside = (e) => {
        if (!menu.contains(e.target)) close();
      };
      const onKey = (e) => {
        if (e.key === "Escape") close();
      };

      document.addEventListener("click", outside, { capture: true });
      document.addEventListener("keydown", onKey);

      card.appendChild(menu);
      evt.stopPropagation();
    }

    xLabelGroup.on("click", (evt) => showAxisMenu(evt, "x"));
    yLabelGroup.on("click", (evt) => showAxisMenu(evt, "y"));

    // Toggle show/hide without recompute
    trendToggle.on("change", () => {
      renderTrendFromCache();
    });

    // Initial draw
    ensureDistinct();
    updateScatter();
    computeAllTrendCoeffs(); // precompute once
    renderTrendFromCache(); // render current pair from cache
  })();

  // Chart 3 - World Map of Athlete Origins
  (() => {
    // Country name mapping from CSV to GeoJSON
    const countryNameMap = {
      "United States": "United States of America",
      USA: "United States of America",
      UK: "United Kingdom",
      "Great Britain": "United Kingdom",
      "South Korea": "Republic of Korea",
      "North Korea": "Democratic People's Republic of Korea",
      "Czech Republic": "Czechia",
      Macedonia: "North Macedonia",
      "Ivory Coast": "Côte d'Ivoire",
      Congo: "Republic of the Congo",
      "Democratic Republic of the Congo": "Democratic Republic of the Congo",
      Tanzania: "United Republic of Tanzania",
    };

    // Count athletes by country
    const countryCounts = d3.rollup(
      data,
      (v) => v.length,
      (d) => (d.Country || "").trim()
    );

    // Helper function to normalize country names
    const normalizeCountry = (country) => {
      return countryNameMap[country] || country;
    };

    const svg3 = d3.select("#chart3");
    const margin3 = { top: 40, right: 20, bottom: 60, left: 20 };
    const width3 = 900 - margin3.left - margin3.right;
    const height3 = 450 - margin3.top - margin3.bottom;

    // Set viewBox for responsive scaling
    svg3
      .attr("viewBox", `0 0 900 450`)
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("max-width", "100%")
      .style("height", "auto");

    const g3 = svg3
      .append("g")
      .attr("transform", `translate(${margin3.left},${margin3.top})`);

    // Add background
    g3.append("rect")
      .attr("width", width3)
      .attr("height", height3)
      .attr("fill", "#f0f4f8");

    // Add title
    g3.append("text")
      .attr("x", width3 / 2)
      .attr("y", -15)
      .attr("text-anchor", "middle")
      .style("font-size", "18px")
      .style("font-weight", "600")
      .style(
        "fill",
        getComputedStyle(document.documentElement).getPropertyValue("--text") ||
          "#0a2463"
      )
      .text("Geographic Distribution of Athletes");

    // Create projection with proper aspect ratio
    const projection = d3.geoEqualEarth().fitExtent(
      [
        [0, 0],
        [width3, height3],
      ],
      { type: "Sphere" }
    );

    const path = d3.geoPath().projection(projection);

    // Tooltip
    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "map-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "#fff")
      .style("border", "2px solid #0a2463")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.2)")
      .style("pointer-events", "none")
      .style("z-index", "1000");

    // Load and render map
    d3.json("world-countries.json")
      .then((geoData) => {
        g3.selectAll("path")
          .data(geoData.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", (d) => {
            const geoCountry = d.properties.ADMIN || d.properties.name;
            // Check both the GeoJSON name and look up in our counts with normalization
            let count = countryCounts.get(geoCountry) || 0;

            // If not found, check if any CSV country maps to this GeoJSON country
            if (count === 0) {
              for (const [csvName, csvCount] of countryCounts) {
                if (normalizeCountry(csvName) === geoCountry) {
                  count = csvCount;
                  break;
                }
              }
            }

            return count > 0 ? "#3e92ccff" : "#d0d8e0";
          })
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.7)
          .style("cursor", "pointer")
          .on("mouseover", function (event, d) {
            const geoCountry = d.properties.ADMIN || d.properties.name;
            let count = countryCounts.get(geoCountry) || 0;

            // If not found, check if any CSV country maps to this GeoJSON country
            if (count === 0) {
              for (const [csvName, csvCount] of countryCounts) {
                if (normalizeCountry(csvName) === geoCountry) {
                  count = csvCount;
                  break;
                }
              }
            }

            // Highlight effect
            d3.select(this).attr("stroke", "#d8315bff").attr("stroke-width", 2);

            // Show tooltip with count
            tooltip
              .style("visibility", "visible")
              .html(
                count > 0
                  ? `<strong>${geoCountry}</strong><br/>Athletes: ${count}`
                  : `<strong>${geoCountry}</strong><br/>No athletes`
              );
          })
          .on("mousemove", function (event) {
            tooltip
              .style("top", event.pageY - 10 + "px")
              .style("left", event.pageX + 10 + "px");
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke", "#ffffff").attr("stroke-width", 0.7);

            tooltip.style("visibility", "hidden");
          });
      })
      .catch((error) => {
        console.error("Error loading map data:", error);
        g3.append("text")
          .attr("x", width3 / 2)
          .attr("y", height3 / 2)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#d8315bff")
          .text("Unable to load map data");
      });
  })();

  // Chart 4 - Transition Efficiency Analysis
  (() => {
    const transitionGenderSelect = document.getElementById(
      "transitionGenderSelect"
    );

    function renderChart4() {
      d3.select("#chart4").selectAll("*").remove();

      const selectedGender = transitionGenderSelect.value;

      // Filter data based on gender selection
      let filteredData = data.filter(
        (d) =>
          d["Transition 1 Time"] &&
          d["Transition 2 Time"] &&
          d["Division"] &&
          d["Division"] !== "NA"
      );

      if (selectedGender !== "all") {
        filteredData = filteredData.filter((d) => d.gender === selectedGender);
      }

      // Helper function to sort divisions
      function divisionSortKey(div) {
        const d = (div ?? "").toUpperCase().trim();
        if (d === "MPRO") return { pro: 0, gender: "M", age: 0 };
        if (d === "FPRO") return { pro: 0, gender: "F", age: 0 };
        const m = d.match(/^([MF])(\d+)-/);
        if (m) return { pro: 1, gender: m[1], age: +m[2] };
        return { pro: 2, gender: "Z", age: 999 };
      }

      // Get sorted list of divisions
      const allDivisions = Array.from(
        new Set(filteredData.map((d) => d.Division))
      ).filter(Boolean);
      const divisions = allDivisions.sort((a, b) => {
        const ka = divisionSortKey(a);
        const kb = divisionSortKey(b);
        if (ka.pro !== kb.pro) return ka.pro - kb.pro;
        if (ka.age !== kb.age) return ka.age - kb.age;
        if (ka.gender !== kb.gender) return ka.gender.localeCompare(kb.gender);
        return 0;
      });

      // Calculate average T1 and T2 times for each division
      const transitionData = d3.rollups(
        filteredData,
        (v) => ({
          t1Avg: d3.mean(v, (d) => hmsToSeconds(d["Transition 1 Time"])),
          t2Avg: d3.mean(v, (d) => hmsToSeconds(d["Transition 2 Time"])),
          count: v.length,
        }),
        (d) => d.Division
      );

      const chartData = divisions
        .map((div) => {
          const found = transitionData.find(([division]) => division === div);
          if (!found) return null;
          const [division, stats] = found;
          return {
            division,
            t1: stats.t1Avg,
            t2: stats.t2Avg,
            count: stats.count,
          };
        })
        .filter((d) => d && d.t1 && d.t2);

      if (chartData.length === 0) {
        d3.select("#chart4")
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#666")
          .text("No transition data available");
        return;
      }

      const svg4 = d3.select("#chart4");
      const margin4 = { top: 60, right: 30, bottom: 120, left: 70 };
      const width4 = 800 - margin4.left - margin4.right;
      const height4 = 450 - margin4.top - margin4.bottom;

      svg4
        .attr("viewBox", `0 0 800 450`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("max-width", "100%")
        .style("height", "auto");

      const g4 = svg4
        .append("g")
        .attr("transform", `translate(${margin4.left},${margin4.top})`);

      // Scales
      const x0 = d3
        .scaleBand()
        .domain(chartData.map((d) => d.division))
        .range([0, width4])
        .paddingInner(0.2)
        .paddingOuter(0.1);

      const x1 = d3
        .scaleBand()
        .domain(["T1", "T2"])
        .range([0, x0.bandwidth()])
        .padding(0.05);

      const maxTime = d3.max(chartData, (d) => Math.max(d.t1, d.t2));
      const y = d3
        .scaleLinear()
        .domain([0, maxTime * 1.1])
        .range([height4, 0]);

      const color = d3
        .scaleOrdinal()
        .domain(["T1", "T2"])
        .range(["#3e92cc", "#d8315b"]);

      // Axes
      g4.append("g")
        .attr("transform", `translate(0,${height4})`)
        .call(d3.axisBottom(x0))
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end")
        .style("font-size", "11px");

      g4.append("g")
        .call(
          d3
            .axisLeft(y)
            .ticks(6)
            .tickFormat((d) => {
              const mins = Math.floor(d / 60);
              const secs = Math.floor(d % 60);
              return `${mins}:${secs.toString().padStart(2, "0")}`;
            })
        )
        .selectAll("text")
        .style("font-size", "12px");

      // Y-axis label
      g4.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height4 / 2)
        .attr("y", -50)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 600)
        .text("Average Time (min:sec)");

      // Title
      svg4
        .append("text")
        .attr("x", margin4.left + width4 / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .style("font-size", "18px")
        .text("Transition Times by Division");

      // Legend
      const legend = svg4
        .append("g")
        .attr(
          "transform",
          `translate(${margin4.left + width4 - 150}, ${margin4.top - 35})`
        );

      ["T1", "T2"].forEach((key, i) => {
        const lg = legend
          .append("g")
          .attr("transform", `translate(${i * 70}, 0)`);
        lg.append("rect")
          .attr("width", 14)
          .attr("height", 14)
          .attr("fill", color(key));
        lg.append("text")
          .attr("x", 20)
          .attr("y", 12)
          .text(key)
          .style("font-size", "13px");
      });

      // Draw bars
      const groups = g4
        .selectAll(".division-group")
        .data(chartData)
        .enter()
        .append("g")
        .attr("class", "division-group")
        .attr("transform", (d) => `translate(${x0(d.division)},0)`);

      // T1 bars
      groups
        .append("rect")
        .attr("x", x1("T1"))
        .attr("width", x1.bandwidth())
        .attr("y", height4)
        .attr("height", 0)
        .attr("fill", color("T1"))
        .transition()
        .duration(600)
        .attr("y", (d) => y(d.t1))
        .attr("height", (d) => height4 - y(d.t1));

      // T2 bars
      groups
        .append("rect")
        .attr("x", x1("T2"))
        .attr("width", x1.bandwidth())
        .attr("y", height4)
        .attr("height", 0)
        .attr("fill", color("T2"))
        .transition()
        .duration(600)
        .attr("y", (d) => y(d.t2))
        .attr("height", (d) => height4 - y(d.t2));

      // Add tooltips
      groups
        .selectAll("rect")
        .append("title")
        .text(function (d) {
          const isT1 = d3.select(this.parentNode).attr("fill") === color("T1");
          const time = isT1 ? d.t1 : d.t2;
          const mins = Math.floor(time / 60);
          const secs = Math.floor(time % 60);
          const label = isT1 ? "T1" : "T2";
          return `${
            d.division
          }\n${label}: ${mins}:${secs.toString().padStart(2, "0")}`;
        });

      // Calculate and show average lines
      const overallT1Avg = d3.mean(chartData, (d) => d.t1);
      const overallT2Avg = d3.mean(chartData, (d) => d.t2);

      g4.append("line")
        .attr("x1", 0)
        .attr("x2", width4)
        .attr("y1", y(overallT1Avg))
        .attr("y2", y(overallT1Avg))
        .attr("stroke", color("T1"))
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.5);

      g4.append("line")
        .attr("x1", 0)
        .attr("x2", width4)
        .attr("y1", y(overallT2Avg))
        .attr("y2", y(overallT2Avg))
        .attr("stroke", color("T2"))
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.5);
    }

    renderChart4();
    transitionGenderSelect.addEventListener("change", renderChart4);
  })();

  // ========== Chart 5: Pro Race Progression (Bump Chart) ==========
  (() => {
    const proGenderSelect = document.getElementById("proGenderSelect");
    const numAthletesSelect = document.getElementById("numAthletesSelect");

    function renderChart5() {
      d3.select("#chart5").selectAll("*").remove();

      const selectedGender = proGenderSelect.value;
      const numAthletes = parseInt(numAthletesSelect.value);

      // Filter for selected pro division
      const pros = data.filter((d) => d.Division === selectedGender);

      if (pros.length === 0) {
        d3.select("#chart5")
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "16px")
          .style("fill", "#666")
          .text("No pro athletes in this dataset");
        return;
      }

      // Get top N finishers by gender rank (works better for pros mixed with age groupers)
      const topPros = pros
        .filter((d) => d["Gender Rank"] && parseInt(d["Gender Rank"]) > 0)
        .sort((a, b) => parseInt(a["Gender Rank"]) - parseInt(b["Gender Rank"]))
        .slice(0, numAthletes);

      if (topPros.length === 0) {
        d3.select("#chart5")
          .append("text")
          .attr("x", "50%")
          .attr("y", "50%")
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .style("font-size", "16px")
          .style("fill", "#666")
          .text("Insufficient pro athlete data");
        return;
      }

      // Prepare data for each athlete showing their rank progression
      // For pros, use Age Group ranks which represent their division-specific ranks
      const progressionData = topPros.map((athlete) => {
        return {
          name: athlete.Name,
          finalRank: parseInt(athlete["Gender Rank"]),
          progression: [
            {
              stage: "Swim",
              rank:
                parseInt(athlete["Age Group Swim Rank"]) ||
                parseInt(athlete["Swim Rank"]),
            },
            {
              stage: "Bike",
              rank:
                parseInt(athlete["Age Group Bike Rank"]) ||
                parseInt(athlete["Bike Rank"]),
            },
            {
              stage: "Run",
              rank:
                parseInt(athlete["Age Group Run Rank"]) ||
                parseInt(athlete["Run Rank"]),
            },
            {
              stage: "Finish",
              rank: parseInt(athlete["Gender Rank"]),
            },
          ],
        };
      });

      const svg5 = d3.select("#chart5");
      const margin5 = { top: 60, right: 120, bottom: 60, left: 50 };
      const width5 = 800 - margin5.left - margin5.right;
      const height5 = 400 - margin5.top - margin5.bottom;

      svg5
        .attr("viewBox", `0 0 800 400`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("max-width", "100%")
        .style("height", "auto");

      const g5 = svg5
        .append("g")
        .attr("transform", `translate(${margin5.left},${margin5.top})`);

      // Scales
      const stages = ["Swim", "Bike", "Run", "Finish"];
      const x5 = d3.scalePoint().domain(stages).range([0, width5]).padding(0.1);

      const y5 = d3
        .scaleLinear()
        .domain([0.5, 10.5]) // Fixed scale: top 10 positions
        .range([20, height5 - 20]); // Add padding at top and bottom

      // Color scale for athletes - 10 distinct colors
      const colorScale = d3
        .scaleOrdinal()
        .domain(progressionData.map((d) => d.name))
        .range([
          "#0a2463", // royal blue
          "#3e92cc", // celestial blue
          "#d8315b", // cerise
          "#f39c12", // orange
          "#27ae60", // green
          "#8e44ad", // purple
          "#e74c3c", // red
          "#16a085", // teal
          "#f1c40f", // yellow
          "#34495e", // dark gray
        ]);

      // Add clip path to prevent lines from going outside bounds
      g5.append("defs")
        .append("clipPath")
        .attr("id", "clip-chart5")
        .append("rect")
        .attr("x", -5)
        .attr("y", 0)
        .attr("width", width5 + 10)
        .attr("height", height5);

      // Draw axes
      const xAxis = g5
        .append("g")
        .attr("transform", `translate(0,${height5})`)
        .call(d3.axisBottom(x5));

      xAxis
        .selectAll("text")
        .style("font-size", "13px")
        .style("font-weight", 600);

      const yAxis = g5
        .append("g")
        .call(d3.axisLeft(y5).ticks(10).tickFormat(d3.format("d")));

      yAxis.selectAll("text").style("font-size", "12px");

      // Y-axis label
      g5.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height5 / 2)
        .attr("y", -35)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 600)
        .text("Position");

      // Title
      const genderLabel = selectedGender === "MPRO" ? "Male" : "Female";
      svg5
        .append("text")
        .attr("x", margin5.left + width5 / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .style("font-size", "18px")
        .text(
          `Top ${numAthletes} ${genderLabel} Pro Athletes - Race Progression`
        );

      // Line generator
      const line = d3
        .line()
        .x((d) => x5(d.stage))
        .y((d) => y5(Math.min(d.rank, 10.5))) // Cap ranks at 10.5 to keep within bounds
        .curve(d3.curveMonotoneX);

      // Create a group for lines with clipping
      const linesGroup = g5.append("g").attr("clip-path", "url(#clip-chart5)");

      // Draw lines for each athlete
      progressionData.forEach((athlete) => {
        const path = linesGroup
          .append("path")
          .datum(athlete.progression)
          .attr("fill", "none")
          .attr("stroke", colorScale(athlete.name))
          .attr("stroke-width", 3)
          .attr("d", line)
          .style("opacity", 0.8);

        // Add hover effect
        path
          .on("mouseover", function () {
            d3.select(this).attr("stroke-width", 5).style("opacity", 1);
          })
          .on("mouseout", function () {
            d3.select(this).attr("stroke-width", 3).style("opacity", 0.8);
          });

        // Draw points at each stage
        linesGroup
          .selectAll(`.point-${athlete.name.replace(/\s+/g, "-")}`)
          .data(athlete.progression)
          .enter()
          .append("circle")
          .attr("class", `point-${athlete.name.replace(/\s+/g, "-")}`)
          .attr("cx", (d) => x5(d.stage))
          .attr("cy", (d) => y5(Math.min(d.rank, 10.5))) // Cap ranks at 10.5
          .attr("r", 5)
          .attr("fill", colorScale(athlete.name))
          .attr("stroke", "white")
          .attr("stroke-width", 2)
          .style("display", (d) => (d.rank > 10 ? "none" : null)) // Hide points beyond rank 10
          .append("title")
          .text((d) => `${athlete.name}\n${d.stage}: Position ${d.rank}`);
      });

      // Legend
      const legend5 = svg5
        .append("g")
        .attr(
          "transform",
          `translate(${margin5.left + width5 + 15}, ${margin5.top})`
        );

      progressionData.forEach((athlete, i) => {
        const legendRow = legend5
          .append("g")
          .attr("transform", `translate(0, ${i * 25})`);

        legendRow
          .append("line")
          .attr("x1", 0)
          .attr("x2", 25)
          .attr("y1", 0)
          .attr("y2", 0)
          .attr("stroke", colorScale(athlete.name))
          .attr("stroke-width", 3);

        legendRow
          .append("text")
          .attr("x", 30)
          .attr("y", 0)
          .attr("dy", "0.35em")
          .style("font-size", "11px")
          .text(
            athlete.name.length > 18
              ? athlete.name.substring(0, 18) + "..."
              : athlete.name
          )
          .append("title")
          .text(athlete.name);
      });
    }

    // Initial render
    renderChart5();

    // Add event listeners for controls
    proGenderSelect.addEventListener("change", renderChart5);
    numAthletesSelect.addEventListener("change", renderChart5);
  })();

  // ========== Chart 6: Split Time Distribution (Box Plot) ==========
  (() => {
    const distributionGenderSelect = document.getElementById(
      "distributionGenderSelect"
    );

    function renderChart6() {
      d3.select("#chart6").selectAll("*").remove();

      const selectedGender = distributionGenderSelect.value;

      // Filter data
      let filteredData = data.filter(
        (d) => d["Swim Time"] && d["Bike Time"] && d["Run Time"]
      );

      if (selectedGender !== "all") {
        filteredData = filteredData.filter((d) => d.gender === selectedGender);
      }

      if (filteredData.length === 0) {
        const svg = d3.select("#chart6");
        svg
          .attr("viewBox", "0 0 1000 450")
          .attr("preserveAspectRatio", "xMidYMid meet")
          .style("max-width", "100%")
          .style("height", "auto");
        svg
          .append("text")
          .attr("x", 500)
          .attr("y", 225)
          .attr("text-anchor", "middle")
          .style("font-size", "16px")
          .style("fill", "#666")
          .text("No data available");
        return;
      }

      // Convert times to seconds
      const swimTimes = filteredData
        .map((d) => hmsToSeconds(d["Swim Time"]))
        .filter((t) => t > 0);
      const bikeTimes = filteredData
        .map((d) => hmsToSeconds(d["Bike Time"]))
        .filter((t) => t > 0);
      const runTimes = filteredData
        .map((d) => hmsToSeconds(d["Run Time"]))
        .filter((t) => t > 0);

      // Calculate quartiles
      function calculateQuartiles(arr) {
        const sorted = arr.slice().sort((a, b) => a - b);
        const q1 = d3.quantile(sorted, 0.25);
        const median = d3.quantile(sorted, 0.5);
        const q3 = d3.quantile(sorted, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(sorted), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(sorted), q3 + 1.5 * iqr);
        const outliers = sorted.filter((v) => v < min || v > max);
        return { min, q1, median, q3, max, outliers };
      }

      const disciplines = [
        { name: "Swim", data: swimTimes, stats: calculateQuartiles(swimTimes) },
        { name: "Bike", data: bikeTimes, stats: calculateQuartiles(bikeTimes) },
        { name: "Run", data: runTimes, stats: calculateQuartiles(runTimes) },
      ];

      const svg6 = d3.select("#chart6");
      const margin6 = { top: 60, right: 50, bottom: 70, left: 80 };
      const width6 = 1000 - margin6.left - margin6.right;
      const height6 = 450 - margin6.top - margin6.bottom;

      svg6
        .attr("viewBox", `0 0 1000 450`)
        .attr("preserveAspectRatio", "xMidYMid meet")
        .style("max-width", "100%")
        .style("height", "auto");

      const g6 = svg6
        .append("g")
        .attr("transform", `translate(${margin6.left},${margin6.top})`);

      // Scales
      const x6 = d3
        .scaleBand()
        .domain(disciplines.map((d) => d.name))
        .range([0, width6])
        .padding(0.3);

      const maxTime = d3.max(disciplines, (d) => d.stats.max);
      const y6 = d3
        .scaleLinear()
        .domain([0, maxTime * 1.05])
        .range([height6, 0]);

      const color6 = d3
        .scaleOrdinal()
        .domain(["Swim", "Bike", "Run"])
        .range(["#3e92cc", "#d8315b", "#0a2463"]);

      // Axes
      g6.append("g")
        .attr("transform", `translate(0,${height6})`)
        .call(d3.axisBottom(x6))
        .selectAll("text")
        .style("font-size", "14px")
        .style("font-weight", 600);

      g6.append("g")
        .call(
          d3
            .axisLeft(y6)
            .ticks(8)
            .tickFormat((d) => {
              const hours = Math.floor(d / 3600);
              const mins = Math.floor((d % 3600) / 60);
              if (hours > 0) return `${hours}h ${mins}m`;
              return `${mins}m`;
            })
        )
        .selectAll("text")
        .style("font-size", "12px");

      // Y-axis label
      g6.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -height6 / 2)
        .attr("y", -55)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", 600)
        .text("Time");

      // Title
      const genderLabel =
        selectedGender === "all"
          ? "All Athletes"
          : selectedGender === "Male"
          ? "Male Athletes"
          : "Female Athletes";
      svg6
        .append("text")
        .attr("x", margin6.left + width6 / 2)
        .attr("y", 25)
        .attr("text-anchor", "middle")
        .style("font-weight", 600)
        .style("font-size", "18px")
        .text(`Split Time Distribution - ${genderLabel}`);

      // Draw box plots for each discipline
      disciplines.forEach((discipline) => {
        const stats = discipline.stats;
        const xPos = x6(discipline.name) + x6.bandwidth() / 2;
        const boxWidth = x6.bandwidth() * 0.6;

        const group = g6.append("g");

        // Vertical line (min to max)
        group
          .append("line")
          .attr("x1", xPos)
          .attr("x2", xPos)
          .attr("y1", y6(stats.min))
          .attr("y2", y6(stats.max))
          .attr("stroke", color6(discipline.name))
          .attr("stroke-width", 2);

        // Min whisker
        group
          .append("line")
          .attr("x1", xPos - boxWidth / 4)
          .attr("x2", xPos + boxWidth / 4)
          .attr("y1", y6(stats.min))
          .attr("y2", y6(stats.min))
          .attr("stroke", color6(discipline.name))
          .attr("stroke-width", 2);

        // Max whisker
        group
          .append("line")
          .attr("x1", xPos - boxWidth / 4)
          .attr("x2", xPos + boxWidth / 4)
          .attr("y1", y6(stats.max))
          .attr("y2", y6(stats.max))
          .attr("stroke", color6(discipline.name))
          .attr("stroke-width", 2);

        // Box (Q1 to Q3)
        group
          .append("rect")
          .attr("x", xPos - boxWidth / 2)
          .attr("y", y6(stats.q3))
          .attr("width", boxWidth)
          .attr("height", y6(stats.q1) - y6(stats.q3))
          .attr("fill", color6(discipline.name))
          .attr("opacity", 0.7)
          .attr("stroke", color6(discipline.name))
          .attr("stroke-width", 2);

        // Median line
        group
          .append("line")
          .attr("x1", xPos - boxWidth / 2)
          .attr("x2", xPos + boxWidth / 2)
          .attr("y1", y6(stats.median))
          .attr("y2", y6(stats.median))
          .attr("stroke", "#fff")
          .attr("stroke-width", 3);

        // Outliers
        if (stats.outliers.length > 0 && stats.outliers.length < 100) {
          group
            .selectAll(".outlier")
            .data(stats.outliers.slice(0, 50)) // Limit outliers shown
            .enter()
            .append("circle")
            .attr("class", "outlier")
            .attr("cx", xPos)
            .attr("cy", (d) => y6(d))
            .attr("r", 2)
            .attr("fill", color6(discipline.name))
            .attr("opacity", 0.4);
        }

        // Add tooltip
        group
          .append("rect")
          .attr("x", xPos - boxWidth / 2)
          .attr("y", y6(stats.max))
          .attr("width", boxWidth)
          .attr("height", y6(stats.min) - y6(stats.max))
          .attr("fill", "transparent")
          .style("cursor", "pointer")
          .append("title")
          .text(() => {
            const formatTime = (secs) => {
              const h = Math.floor(secs / 3600);
              const m = Math.floor((secs % 3600) / 60);
              const s = Math.floor(secs % 60);
              if (h > 0)
                return `${h}:${m.toString().padStart(2, "0")}:${s
                  .toString()
                  .padStart(2, "0")}`;
              return `${m}:${s.toString().padStart(2, "0")}`;
            };
            return `${discipline.name}\nMin: ${formatTime(
              stats.min
            )}\nQ1: ${formatTime(stats.q1)}\nMedian: ${formatTime(
              stats.median
            )}\nQ3: ${formatTime(stats.q3)}\nMax: ${formatTime(
              stats.max
            )}\nOutliers: ${stats.outliers.length}`;
          });
      });

      // Add summary statistics text below each box
      disciplines.forEach((discipline) => {
        const stats = discipline.stats;
        const xPos = x6(discipline.name) + x6.bandwidth() / 2;

        const formatTime = (secs) => {
          const h = Math.floor(secs / 3600);
          const m = Math.floor((secs % 3600) / 60);
          if (h > 0) return `${h}:${m.toString().padStart(2, "0")}`;
          return `${m}m`;
        };

        g6.append("text")
          .attr("x", xPos)
          .attr("y", height6 + 30)
          .attr("text-anchor", "middle")
          .style("font-size", "11px")
          .style("fill", "#666")
          .text(`Median: ${formatTime(stats.median)}`);
      });
    }

    renderChart6();
    distributionGenderSelect.addEventListener("change", renderChart6);
  })();
}

// Initial load
loadRaceData(currentRaceFile);
