import Navbar from "../../components/Navbar/Navbar";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="text-center py-24 px-6">
        <h1 className="text-6xl font-bold mb-6">
          AI Online Lecture Monitoring
        </h1>

        <p className="text-xl text-gray-400 max-w-3xl mx-auto">
          Monitor student attention, engagement, and participation during
          online lectures using AI-powered real-time analytics.
        </p>

        <button className="mt-10 px-8 py-4 bg-blue-600 rounded-xl hover:bg-blue-700 transition">
          Start Monitoring
        </button>
      </section>

      {/* Stats Section */}
      <section className="grid md:grid-cols-3 gap-6 px-10 py-10">
        <div className="bg-slate-900 p-6 rounded-xl text-center">
          <h2 className="text-4xl font-bold text-blue-500">98%</h2>
          <p className="text-gray-400 mt-2">Detection Accuracy</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl text-center">
          <h2 className="text-4xl font-bold text-blue-500">50+</h2>
          <p className="text-gray-400 mt-2">Students Supported</p>
        </div>

        <div className="bg-slate-900 p-6 rounded-xl text-center">
          <h2 className="text-4xl font-bold text-blue-500">Real-Time</h2>
          <p className="text-gray-400 mt-2">Live Analytics</p>
        </div>
      </section>

      {/* Features */}
      <section className="px-10 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-slate-900 p-6 rounded-xl">
            <h3 className="text-2xl font-semibold mb-3">Face Detection</h3>
            <p className="text-gray-400">
              Detect student presence and facial orientation in real time.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <h3 className="text-2xl font-semibold mb-3">Eye Tracking</h3>
            <p className="text-gray-400">
              Monitor eye movement to estimate attentiveness.
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl">
            <h3 className="text-2xl font-semibold mb-3">Analytics</h3>
            <p className="text-gray-400">
              Generate real-time engagement reports and insights.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;