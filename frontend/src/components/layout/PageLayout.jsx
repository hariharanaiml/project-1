import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

export default function PageLayout({ children, showSidebar = false, hideFooter = false }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex flex-1">
        {showSidebar && <Sidebar />}
        <main className={`flex-1 ${showSidebar ? 'lg:pl-64' : ''}`}>
          <div className="pt-16">
            {children}
          </div>
        </main>
      </div>
      {!hideFooter && <Footer />}
    </div>
  );
}

