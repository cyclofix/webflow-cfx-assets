
// function to check if localstorage item object has a key 'state' with an element 'client' present
// if not, returns
// if yes, replace a element with ID 'login_account_link' with text 'Mon compte' and href '/account'
function setLoginLink() {
    if (localStorage.getItem('state') === null) {
        return;
    }
    var localStoragetmp = JSON.parse(localStorage.getItem('state'));
    if (localStoragetmp.client && localStoragetmp.client.id != false) {
        var loginLink = document.getElementById('login_account_link');
        loginLink.innerHTML = 'Mon compte';
        loginLink.href = '/account';
    }
}

function setFormAction() {
    var localStoragetmp = JSON.parse(localStorage.getItem('state'));
    localStoragetmp = localStoragetmp.course;
    var mainform = document.getElementById('wf-form-Adresse');
    // if localstoragetmp shops value is not empty
    if (localStoragetmp.shops && localStoragetmp.shops.length > 0) {
        console.log("shops");
        mainform.action = '/reparation';
        mainform.setAttribute('redirect', '/reparation');
        mainform.setAttribute('data-redirect', '/reparation');
    } else if (localStoragetmp.product_id && localStoragetmp.product_id == 2) {
        console.log("scooter");
        mainform.action = '/reparation/symptoms/135';
        mainform.setAttribute('redirect', '/reparation/symptoms/135');
        mainform.setAttribute('data-redirect', '/reparation/symptoms/135');
    } else {
        console.log("bike");
        mainform.action = '/reparation/symptoms/118';
        mainform.setAttribute('redirect', '/reparation/symptoms/118');
        mainform.setAttribute('data-redirect', '/reparation/symptoms/118');
    }
}

// function named callgetAvailability() to call the API to get the availability of the fixers.
// this call is a GET request with the following parameters:
// - product_id: the id of the product (1 for bike, 2 for scooter)
// - with_shops: true
// - place_id: the place_id of the address
// and the following headers:
// - Content-Type: application/json
// - Accept: application/json
// - Authorization: 'api.cyclofix.com'
function callgetAvailability(place_id) {
    var localStoragetmp = JSON.parse(localStorage.getItem('state')).course;
    var product_id = localStoragetmp.product_id;
    var with_shops = true;
    // ajax call to get the availability of the fixers
    $.ajax({
        url: 'https://api.cyclofix.com/zones/availability',
        type: 'GET',
        data: { "product_id[0]": product_id, "with_shops": with_shops, "place_id": place_id },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',

        },
        success: function (response) {
            console.log("response", response);
            var localStoragetmp = JSON.parse(localStorage.getItem('state'));
            localStoragetmp = localStoragetmp.course;
            // to get localStoragetmp.shops we should map the response.shops array and append a value key to each element
            localStoragetmp.shops = response.shops ? response.shops.map(v => ({ value: { ...v } })) : [];
            localStoragetmp.zone_id = response.zone_id;
            addToLocalStorageObject('state', 'course', localStoragetmp);
            setFormAction();
        },
        error: function (error) {
            console.log("error", error);
        }
    });
}

function initGeosearch() {
    var gpaInput = document.getElementById("geoaddress");
    var autocomplete = new google.maps.places.Autocomplete(gpaInput, { types: ['address'], componentRestrictions: { country: 'fr' } });

    google.maps.event.addDomListener(gpaInput, 'keydown', function (event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    });

    var defaultCourse = {
        position: '',
        positionInput: '',
        positionLoading: false,
        positionError: '',
        date: false,
        bike_details: '',
        course_details: '',
        available_min: '',
        available_max: '',
        product_id: 1,
        codepromo: '',
        fixed: 1,
        slots: [],
        selectedShop: null,
        photos: [],
        placeId: '',
        fixerId: '',
        fixerCode: null,
        shops: [],
        zone_id: null
    };
    // verify that localstorage item object named 'state' has a 'course' key present
    // if not, set it to defaultCourse
    if (localStorage.getItem('state') === null) {
        localStorage.setItem('state', JSON.stringify({ course: defaultCourse }));
    }
    var localStoragetmp = JSON.parse(localStorage.getItem('state')).course;

    // check if localstorage is empty, if not, fill the input with the value of the localstorage
    if (localStoragetmp.position) {
        gpaInput.value = localStoragetmp.position;
    }

    // function to update the localstorage when the user select a place in the autocomplete list
    autocomplete.addListener('place_changed', async function () {
        var place = autocomplete.getPlace();
        var localStoragetmp = JSON.parse(localStorage.getItem('state'));
        var streetNumber = null;
        var streetName = null;

        for (var i = 0; i < place.address_components.length; i++) {
            var addressType = place.address_components[i].types[0];
            if (addressType === 'street_number') {
                streetNumber = place.address_components[i].long_name;
            } else if (addressType === 'route') {
                streetName = place.address_components[i].long_name;
            }
        }
    
        var errorDiv = document.getElementById('address-error-message');
        if (streetName && streetNumber) {
            // Full address with street name and number
            errorDiv.style.display = 'none';
            console.log("Complete address: " + streetName + " " + streetNumber);
        } else {
            // Incomplete address, prompt user for more information
            errorDiv.style.display = 'block';
            console.log("Please enter a full address including street number");
        }

        localStoragetmp = localStoragetmp.course;
        localStoragetmp.position = place.formatted_address;
        localStoragetmp.positionInput = place.formatted_address;
        addToLocalStorageObject('state', 'course', localStoragetmp);

        await callgetAvailability(place.place_id);
    });

    //function triggers the geolocation when someone click on the div with ID 'geolocate'
    var geolocateButton = document.getElementById('geolocate');
    geolocateButton.addEventListener('click', function () {
        // Try HTML5 geolocation.
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                // pass the position to Autocomplete to get the address and fill the input with ID 'geoaddress' with the address
                var geocoder = new google.maps.Geocoder;
                geocoder.geocode({ 'location': geolocation }, function (results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            gpaInput.value = results[0].formatted_address;
                            var localStoragetmp = localStorage.getItem('state');
                            localStoragetmp = JSON.parse(localStoragetmp);
                            if (localStoragetmp.course && !!!localStoragetmp.course.position) {
                                localStoragetmp.course.position = results[0].formatted_address;
                                localStoragetmp.course.positionInput = results[0].formatted_address;
                                addToLocalStorageObject('state', 'course', localStoragetmp);
                            }
                        }
                    }
                });
            });
        } else {
            console.log("geolocation not available");
        }
    });
}

function addToLocalStorageObject(name, key, value) {
    var existing = localStorage.getItem(name);

    // If no existing data, create an array
    // Otherwise, convert the localStorage string to an array
    existing = existing ? JSON.parse(existing) : {};

    // Add new data to localStorage Array
    existing[key] = value;

    // Save back to localStorage
    localStorage.setItem(name, JSON.stringify(existing));
};

// function to add event listener to the bike and scooter radio buttons
document.addEventListener("DOMContentLoaded", function () {
    // function to set radio button checked when the page is loaded and the localstorage is not empty and the product_id is set
    function initRadioChecked() {
        var localStoragetmp = JSON.parse(localStorage.getItem('state'));
        localStoragetmp = localStoragetmp.course;
        if (localStoragetmp.product_id) {
            console.log("product_id", localStoragetmp.product_id);
            // get current div with class "w-radio-input" and remove class "w--redirected-checked"
            var current = document.getElementsByClassName("w--redirected-checked");
            if (current.length > 0) {
                current[0].classList.remove("w--redirected-checked");
            }
            // get the radio button with the product_id
            var product = document.getElementById('product_' + localStoragetmp.product_id);
            // get the div above the radio button at the same level
            var labell = product.parentNode;
            // get the div inside the div above
            var div2 = labell.childNodes[0];
            // add class "w--redirected-checked" to div2
            div2.classList.add("w--redirected-checked");
        }
    }

    function addEventListenerstoProducts() {
        var scooter = document.getElementById('product_2');
        if (scooter) {
            scooter.addEventListener('click', function () {
                var localStoragetmp = JSON.parse(localStorage.getItem('state'));
                localStoragetmp = localStoragetmp.course;
                localStoragetmp.product_id = 2;
                addToLocalStorageObject('state', 'course', localStoragetmp);
                initRadioChecked();
                setFormAction();
            });
        } else {
            console.log(document.getElementById('product_2'));
            console.log('scooter not found');
        }

        var bike = document.getElementById('product_1');
        if (bike) {
            bike.addEventListener('click', function () {
                var localStoragetmp = JSON.parse(localStorage.getItem('state'));
                localStoragetmp = localStoragetmp.course;
                localStoragetmp.product_id = 1;
                addToLocalStorageObject('state', 'course', localStoragetmp);
                initRadioChecked();
                setFormAction();
            });
        } else {
            console.log('bike not found');
        }
    }
    window.onload = function () {
        setLoginLink();
        addEventListenerstoProducts();
        initRadioChecked();
        setFormAction();
    }
});