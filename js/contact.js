// BAE_URL = 'http://0.0.0.0:8000'
BASE_URL = "https://pinaka.pythonanywhere.com"
document.getElementById('contactForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value || null,
        email: document.getElementById('email').value || null,
        contact: document.getElementById('phone').value || null,
        message: document.getElementById('message').value || null
    };  

    showModal('Submitting...', 'Please wait while we submit your message.', false);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', BASE_URL+'/api/send-message/', true);
    xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
            if (xhr.status === 200) {
                showModal('Success', 'Your message has been sent successfully!', true, false);
            } else {
                showModal('Error', 'An error occurred while sending your message. Please try again.', false, true);
            }
        }
    };
    xhr.send(JSON.stringify(formData));
});

function showModal(title, message, success, retry) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalRetry = document.getElementById('modal-retry');
    const modalHome = document.getElementById('modal-home');

    modalTitle.innerText = title;
    modalMessage.innerText = message;
    modalRetry.style.display = retry ? 'inline-block' : 'none';
    modalHome.style.display = success ? 'inline-block' : 'none';
    
    modal.style.display = 'block';
    
    modalRetry.onclick = function() {
        modal.style.display = 'none';
    };
    
    modalHome.onclick = function() {
        window.location.href = 'index.html';
    };
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
};
