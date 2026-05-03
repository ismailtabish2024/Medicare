import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { navbarStyles as ns } from "../assets/dummyStyles";
import logoImg from "../assets/logo.png";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Grid,
  Home,
  List,
  Menu,
  PlusSquare,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useAuth, useClerk, useUser } from "@clerk/react";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const navInnerRef = useRef(null);
  const indicatorRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const clerk = useClerk?.();
  const { getToken, isLoaded: authLoaded } = useAuth();
  const { isSignedIn, user, isLoaded: userLoaded } = useUser();

  // slinding active indicator
  const moveIndicator = useCallback(() => {
    const container = navInnerRef.current;
    const ind = indicatorRef.current;
    if (!container || !ind) return;

    const active = container.querySelector(".nav-item.active");
    if (!active) {
      ind.style.opacity = "0";
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();

    const left = activeRect.left - containerRect.left + container.scrollLeft;
    const width = activeRect.width;

    ind.style.transform = `translateX(${left}px)`;
    ind.style.width = `${width}px`;
    ind.style.opacity = "1";
  }, []);

  useLayoutEffect(() => {
    moveIndicator();
    const t = setTimeout(() => {
      moveIndicator();
    }, 120);
    return () => clearTimeout(t);
  }, [location.pathname, moveIndicator]);

  useEffect(() => {
    const container = navInnerRef.current;
    if (!container) return;

    const onScroll = () => {
      moveIndicator();
    };
    container.addEventListener("scroll", onScroll, { passive: true });

    const ro = new ResizeObserver(() => {
      moveIndicator();
    });
    ro.observe(container);
    if (container.parentElement) ro.observe(container.parentElement);

    window.addEventListener("resize", moveIndicator);

    moveIndicator();

    return () => {
      container.removeEventListener("scroll", onScroll);
      ro.disconnect();
      window.removeEventListener("resize", moveIndicator);
    };
  }, [moveIndicator]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    let mounted = true;

    const storeToken = async () => {
      if (!authLoaded || !userLoaded) return;

      if (!isSignedIn) {
        try {
          localStorage.removeItem("clear_token");
        } catch {}
        return;
      }

      try {
        if (getToken) {
          const token = await getToken();

          if (!mounted) return;

          if (token) {
            localStorage.setItem("clear_token", token);
          }
        }
      } catch (error) {
        console.error("Error getting token:", error);
      }
    };

    storeToken();

    return () => {
      mounted = false;
    };
  }, [isSignedIn, getToken, authLoaded, userLoaded]);

  // to open clerk sigin box
  const handleOpenSignIn = () => {
    if (!clerk || !clerk.openSignIn) {
      console.warn("clerk is not available");
      return;
    }
    clerk.openSignIn();
    navigate("/h");
  };

  // to sign out
  const handleSingnOut = async () => {
    if (!clerk || !clerk.signOut) {
      console.warn("clerk is not available");
      return;
    }
    try {
      await clerk.signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      try {
        localStorage.removeItem("clear_token");
      } catch {
        // igore any errors
      }
      navigate("/");
    }
  };

  return (
    <header className={ns.header}>
      <nav className={ns.navContainer}>
        <div className={ns.flexContainer}>
          <div className={ns.logoContainer}>
            <img src={logoImg} alt="Logo" className={ns.logoImage} />
            <Link to="/">
              <div className={ns.logoLink}>Medicare</div>
              <div className={ns.logoSubtext}> Heathcare Solutions</div>
            </Link>
          </div>
          {/* center Navigation */}
          <div className={ns.centerNavContainer}>
            <div className={ns.glowEffect}>
              <div className={ns.centerNavInner}>
                <div
                  ref={navInnerRef}
                  tabIndex={0}
                  className={ns.centerNavScrollContainer}
                  style={{
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  <CenterNavItem
                    to="/h"
                    label="Dashboard"
                    icon={<Home size={16} />}
                  />
                  <CenterNavItem
                    to="/add"
                    label="Add Doctor"
                    icon={<UserPlus size={16} />}
                  />
                  <CenterNavItem
                    to="/list"
                    label="List Doctors"
                    icon={<Users size={16} />}
                  />
                  <CenterNavItem
                    to="/appointments"
                    label="Appointments"
                    icon={<Calendar size={16} />}
                  />
                  <CenterNavItem
                    to="/service-dashboard"
                    label="Service Dashboard"
                    icon={<Grid size={16} />}
                  />
                  <CenterNavItem
                    to="/add-service"
                    label="Add Service"
                    icon={<PlusSquare size={16} />}
                  />
                  <CenterNavItem
                    to="/list-service"
                    label="List Services"
                    icon={<List size={16} />}
                  />
                  <CenterNavItem
                    to="/service-appointments"
                    label="Service Appointments"
                    icon={<Calendar size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Right-aligned Navigation */}

          <div className={ns.rightContainer}>
            {/* auth */}
            {isSignedIn ? (
              <button
                onClick={handleSingnOut}
                className={ns.signOutButton + " " + ns.cursorPointer}
              >
                Logout
              </button>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={handleOpenSignIn}
                  className={ns.loginButton + " " + ns.cursorPointer}
                >
                  Login
                </button>
              </div>
            )}

            {/* mobile toggle */}
            <button
              onClick={() => setOpen((v) => !v)}
              className={ns.mobileMenuButton}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
        {/* mobile navvigation menu */}

        {open && (
          <div className={ns.mobileOverlay} onClick={() => setOpen(false)} />
        )}
        {open && (
          <div className={ns.mobileMenuContainer} id="mobile-menu">
            <div className={ns.mobileMenuInner}>
                <MobileItem
                to="/h"
                label="Dashboard"
                icon={<Home size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/add"
                label="Add Doctor"
                icon={<UserPlus size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list"
                label="List Doctors"
                icon={<Users size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/appointments"
                label="Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />

              <MobileItem
                to="/service-dashboard"
                label="Service Dashboard"
                icon={<Grid size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/add-service"
                label="Add Service"
                icon={<PlusSquare size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/list-service"
                label="List Services"
                icon={<List size={16} />}
                onClick={() => setOpen(false)}
              />
              <MobileItem
                to="/service-appointments"
                label="Service Appointments"
                icon={<Calendar size={16} />}
                onClick={() => setOpen(false)}
              />
              <div className={ns.mobileAuthContainer}>
                {isSignedIn ? (
                  <button
                    onClick={() => {
                      handleSingnOut();
                      setOpen(false);
                    }}
                    className={ns.mobileSignOutButton}
                  >
                    Logout
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleOpenSignIn();
                      setOpen(false);
                    }}
                    className={ns.mobileLoginButton + " " + ns.cursorPointer}
                  >
                    Login
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </nav>
    </header>
  );
};

export default Navbar;

function CenterNavItem({ to, label, icon }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""} ${ns.centerNavItemBase} ${isActive ? ns.centerNavItemActive : ns.centerNavItemInactive}`
      }
    >
      <span>{icon}</span>
      <span className="font-medium">{label}</span>
    </NavLink>
  );
}

function MobileItem({ to, label, icon, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({isActive})=>`${ns.mobileItemBase} ${isActive ? ns.mobileItemActive : ns.mobileItemInactive}`}
      >
          {icon}
          <span className="font-medium text-sm">{label}</span>
      </NavLink>
)}
