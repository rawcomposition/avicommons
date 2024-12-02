import Stats from "data/stats.json";
import RecentlyDownloaded from "data/recently-downloaded.json";
import Link from "next/link";

export default function Landing() {
  const { total, withImg, percent, license, source, taxonVersions } = Stats;
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-gray-100 py-10">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-800">Your Source for Bird Thumbnails</h2>
          <p className="mt-4 text-lg text-gray-600">
            Integrate <strong>Creative Commons</strong> licensed images into your app or website.
          </p>
          <p className="mt-2 text-gray-600">Supported eBird Taxonomy Versions: {taxonVersions.join(", ")}.</p>
          <Link href="/get-started">
            <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition">
              Get Started Now
            </button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold text-gray-800">Total Species</h3>
            <p className="mt-2 text-gray-600 text-xl">{total.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-white rounded shadow">
            <h3 className="text-lg font-bold text-gray-800">With Images</h3>
            <p className="mt-2 text-gray-600 text-xl">
              {withImg.toLocaleString()} <span className="text-gray-500">({percent})</span>
            </p>
          </div>
        </div>
      </section>

      <section className="bg-gray-100 py-10">
        <div className="container mx-auto">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recently Updated Images</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {RecentlyDownloaded.map((item) => (
              <div key={item.code} className="bg-white rounded shadow overflow-hidden">
                <img src={""} alt={item.name} className="w-full h-40 object-cover" />
                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-600 mt-2">
                    Photo by {item.author}, licensed under {item.license}.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-10">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">License Breakdown</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {license.map((item, index) => (
            <div key={index} className="p-4 bg-white rounded shadow">
              <h4 className="text-lg font-bold text-gray-800">{item.label || "Unknown"}</h4>
              <p className="text-gray-600 mt-2">Count: {item.count.toLocaleString()}</p>
              <p className="text-gray-600">Percent: {item.percent}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>
            Developed and maintained by{" "}
            <a href="https://rawcomposition.com" className="text-white hover:underline" target="_blank">
              Adam Jackson
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
