export function Header() {
  return (
    <header className="bg-[#111827] p-3 text-white">
      <div className="container mx-auto">
        <div className="flex flex-wrap items-center justify-center lg:justify-start">
          {/* Logo */}
          <a href="/" className="mb-2 flex items-center text-white no-underline lg:mb-0">
            <img src="https://cdn.helloasso.com/img/photos/adhesions/croppedimage-6235f7bf35db4269b76f1e0a5cf12b4b.png?width=220&height=220&quality=80&img_format=webp" alt="logo" />
          </a>

          {/* Navigation */}
          <ul className="nav col-12 col-lg-auto mb-2 flex w-full justify-center lg:mb-0 lg:me-auto lg:w-auto">
            <li><a href="#" className="block px-2 text-gray-400 hover:text-white">Home</a></li>
            <li><a href="#" className="block px-2 text-white hover:text-gray-300">Features</a></li>
            <li><a href="#" className="block px-2 text-white hover:text-gray-300">Pricing</a></li>
            <li><a href="#" className="block px-2 text-white hover:text-gray-300">FAQs</a></li>
            <li><a href="#" className="block px-2 text-white hover:text-gray-300">About</a></li>
          </ul>

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