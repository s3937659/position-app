window.onload = function () {
    console.log("Initializing the map...");

    const map = L.map('mapid').setView([-37.8081, 144.9633], 16);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Define quest locations and their challenges
    const quests = [
        { id: 1, name: "Francis Ormond Building", lat: -37.8079, lng: 144.9634, challenge: "Welcome to RMIT! Scan a QR code and answer trivia.", completed: false },
        { id: 2, name: "Alumni Courtyard", lat: -37.8080, lng: 144.9635, challenge: "Echoes of the Past: Find a plaque about innovation.", completed: false },
        { id: 3, name: "Swanston Academic Building", lat: -37.8085, lng: 144.9642, challenge: "The Labyrinth of Learning: Solve academic riddles.", completed: false },
        { id: 4, name: "RMIT Gallery", lat: -37.8077, lng: 144.9649, challenge: "Art vs. Science: Explore exhibitions and answer questions.", completed: false },
        { id: 5, name: "Capitol Theatre", lat: -37.8120, lng: 144.9641, challenge: "Film Noir: Engage in film trivia.", completed: false },
        { id: 6, name: "Rooftop Garden", lat: -37.8082, lng: 144.9631, challenge: "Green City: Identify native plants.", completed: false },
        { id: 7, name: "Library", lat: -37.8088, lng: 144.9640, challenge: "The Codebreaker: Solve a cipher puzzle.", completed: false },
        { id: 8, name: "Final Quest: Garden Building", lat: -37.8087, lng: 144.9629, challenge: "The Grand Finale: Create a visual timeline of RMIT’s history.", completed: false, final: true }
    ];

    let totalScore = 0;

    // Track quests completion to unlock the final quest
    function allQuestsCompleted() {
        return quests.every(quest => quest.completed || quest.final);
    }

    // Add markers for quests
    quests.forEach(quest => {
        console.log(`Adding marker for ${quest.name}`);
        const marker = L.circleMarker([quest.lat, quest.lng], {
            color: 'red',
            fillColor: '#ff0000',
            fillOpacity: 0.5,
            radius: 8,
            className: 'blinking-marker'
        }).addTo(map).bindPopup(`${quest.name}: ${quest.challenge}`);

        marker.on('click', () => {
            handleQuest(quest);
        });
    });

    // Handle quest completion logic
    function handleQuest(quest) {
        if (quest.final && !allQuestsCompleted()) {
            alert("Please finish the other quests first.");
            return;
        }

        if (quest.completed) {
            alert(`You already completed the ${quest.name} challenge.`);
            return;
        }

        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            const distance = calculateDistance(latitude, longitude, quest.lat, quest.lng);

            if (distance <= 10) {
                alert(`Congratulations! You completed the ${quest.name} challenge.`);
                quest.completed = true;
                totalScore += 5;

                if (quest.final) {
                    alert("Congratulations! You are the winner!");
                } else {
                    console.log(`Score: ${totalScore}`);
                    updateScore();
                }
            } else {
                alert("You need to be within 10 meters of the location to complete the challenge.");
            }
        });
    }

    // Calculate the distance between two coordinates in meters
    function calculateDistance(lat1, lng1, lat2, lng2) {
        const R = 6371e3; // Earth's radius in meters
        const φ1 = (lat1 * Math.PI) / 180;
        const φ2 = (lat2 * Math.PI) / 180;
        const Δφ = ((lat2 - lat1) * Math.PI) / 180;
        const Δλ = ((lng2 - lng1) * Math.PI) / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                  Math.cos(φ1) * Math.cos(φ2) *
                  Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // Update the score display
    function updateScore() {
        document.getElementById('score').innerText = `Score: ${totalScore}`;
    }

    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => map.zoomIn());
    document.getElementById('zoom-out').addEventListener('click', () => map.zoomOut());

    // Locate user's current position
    document.getElementById('find-me').addEventListener('click', () => {
        map.locate({ setView: true, maxZoom: 16 });
    });

    map.on('locationfound', function (e) {
        console.log("Location found:", e.latlng);
        L.marker(e.latlng, {
            icon: L.divIcon({
                className: 'my-location-marker',
                html: '<i class="fas fa-dot-circle"></i>',
                iconSize: L.point(24, 24)
            })
        }).addTo(map).bindPopup("You are here!");
    });

    map.on('locationerror', function (e) {
        console.log("Location error:", e.message);
        alert("Unable to find your location: " + e.message);
    });

    // Modal handling for game instructions
    const modal = document.getElementById('howToPlayModal');
    modal.style.display = "block";
    document.getElementsByClassName('close')[0].onclick = () => modal.style.display = "none";
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    };
};
