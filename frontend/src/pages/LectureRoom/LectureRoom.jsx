import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import {
  initializeFaceDetector,
  getFaceLandmarker,
  detectFace,
} from "../../utils/faceDetector";

function LectureRoom() {
  const videoRef = useRef(null);
  const detectorInitialized = useRef(false);
  const animationFrameRef = useRef(null);
  const navigate = useNavigate();

  const [cameraOn, setCameraOn] = useState(false);

  const [faceStatus, setFaceStatus] = useState("Waiting for Face");
  const [attentionScore, setAttentionScore] = useState(0);
  const [headPosition, setHeadPosition] = useState("Unknown");
  const [eyeStatus, setEyeStatus] = useState("Unknown");

  useEffect(() => {
    const loadDetector = async () => {
      if (!detectorInitialized.current) {
        try {
          await initializeFaceDetector();
          detectorInitialized.current = true;
          console.log("Face Detector Ready");
        } catch (error) {
          console.error("MediaPipe Error:", error);
        }
      }
    };

    loadDetector();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const runFaceDetection = () => {
    const faceLandmarker = getFaceLandmarker();

    if (
      faceLandmarker &&
      videoRef.current &&
      videoRef.current.readyState >= 2
    ) {
      const results = detectFace(
        faceLandmarker,
        videoRef.current,
        performance.now()
      );

      if (
        results.faceLandmarks &&
        results.faceLandmarks.length > 0
      ) {
        setFaceStatus("Detected");
      } else {
        setFaceStatus("Not Detected");
      }
    }

    animationFrameRef.current =
      requestAnimationFrame(runFaceDetection);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      videoRef.current.srcObject = stream;

      setCameraOn(true);

      setAttentionScore(100);
      setHeadPosition("Center");
      setEyeStatus("Open");

      runFaceDetection();
    } catch (error) {
      console.error("Camera access denied:", error);
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setCameraOn(false);
    setFaceStatus("Not Detected");
    setAttentionScore(0);
    setHeadPosition("Unknown");
    setEyeStatus("Unknown");
  };

  const toggleCamera = async () => {
    if (cameraOn) {
      stopCamera();
    } else {
      await startCamera();
    }
  };

  const endMeeting = () => {
    stopCamera();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">
          Live Lecture Monitoring
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Webcam Section */}
          <div className="lg:col-span-2">
            <div className="bg-slate-900 rounded-2xl h-[500px] overflow-hidden relative">

              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Controls */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">

                <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full shadow-lg">
                  🎤
                </button>

                <button
                  onClick={toggleCamera}
                  className={`px-6 py-3 rounded-full shadow-lg ${
                    cameraOn
                      ? "bg-orange-600 hover:bg-orange-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {cameraOn ? "📷 OFF" : "📷 ON"}
                </button>

                <button
                  onClick={endMeeting}
                  className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full shadow-lg"
                >
                  📞 END
                </button>

              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">
              Live Analytics
            </h2>

            <div className="space-y-4">

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Attention Score</p>
                <h3 className="text-3xl font-bold text-green-400">
                  {attentionScore}%
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Face Status</p>
                <h3 className="text-xl font-semibold">
                  {faceStatus}
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Eye Status</p>
                <h3 className="text-xl font-semibold">
                  {eyeStatus}
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Head Position</p>
                <h3 className="text-xl font-semibold">
                  {headPosition}
                </h3>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LectureRoom;