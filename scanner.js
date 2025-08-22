import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://rkmgufohlmqknqkmmduu.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrbWd1Zm9obG1xa25xa21tZHV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NDc2MzQsImV4cCI6MjA3MTQyMzYzNH0.aZxyaYCqD_6YcXoZDGqDkwft60lH0LaoegGc9EVwf7U';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const video = document.getElementById('video');

async function startVideo() {
  await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
  await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
  await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error(err));
}

video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video);
  document.body.append(canvas);
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks().withFaceDescriptors();

    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    faceapi.draw.drawDetections(canvas, resizedDetections);

    if (detections.length > 0) {
      const descriptor = Array.from(detections[0].descriptor);
      // Save to Supabase
      await supabase.from('attendees').insert([{ name: 'Anonymous', face_descriptor: descriptor }]);
    }
  }, 3000); // every 3 seconds
});

startVideo();

function goToDashboard() {
  window.location.href = 'dashboard.html';
}
