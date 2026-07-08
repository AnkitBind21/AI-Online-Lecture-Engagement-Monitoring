import {
  FaceLandmarker,
  FilesetResolver
} from "@mediapipe/tasks-vision";

let faceLandmarker;

export const initializeFaceDetector = async () => {
  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceLandmarker = await FaceLandmarker.createFromOptions(
    vision,
    {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
      },
      runningMode: "VIDEO",
      numFaces: 10
      
    }
  );

  return faceLandmarker;
};

export const getFaceLandmarker = () => faceLandmarker;

export const detectFace = (
  faceLandmarker,
  video,
  timestamp
) => {
  return faceLandmarker.detectForVideo(
    video,
    timestamp
  );
};

export const getEyeStatus = (landmarks) => {
  // Left eye landmarks
  const top = landmarks[159];
  const bottom = landmarks[145];

  // Eye opening distance
  const eyeHeight = Math.abs(top.y - bottom.y);

  if (eyeHeight < 0.015) {
    return "Closed";
  }

  return "Open";
};