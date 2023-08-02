// Function to toggle the favorite status of a coin
const toggleFavorite = (event) => {
  const heartIcon = event.target;
  const coinId = heartIcon.dataset.coinId;

  if (isFavorited(coinId)) {
    removeFavorite(coinId);
    heartIcon.classList.remove('favorite-heart');
  } else {
    addFavorite(coinId);
    heartIcon.classList.add('favorite-heart');
  }
};

// Fetch data from the API
fetch('https://api.coinranking.com/v2/coins')
  .then(response => response.json())
  .then(data => {
    if (data && data.data && data.data.coins) {
      const tbody = document.getElementById('data-body');
      const searchInput = document.getElementById('search_name');
      const searchButton = document.getElementById('search_button');

      // Function to filter the coins by name
      const filterCoinsByName = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredCoins = data.data.coins.filter(coin =>
          coin.name.toLowerCase().includes(searchTerm)
        );
        displayCoins(filteredCoins);
      };

      // Display the coins in the table
      const displayCoins = (coins) => {
        tbody.innerHTML = '';

        coins.forEach((coin, index) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <th scope="row">${index + 1}</th>
            <th scope="col"><span class="heart-icon ${isFavorited(coin.id) ? 'favorite-heart' : ''}" data-coin-id="${coin.id}">❤️</span></th>
            <td>${coin.name}</td>
            <td><img src="${coin.iconUrl}" alt="${coin.name}" width="30"></td>
            <td>$${coin.price}</td>
            <td>${coin.marketCap}</td>
            <td>${coin["24hVolume"]}</td>
            <td>${coin.tier}</td>
            <td>${coin.btcPrice}</td>
            <td><canvas id="sparkline-${index}"></canvas></td>
          `;

          tbody.appendChild(row);

          const chartData = coin.sparkline.map(value => parseFloat(value));
          const chartElement = document.getElementById(`sparkline-${index}`);
          new Chart(chartElement, {
            type: 'line',
            data: {
              labels: coin.sparkline,
              datasets: [{
                data: chartData,
                backgroundColor: 'rgba(0, 0, 0, 0)',
                borderColor: 'green',
                borderWidth: 1
              }]
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                display: false
              },
              scales: {
                xAxes: [{
                  display: false
                }],
                yAxes: [{
                  display: false
                }]
              }
            }
          });

          // Add an event listener to each heart icon
          const heartIcon = row.querySelector('.heart-icon');
          heartIcon.addEventListener('click', toggleFavorite);

          // Check and set favorite status from local storage
          if (isFavorited(coin.id)) {
            heartIcon.classList.add('favorite-heart');
          }
        });
      };

      // Helper functions to handle local storage for favorite coins
      const getFavoriteCoins = () => {
        const favoritesJSON = localStorage.getItem('favoriteCoins');
        return favoritesJSON ? JSON.parse(favoritesJSON) : [];
      };

      const isFavorited = (coinId) => {
        const favoriteCoins = getFavoriteCoins();
        return favoriteCoins.includes(coinId);
      };

      const addFavorite = (coinId) => {
        const favoriteCoins = getFavoriteCoins();
        favoriteCoins.push(coinId);
        localStorage.setItem('favoriteCoins', JSON.stringify(favoriteCoins));
      };

      const removeFavorite = (coinId) => {
        const favoriteCoins = getFavoriteCoins();
        const updatedFavorites = favoriteCoins.filter(id => id !== coinId);
        localStorage.setItem('favoriteCoins', JSON.stringify(updatedFavorites));
      };

      // Event listener for the search button
      searchButton.addEventListener('click', filterCoinsByName);

      // Event listener for the search input field (as you type)
      searchInput.addEventListener('input', filterCoinsByName);

      // Initial display of all coins
      displayCoins(data.data.coins);
    } else {
      console.error('Invalid API response:', data);
    }
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
