let cameraStream = null;

function showCameraBackground() {
    removeCameraVideo();
    let video = document.getElementById('bg-video');
    if (!video) {
        video = document.createElement('video');
        video.id = 'bg-video';
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100vw';
        video.style.height = '100vh';
        video.style.objectFit = 'cover';
        video.style.zIndex = '0';
        video.style.pointerEvents = 'none';
        document.body.prepend(video);

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => {
                cameraStream = stream;
                video.srcObject = stream;
                document.body.style.backgroundImage = 'none';
            })
            .catch(err => {
                video.remove();
                alert('Unable to access camera: ' + err.message);
            });
    }
}

function removeCameraVideo() {
    const video = document.getElementById('bg-video');
    if (video) {
        if (cameraStream) cameraStream.getTracks().forEach(track => track.stop());
        video.remove();
        cameraStream = null;
    }
}