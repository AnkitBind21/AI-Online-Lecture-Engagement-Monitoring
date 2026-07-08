import { Camera, CameraOff, User } from "lucide-react";

function VideoGrid({ videoRef, cameraOn, children }) {
  return (
    <div className="relative w-full h-full">

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={`w-full h-full object-cover scale-x-[-1] ${
          cameraOn ? "block" : "hidden"
        }`}
      />

      {!cameraOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
          <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <User size={48} />
          </div>

          <p>Camera is off</p>
        </div>
      )}

      {children}

    </div>
  );
}

export default VideoGrid;
