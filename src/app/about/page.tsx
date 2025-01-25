import Link from 'next/link'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Policy Navigation Buttons */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <Link 
            href="https://www.termsfeed.com/live/ec820737-f750-4f3d-b87e-040ce5a901b2"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </Link>
          <Link 
            href="https://www.termsfeed.com/live/0f425568-709a-4304-ab29-5f2adfb0e53b"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Terms & Conditions
          </Link>
          <Link 
            href="https://www.freeprivacypolicy.com/live/14bba7d0-28e0-46df-8062-d049b8f59b04"
            className="glass-button px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            Refund Policy
          </Link>
        </div>

        <div className="glass-card rounded-xl p-8">
          <h1 className="text-4xl font-bold text-white mb-8">About Editors Hub</h1>
          
          <div className="space-y-6 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
              <p>
                Editors Hub is a premier platform connecting talented artists with clients seeking high-quality creative services. 
                We strive to create a seamless marketplace where creativity meets opportunity, enabling artists to showcase their 
                skills and clients to find the perfect creative partner for their projects.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Business Details</h2>
              <div className="space-y-2">
                <p><strong>Business Name:</strong> Editors Hub</p>
                <p><strong>Location:</strong> Ranchi, India</p>
                <p><strong>Email:</strong> dbforuse1@gmail.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">What We Offer</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>A secure platform for artists to showcase their work</li>
                <li>Easy project management and communication tools</li>
                <li>Secure payment processing</li>
                <li>Quality assurance and support</li>
                <li>Fair pricing and transparent policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">Our Policies</h2>
              <div className="space-y-4">
                <div>
                  <Link 
                    href="https://www.termsfeed.com/live/ec820737-f750-4f3d-b87e-040ce5a901b2"
                    className="text-violet-400 hover:text-violet-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Privacy Policy
                  </Link>
                  <p className="mt-1">Learn about how we handle and protect your data.</p>
                </div>
                <div>
                  <Link 
                    href="https://www.termsfeed.com/live/0f425568-709a-4304-ab29-5f2adfb0e53b"
                    className="text-violet-400 hover:text-violet-300 underline"
                  >
                    Terms and Conditions
                  </Link>
                  <p className="mt-1">Read our terms of service and usage guidelines.</p>
                </div>
                <div>
                  <Link 
                    href="https://www.freeprivacypolicy.com/live/14bba7d0-28e0-46df-8062-d049b8f59b04"
                    className="text-violet-400 hover:text-violet-300 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Refund Policy
                  </Link>
                  <p className="mt-1">Understand our refund and return procedures.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
} 