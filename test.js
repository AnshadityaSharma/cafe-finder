const data = JSON.stringify({
  data: "[out:json][timeout:25];node(50.745,7.17,50.75,7.18);out;"
});

fetch("https://cafe-finder-gamma.vercel.app/api/overpass", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: data
}).then(async res => {
  console.log("Status:", res.status);
  console.log("Body:", await res.text());
}).catch(console.error);
