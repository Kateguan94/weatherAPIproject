var inputElement = $("input");

// start with filling in the input element and programmatically
// triggering the request and choosing first row in results
inputElement.val('Helsingborg');
getPlaceCoordinate().done(function() {
    var firstListElement = searchRowsContainer.find('.searchRow')[0]
    $(firstListElement).click();
    searchRowsContainer.detach();
});

inputElement.on('blur', function(event) {
    setTimeout(function() {
        searchRowsContainer.detach();
    }, 200)
});

inputElement.on('focus', function() {
    if (inputElement.val().trim())
        searchRowsContainer.insertAfter(inputElement);
});

inputElement.on('input', delayGettingPlaceCoordinate);
//delay the API request until the user doesn't change input for at least a second
function delayGettingPlaceCoordinate() {
    clearTimeout(delayGettingPlaceCoordinate.timeout);
    delayGettingPlaceCoordinate.timeout = setTimeout(getPlaceCoordinate, 100);
}

//send API request to get matching user input places with geographical coordinate
function getPlaceCoordinate() {
    var inputValue = inputElement.val();
    inputValue = inputValue.trim();
    if (!inputValue)
        return searchRowsContainer.detach();
    else
        return $.get('https://api.opencagedata.com/geocode/v1/json?q=' + encodeURIComponent(inputValue) + '&key=e0136fb3d94f4f589fb75d29b318734e', buildListOfFoundPlaces);
}

var searchRowsContainer = $('.searchRowsContainer');
searchRowsContainer.detach();
var searchRowTemplate = searchRowsContainer.find('.searchRow').detach();
var uniquePlaces = new Map;

//create a list of found places
function buildListOfFoundPlaces(data) {
    searchRowsContainer.empty();
    uniquePlaces.clear();

    data.results.forEach(function(place) {
        var placeObject = {
            area: place.components.city || place.components.county || place.components.town,
            country: place.components.country,
            state: place.components.state
        };
        uniquePlaces.set(JSON.stringify(placeObject), placeObject);
        var coordinates = place.geometry; // the object includes lat and lng attributes
        placeObject.coordinates = coordinates;
    });;

    //for each uniquely named place, create rowElement and add it to search container
    uniquePlaces.forEach(function(place) {
        var rowElement = searchRowTemplate.clone(true);
        rowElement.find('.area').text(place.area ? place.area + ',' : '');
        rowElement.find('.state').text(place.state ? place.state + ',' : '');
        rowElement.find('.country').text(place.country);
        rowElement[0].$coordinates = place.coordinates;
        searchRowsContainer.append(rowElement);
    });
    searchRowsContainer.insertAfter(inputElement);
}

var iconMap = {
    'Blizzard': 'snowy-4',
    'Clear': 'night',
    'CloudRainThunder': 'thunder',
    'CloudSleetSnowThunder': 'thunder',
    'Cloudy': 'cloudy',
    'Fog': 'fog',
    'FreezingDrizzle': 'snowy-4',
    'FreezingFog': 'fog',
    'FreezingRain': 'snowy-4',
    'HeavyRain': 'rainy-7',
    'HeavyRainSwrsDay': 'rainy-7',
    'HeavyRainSwrsNight': 'rainy-7',
    'HeavySleet': 'rainy-6',
    'HeavySleetSwrsDay': 'rainy-6',
    'HeavySleetSwrsNight': 'rainy-6',
    'HeavySnow': 'snow-6',
    'HeavySnowSwrsDay': 'snowy-6',
    'HeavySnowSwrsNight': 'snowy-6',
    'IsoRainSwrsDay': 'rainy-1',
    'IsoRainSwrsNight': 'snowy-5',
    'IsoSleetSwrsDay': 'snow-1',
    'IsoSleetSwrsNight': '',
    'IsoSnowSwrsDay': 'snowy-1',
    'IsoSnowSwrsNight': 'snowy-4',
    'mist': 'rain-drops',
    'ModRain': 'rainy-5',
    'ModRainSwrsDay': 'rainy-1',
    'ModSleet': 'snowy-4',
    'ModSleetSwrsDay': "rainy-1",
    'ModSleetSwrsNight': 'rainy-5',
    'ModSnow': 'snowy-5',
    'ModSnowSwrsDay': 'snow-1',
    'ModSnowSwrsNight': 'snowy-5',
    'OccLightRain': 'rainy-4',
    'OccLightSleet': 'rainy-4',
    'OccLightSnow': 'snowy-4',
    'Overcast': 'cloudy',
    'PartCloudRainThunderDay': 'thunder',
    'PartCloudRainThunderNight': 'thunder',
    'PartCloudSleetSnowThunderDay': 'thunder',
    'PartCloudSleetSnowThunderNight': 'thunder',
    'PartlyCloudyDay': 'cloudy-day-2',
    'PartlyCloudyNight': 'cloudy-night-2',
    'Sunny': 'day'
};

//send request to get weather report on chosen place
searchRowsContainer.on('click', weatherRequest);
var weatherTiles = $('.weather');

function weatherRequest(event) {
    inputElement.append
    var placeCoordinates = event.target.closest('.searchRow').$coordinates;

    // update input element value with the chosen location
    var row = $(event.target).closest('.searchRow');
    var rowText = row.find('.area').text() + ' ' + row.find('.country').text();
    inputElement.val(rowText);

    // get current weather details
    $.ajax({
        type: 'GET',
        url: 'https://api.weatherunlocked.com/api/current/' + placeCoordinates.lat + ',' + placeCoordinates.lng + '?app_id=f76fdae3&app_key=94aaf10e2ed7c46bfaecf7320cf64861',
        headers: {
            "Accept": "application/json"
        }
    }).done(function(weather) {
        $('.currentWeather').text(weather.wx_desc);
        $('h1').text(weather.temp_c);
    });

    $.ajax({
            type: 'GET',
            url: 'https://api.weatherunlocked.com/api/forecast/' + placeCoordinates.lat + ',' + placeCoordinates.lng + '?app_id=f76fdae3&app_key=94aaf10e2ed7c46bfaecf7320cf64861',
            headers: {
                "Accept": "application/json"
            }
        })

        //when a place is chosen, close place list and input the name of chosen place in the input
        .done(function(responseData) {
            responseData.Days.forEach(function(day, index) {
                buildForecastTile(weatherTiles, day, index);
            });
            $(weatherTiles[0]).click();
        });

}

function buildForecastTile(weatherTiles, day, index) {
    var date;
    if (index === 0) {
        date = 'Today';
    } else if (index === 1) {
        date = 'Tomorrow';
    } else {
        date = day.date.split('/');
        date = Number(date[1]) + '-' + Number(date[0]);
    }
    var weatherElement = $(weatherTiles[index]);
    weatherElement.find('h3').text((new Date(day.date.split('/').reverse().join('-')).toDateString().split(' ')[0]));
    weatherElement.find('h4').text(date);
    weatherElement.find('.minTemperature').text(day.temp_min_c + '°C');
    weatherElement.find('.maxTemperature').text(day.temp_max_c + '°C');
    weatherElement.find('.icon svg').replaceWith($('.iconset svg.' + iconMap[day.Timeframes[Math.floor(day.Timeframes.length / 2)].wx_icon.replace('.gif', '')]).clone(true)); // happy haloween ^_^
    weatherElement[0].$timeFrames = day.Timeframes;
}

function showWeatherDetails(target) {
    var weatherTile = $(target).closest('.weather');
    var currentWeatherColumn = $('.currentWeatherColumn');
    if (!weatherTile) return;
    var timeFrames = weatherTile[0].$timeFrames;
    weatherTiles.removeClass('selected');
    weatherTile.addClass('selected');
    currentWeatherColumn.each(function(index, column) {
        var timeFrame = timeFrames[index];
        column = $(column);
        if (!timeFrame) return column.addClass('hidden');
        column.removeClass('hidden');
        var time = timeFrame.time.toString();
        var timeLength = time.length;
        var formattedTime = time.slice(0, timeLength - 2) + ':' + time.slice(timeLength - 2);
        column.find('.hour').text(formattedTime);
        column.find('.temperature').text(timeFrame.temp_c + '°C');
        column.find('.humidity').text(timeFrame.humid_pct);
        column.find('.wind').text(timeFrame.windspd_kmh.toFixed(1));
        column.find('.totalPrecipitation').text(timeFrame.prob_precip_pct + '%');
    });
}