document.getElementById('sendDataButton').addEventListener('click', sendData);

async function sendData() {
    const video = document.getElementById('videoElement');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get the image data from the canvas as a Data URL
    const dataURL = canvas.toDataURL('image/png');

    // Extract the base64 portion from the Data URL
    const base64Image = dataURL.split(',')[1];

    // Create a data object to send to the server
    const data = {
        imageData: base64Image
    };

    // Send the captured frame data to the server
    fetch('/process-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (response.ok) {
            console.log('Data sent successfully');
        } else {
            console.error('Failed to send data');
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        const video = document.getElementById('videoElement');
        video.srcObject = stream;
    })
    .catch(err => console.error('Access to the camera was denied: ', err));



