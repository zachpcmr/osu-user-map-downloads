class FetchClass {

    /*
     * CLASS PROPERTIES
     */

    // Base URL for the API - get this from your documentation for the api - this should be whatever the static part of the API url is
    static #baseUrl = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';
    static overlayAutoMode = true;

    /*
     * PRIVATE CLASS METHODS - cannot be called from outside the class
     */

    // Validates the input parameters for an API request.
    //  @param {string} apiMethod - The HTTP method to be validated - allowed options are GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD. Edit to taste.
    //  @param {Object} requestData - The request data to be validated. requestData must be a valid JSON object. The contents are NOT inspected.
    static #ValidateInputs(apiMethod, requestData) {
        const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

        if (!validMethods.includes(apiMethod)) {
            throw new Error(`Invalid HTTP method: ${apiMethod}`);
        }

        if (typeof requestData !== 'object' || requestData === null || Array.isArray(requestData)) {
            throw new Error('Request data must be a valid JSON object');
        }
    }

    // Shows the loading overlay if the auto mode is enabled (this is the default)
    static #ShowOverlayAuto() {
        if (this.overlayAutoMode === false) {
            return;
        }
        this.#ShowOverlay();
    }

	// Handles the actual creation and display of the overlay and spinner
    static #ShowOverlay() {
        if ($('#FETCHCLASS_OVERLAY').length === 0) {
            $('body').append(`
                <div id="FETCHCLASS_OVERLAY" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.7); z-index: 9999;">
                    <div class="spinner-border text-light" style="position: absolute; top: 50%; left: 50%;" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </div>
            `);
        }
        $('#FETCHCLASS_OVERLAY').show();
    }

    // Hides and removes the loading overlay if the auto mode is enabled (this is the default)
    static #HideOverlayAuto() {
        if (this.overlayAutoMode === false) {
            return;
        }
        this.#HideOverlay();
    }

	// handles the actual hiding of the overlay by removing the div created in #ShowOverlay from the DOM
    static #HideOverlay() {
        $('#FETCHCLASS_OVERLAY').remove();
    }

	/*
	 * PUBLIC CLASS METHODS - THESE YOU CAN CALL
	 */

	// Puts overlay into manual mode. When in manual mode, the overlay will not be automatically hidden, and you must use HideOverlayManual to hide the
	//  overlay and cancel manual mode.
    static ShowOverlayManual() {
        this.overlayAutoMode = false;
        this.#ShowOverlay();
    }

	// hides an overlay and sets the overlay mode back to automatic.
    static HideOverlayManual() {
        this.overlayAutoMode = false;
        this.#HideOverlay();
    }

    /**
     * Makes an API request using Fetch API.
     *
     * @param {Object} - A JSON object containing the parameters for this API request.
     *  Valid JSON entries are:
     *		@option successCallback {function} 	the name of the function to be called when a 200 response is received from the endpoint
     *      @option callbackParams {array}		an array of data to be passed to successCallback. Default is [], for no extra parameters
     *		@option apiUrl {string}				a partial URL to the API endpoint - see #baseUrl at the top of this class
     *      @option requestData {object}		any JSON to be passed into the API - defaults to {}
     *		@option apiMethod {string} 			one of the methods allowed by #ValidateInputs. Defaults to 'GET'
     */
    static MakeApiRequest({ successCallback, callbackParams = [], apiUrl, requestData = {}, apiMethod = 'GET' }) {

        // ensure that the apiMethod is allowed, and that requestData is a JSON object
        this.#ValidateInputs(apiMethod, requestData);

        // Convert requestData to a query string if method is GET
        if (apiMethod === 'GET') {
            const queryParams = new URLSearchParams(requestData).toString();
            apiUrl += `?${queryParams}`;
        }

        // Show the overlay if automatic overlay mode is enabled
        this.#ShowOverlayAuto();

		// set the proper content type for the request
        let contentType = (apiMethod == 'GET') ? 'text/plain' : 'application/json';
        let headers = {
            'Content-Type': contentType
        };

		// perform the fetch request asynchronously
        fetch(this.#baseUrl + apiUrl, {
            method: apiMethod,
            mode: 'cors',
            headers: {'Content-Type': contentType},
            body: (apiMethod !== 'GET') ? JSON.stringify(requestData) : null,
        })
        .then(response => {
			// when a valid response is received from the endpoint - may or may not be a 200 (OK) response
            if (!response.ok) {
				// we didn't get a 200 response, so the API call was not successful
                console.error('HTTP error ' + response.status + ": " + response.statusText);
                throw new Error('An error occurred while communicating with the server.\nError ' + response.status + ': ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            // Hide overlay if we are in automatic mode, then pass the API response data and any callback parameters to the callback function
            this.#HideOverlayAuto();
            successCallback(data, ...callbackParams);
        })
        .catch(error => {
            // An error occurred, such as server not found. Hide overlay, and log/alert the error information
            this.#HideOverlayAuto();
            console.error('There has been a problem with your fetch operation:', error);
            alert(error.message);
        });
    }

    // Takes a json object in the format of {payload: [{id: Integer, text: String},...]}
    // and the name of one or more Jquery selectors representing select boxes, and stores the payload
    // data into the select
    static LoadSelectWithOptions(jsonObj, ...selectObjects) {
        $.each(selectObjects, (arrayIndex, selectObjectID) => {
            $(selectObjectID).empty();
            $.each(jsonObj.payload, function(itemIndex, arrayContent) {
                $(selectObjectID).append(new Option(arrayContent.text, arrayContent.id));
            });
        });
    }

	/* SAMPLE USAGE

	// make an API call using POST baseUrl/fetch. Have any data passed to handleMyFetchRequest(). Pass in two parameters to the API, with values of 'foo' and 'bar'
	FetchClass.MakeApiRequest({
		successCallback: handleMyFetchRequest,
		apiUrl: '/fetchsomething',
		requestData: {
			param_to_pass_to_api: 'foo',
			another_param_to_pass: 'bar'
		},
		apiMethod: 'POST'
	});

	function handleMyFetchRequest(jsonData) {
		console.log("API Response Received. Data follows:");
		console.log(jsonData);
	}

	// alternative syntax, with an anonymous callback function and arrow notation. Placing successCallback last in the JSON input to MakeApiRequest
	// makes the code a little easier to read.
	FetchClass.MakeApiRequest({
		apiUrl: '/fetchsomething',
		apiMethod: 'POST'
		requestData: {
			param_to_pass_to_api: 'foo',
			another_param_to_pass: 'bar'
		},
		successCallback: (jsonData) => {
			console.log("API Response Received. Data follows:");
			console.log(jsonData);
		},
	});

	*/

};
