window.onload = function () {
    console.log("Initializing the map...");

    const map = L.map('mapid', {
        center: [-37.8081, 144.9633],
        zoom: 16,
        zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const totalScore = { value: 0 };
    const questLayer = L.layerGroup().addTo(map);
    const userLocationLayer = L.layerGroup().addTo(map);

    const quests = [
        {
            id: 1,
            name: "Francis Ormond Building",
            lat: -37.8083838,
            lng: 144.9652179,
            question: "Question: What year was the Francis Ormond Building first opened to the public?",
            options: ["1887", "1923", "1901"],
            answer: "1887",
            hint: "Hint: Look around the building’s entrance or plaques for a clue. Bonus if you can find a statue or painting of Francis Ormond!"
        },
        {
            id: 2,
            name: "Alumni Courtyard",
            lat: -37.8080,
            lng: 144.9635,
            question: "Question: What is the centerpiece of the courtyard that brings calm to this busy campus space?",
            options: ["A sculpture", "A large tree and greenery", "A water fountain"],
            answer: "A large tree and greenery",
            hint: "Hint: Look for something green or perhaps a water feature that invites relaxation."
        },
        {
            id: 3,
            name: "Swanston Academic Building (SAB)",
            lat: -37.8085,
            lng: 144.9642,
            question: "Question: How many floors does the Swanston Academic Building (SAB) have?",
            options: ["10 floors", "12 floors", "15 floors"],
            answer: "12 floors",
            hint: "Hint: Take a glance upwards – the building's height gives away the answer!"
        },
        {
            id: 4,
            name: "RMIT Gallery",
            lat: -37.8077,
            lng: 144.9649,
            question: "Question: Find the current exhibition’s theme and name one artist whose work is on display.",
            options: ["Architecture and design – artist: Zaha Hadid", "Contemporary art – artist: Various current exhibitions", "History of Melbourne – artist: Frederick McCubbin"],
            answer: "Contemporary art – artist: Various current exhibitions",
            hint: "Hint: Step inside to explore the creative minds on display. Look for posters or brochures that provide exhibition details."
        },
        {
            id: 5,
            name: "Capitol Theatre",
            lat: -37.8120,
            lng: 144.9641,
            question: "Question: What is the signature feature inside the Capitol Theatre that makes it so visually stunning?",
            options: ["A massive chandelier", "Intricate wall carvings", "Geometric ceiling with intricate lighting"],
            answer: "Geometric ceiling with intricate lighting",
            hint: "Hint: It's all in the lights and patterns – look up to the ceiling!"
        },
        {
            id: 6,
            name: "Rooftop Garden",
            lat: -37.8082,
            lng: 144.9631,
            question: "Question: What types of plants are commonly found here, and can you spot any herbs or vegetables growing?",
            options: ["Native Australian trees and shrubs", "Herbs, vegetables, and native Australian plants", "Flowering trees and decorative bushes"],
            answer: "Herbs, vegetables, and native Australian plants",
            hint: "Hint: Take a walk around and smell the herbs – it might help with your answer!"
        },
        {
            id: 7,
            name: "Library",
            lat: -37.8088,
            lng: 144.9640,
            question: "Question: How many study rooms are available to students in this library, and can you find a unique artwork displayed on the walls?",
            options: ["4-6 study rooms", "8-10 study rooms", "12-15 study rooms"],
            answer: "8-10 study rooms",
            hint: "Hint: Look for signage or ask a librarian for details on the study rooms."
        }
    ];

    function updateScoreAndProgress() {
        const completedCount = quests.filter(q => q.completed).length;
        document.getElementById('score').innerText = `Score: ${totalScore.value} | Completed: ${completedCount}/${quests.length}`;
    }

    quests.forEach(quest => {
        const marker = L.circleMarker([quest.lat, quest.lng], {
            color: 'red',
            fillColor: '#ff0000',
            fillOpacity: 0.8,
            radius: 10,
            className: 'blinking-marker'
        }).addTo(questLayer);

        marker.on('click', () => {
            const distance = map.distance(marker.getLatLng(), userLocationLayer.getLayers()[0] ? userLocationLayer.getLayers()[0].getLatLng() : [0,0]);
            if (distance <= 30) { // Adjust proximity check to 30 meters
                if (!quest.completed) {
                    askQuestion(quest, marker);
                } else {
                    alert("You have already completed this quest.");
                }
            } else {
                alert("Move closer to this location to attempt the challenge.");
            }
        });
    });

    function askQuestion(quest, marker) {
        const popupContent = `
            <h3>${quest.name}</h3>
            <p>${quest.question}</p>
            ${quest.options.map(option => `<button class='option-button'>${option}</button>`).join('')}
            <div><button class='check-answer-button'>Check Answer</button></div>
            <p class="hint">${quest.hint}</p>
        `;
        const popup = L.popup()
            .setLatLng([quest.lat, quest.lng])
            .setContent(popupContent)
            .openOn(map);

        document.querySelectorAll('.option-button').forEach(button => {
            button.onclick = function () {
                sessionStorage.setItem('selectedAnswer', button.textContent);
                document.querySelectorAll('.option-button').forEach(b => b.classList.remove('selected'));
                button.classList.add('selected');
            };
        });

        document.querySelector('.check-answer-button').onclick = function () {
            const selectedAnswer = sessionStorage.getItem('selectedAnswer');
            if (selectedAnswer === quest.answer) {
                alert("Correct answer! Well done.");
                totalScore.value += 5;
                quest.completed = true;
                marker.setStyle({ color: 'green', fillColor: 'green' });
                updateScoreAndProgress();
                map.closePopup();
            } else {
                alert("Incorrect answer. Try again!");
            }
        };
    }

    navigator.geolocation.watchPosition(
        position => {
            const { latitude, longitude } = position.coords;
            userLocationLayer.clearLayers();
            L.marker([latitude, longitude], {
                icon: L.divIcon({
                    className: 'my-location-marker',
                    html: '<i class="fas fa-dot-circle"></i>',
                    iconSize: L.point(24, 24)
                })
            }).addTo(userLocationLayer);
        },
        error => {
            alert("Unable to access your location.");
        },
        { enableHighAccuracy: true }
    );

    document.getElementById('find-me').addEventListener('click', () => {
        map.locate({ setView: true, maxZoom: 16 });
    });

    const modal = document.getElementById('howToPlayModal');
    modal.style.display = "block";

    document.querySelector('.close').onclick = () => {
        modal.style.display = "none";
    };

    window.onclick = event => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    updateScoreAndProgress();
};