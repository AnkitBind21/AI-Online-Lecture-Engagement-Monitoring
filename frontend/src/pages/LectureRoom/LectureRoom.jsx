import Navbar from "../../components/Navbar/Navbar";

function LectureRoom() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      <div className="p-8">
        <h1 className="text-4xl font-bold mb-8">
          Live Lecture Monitoring
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* Webcam Feed */}
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl h-[450px] flex items-center justify-center">
            <p className="text-gray-400 text-xl">
              Webcam Feed Area
            </p>
          </div>

          {/* Analytics Panel */}
          <div className="bg-slate-900 rounded-2xl p-6">
            <h2 className="text-2xl font-bold mb-6">
              Live Analytics
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Attention Score</p>
                <h3 className="text-3xl font-bold text-green-400">
                  92%
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Status</p>
                <h3 className="text-xl font-semibold">
                  Attentive
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Blink Rate</p>
                <h3 className="text-xl font-semibold">
                  Normal
                </h3>
              </div>

              <div className="bg-slate-800 p-4 rounded-xl">
                <p className="text-gray-400">Head Position</p>
                <h3 className="text-xl font-semibold">
                  Center
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4 mt-8">
          <button className="bg-blue-600 px-6 py-3 rounded-xl">
            Mic
          </button>

          <button className="bg-green-600 px-6 py-3 rounded-xl">
            Camera
          </button>

          <button className="bg-yellow-600 px-6 py-3 rounded-xl">
            Start Monitoring
          </button>

          <button className="bg-red-600 px-6 py-3 rounded-xl">
            End Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default LectureRoom;