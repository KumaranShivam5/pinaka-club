// Function to handle form submission
function submitForm() {
    // Get form data as JSON
    const formData = getFormDataAsJSON();

    // Create a new XMLHttpRequest object
    const xhr = new XMLHttpRequest();

    // Specify the API endpoint URL
    const url = 'https://pinaka-b8df8-default-rtdb.asia-southeast1.firebasedatabase.app/register-user/new-enquiry.json';

    // Configure the AJAX request
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    uid = getCookie('user_id')

    // Handle successful response
    xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
            // Successful response
            showStatusModal('success', 'Thank you for registration \n Your User ID is:\n <b>'+uid+' </b>\n We will contact you shortly. \n Take a screenshot of ths user ID for reference. and visit the Club for getting physical ID card <a href="index.html">PINAKA Home</a>');
        } else {
            // Error response
            showStatusModal('error', 'Error occurred. Please try again.');
        }
    };

    // Handle network errors
    xhr.onerror = function() {
        showStatusModal('error', 'Network error. Please try again.');
    };

    // Convert form data to JSON and send the request
    xhr.send(JSON.stringify({"uid" : uid , 'enquiry-details' : formData}));
}

// Function to get form data as JSON object
function getFormDataAsJSON() {
    const formData = {};
    const form = document.getElementById('studentForm');

    // Iterate through form elements
    for (const element of form.elements) {
        if (element.name) {
            formData[element.name] = element.value || null;
        }
    }

    return formData;
}

// Function to show status modal
function showStatusModal(status, message) {
    const modal = document.getElementById('statusModal');
    const statusMessage = document.getElementById('statusMessage');
    const retryButton = document.getElementById('retryButton');

    statusMessage.innerHTML = message;

    if (status === 'success') {
        retryButton.style.display = 'none';
    } else {
        retryButton.style.display = 'inline-block';
    }

    modal.style.display = 'block';
}

// Event listener for form submission
document.getElementById('studentForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Submit form using AJAX
    submitForm();
});

// Event listener for retry button click
document.getElementById('retryButton').addEventListener('click', function() {
    // Hide modal and retry form submission
    document.getElementById('statusModal').style.display = 'none';
    submitForm();
});
