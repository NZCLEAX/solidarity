export function HeaderDashboard() {
  return (
    <header className="bg-[#111827] w-[98%] p-3 text-white rounded-xl mx-auto">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center lg:justify-start">

          {/* Barre de recherche */}
          <form className="mb-3 w-full lg:mb-0 lg:me-3 lg:w-auto" role="search">
            <input
              type="search"
              className="w-full rounded border border-gray-600 bg-[#212529] px-3 py-1 text-white placeholder-gray-400 focus:border-white focus:outline-none"
              placeholder="Search..."
              aria-label="Search"
            />
          </form>

          {/* Boutons */}
          <div className="text-end">
            <button
              type="button"
              className="me-2 rounded border border-white px-4 py-2 text-white transition hover:bg-white hover:text-black"
            >
              Login
            </button>
            <button
              type="button"
              className="rounded bg-yellow-400 px-4 py-2 font-medium text-black transition hover:bg-yellow-500"
            >
              Sign-up
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}