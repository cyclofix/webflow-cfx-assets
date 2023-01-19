
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
// call the function setLoginLink() when the page is loaded
window.onload = setLoginLink;

function initGeosearch() {
    var gpaInput = document.getElementById("geoaddress");
    var autocomplete = new google.maps.places.Autocomplete(gpaInput, { types: ['geocode'], componentRestrictions: { country: 'fr' } });
    //var localStoragetmp = localStorage.getItem('state').course;
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
    autocomplete.addListener('place_changed', function () {
        var place = autocomplete.getPlace();
        var localStoragetmp = JSON.parse(localStorage.getItem('state'));
        localStoragetmp = localStoragetmp.course;
        localStoragetmp.position = place.formatted_address;
        localStoragetmp.positionInput = place.formatted_address;
        addToLocalStorageObject('state', 'course', localStoragetmp);
    });

    //function triggers the geolocation when someone click on the div with ID 'geolocate'
    var geolocateButton = document.getElementById('geolocate');
    geolocateButton.addEventListener('click', function () {
        // Try HTML5 geolocation.
        console.log("click on geolocate");
        if (navigator.geolocation) {
            console.log("geolocation available");
            navigator.geolocation.getCurrentPosition(function (position) {
                var geolocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                console.log("geolocation", geolocation);
                // pass the position to Autocomplete to get the address and fill the input with ID 'geoaddress' with the address
                var geocoder = new google.maps.Geocoder;
                geocoder.geocode({ 'location': geolocation }, function (results, status) {
                    if (status === 'OK') {
                        if (results[0]) {
                            console.log("OK");
                            console.log("results", results);
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
    function setRadioChecked() {
        var localStoragetmp = JSON.parse(localStorage.getItem('state'));
        localStoragetmp = localStoragetmp.course;
        if (localStoragetmp.product_id) {
            var product = document.getElementById('product_' + localStoragetmp.product_id);
            product.checked = true;
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
                var mainform = document.getElementById('wf-form-Adresse');
                mainform.action = '/reparation/symptoms/135';
                mainform.setAttribute('redirect', '/reparation/symptoms/118');
                mainform.setAttribute('data-redirect', '/reparation/symptoms/118');
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
                var mainform = document.getElementById('wf-form-Adresse');
                mainform.action = '/reparation/symptoms/135';
                mainform.setAttribute('redirect', '/reparation/symptoms/135');
                mainform.setAttribute('data-redirect', '/reparation/symptoms/135');
            });
        } else {
            console.log('bike not found');
        }
    }
    window.onload = function () {
        addEventListenerstoProducts();
        setRadioChecked();
    }
});