// components/ContactForm.jsx  (or Reachuspage.jsx)
export default function Reachuspage() {
  return (
    <form
      action="https://formspree.io/f/mgolppya"
      method="POST"
      className="max-w-xl mx-auto p-6 space-y-6 bg-white shadow-lg rounded-lg"
    >
      {/* Honeypot for spam protection */}
      <input type="text" name="_gotcha" style={{ display: 'none' }} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            type="text"
            name="firstName"
            required
            className="mt-1 w-full border border-gray-300 p-3 rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            type="text"
            name="lastName"
            required
            className="mt-1 w-full border border-gray-700 p-3 rounded focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
        <input
          type="tel"
          name="phone"
          required
          className="mt-1 w-full border border-gray-300 p-3 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full border border-gray-300 p-3 rounded focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          name="message"
          required
          rows={5}
          className="mt-1 w-full border border-gray-300 p-3 rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="How can we improve or any feedback for DkikiShop?"
        />
      </div>

      {/* Custom thank-you redirect (works on paid plans) */}
      <input type="hidden" name="_next" value="/thank-you" />
      {/* Honeypot - stops most spam bots */}
      <input type="text" name="_gotcha" style={{ display: 'none' }} />

      {/* Redirect after success - works on paid plans; on free → Formspree default thank-you */}
      <input type="hidden" name="_next" value="/thank-you" />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium shadow"
      >
        Send Message
      </button>
    </form>
  );
}