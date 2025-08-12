import { Button } from "../src/components/ui/button";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-[#FFF7ED] text-[#065F46] min-h-screen font-sans">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center bg-[#10B981] text-white">
        <Link to="/log-in">
          <p className="text-md mb-6 hover:underline">
            Are you a staff or a registered guardian? Log in
          </p>
        </Link>
        <h1 className="text-5xl font-bold mb-4">
          Evergreen International School
        </h1>
        <p className="text-xl mb-6">
          Nurturing Bright Minds for a Brighter Future 🌍
        </p>
        <Link to="/apply">
          <Button className="bg-[#F59E0B] hover:bg-[#d18b06] text-[#78350F] px-6 py-3 rounded-2xl text-lg shadow-md">
            Apply for Admission
          </Button>
        </Link>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 max-w-4xl mx-auto text-center">
        <h2 className="text-3xl font-bold mb-4">Why EverEvergreen?</h2>
        <p className="text-lg text-gray-700 mb-6">
          At Evergreen, we empower learners through a holistic curriculum,
          modern facilities, and an inclusive environment. Our mission is to
          cultivate excellence, creativity, and global citizenship.
        </p>
        <div className="grid md:grid-cols-3 gap-6 mt-10">
          <div className="bg-[#FDE68A] p-6 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-2">🌟 Academic Excellence</h3>
            <p className="text-gray-700">
              International curriculum, top-tier educators, and hands-on
              learning.
            </p>
          </div>
          <div className="bg-[#FDE68A] p-6 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-2">🌿 Safe & Nurturing</h3>
            <p className="text-gray-700">
              Secure campus, caring staff, and a focus on student wellbeing.
            </p>
          </div>
          <div className="bg-[#FDE68A] p-6 rounded-2xl shadow">
            <h3 className="font-bold text-xl mb-2">🚀 Global Opportunities</h3>
            <p className="text-gray-700">
              Language programs, tech-driven classrooms, and cultural exposure.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#10B981] py-14 text-white text-center">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Begin Your Journey?
        </h2>
        <p className="mb-6 text-lg">
          Applications are now open for the new academic session.
        </p>
        <Link to="/apply">
          <Button className="bg-[#F59E0B] hover:bg-[#d18b06] text-[#78350F] px-6 py-3 rounded-2xl text-lg shadow-md">
            Apply now!
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="text-center py-6 text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Evergreen International School. All
        rights reserved.
      </footer>
    </div>
  );
}
