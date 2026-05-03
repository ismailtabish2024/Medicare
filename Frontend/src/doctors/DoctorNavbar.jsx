import React, { useMemo, useState } from "react";
import { navbarStylesDr as n } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import { NavLink, useLocation, useParams } from "react-router-dom";
import { Calendar, Edit, Home, LogOut, Menu, X } from "lucide-react";

const DoctorNavbar = () => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const location = useLocation();

  const doctorId = useMemo(() => {
    if (params?.id) return params.id;
    const m = location.pathname.match(/\/doctor-admin\/([^/]+)/);
    if (m) return m[1];
    return null;
  }, [params, location.pathname]);

  const basePath = doctorId
    ? `/doctor-admin/${doctorId}`
    : "/doctor-admin/login";

  const navItems = [
    { name: "Dashboard", to: `${basePath}`, Icon: Home },
    { name: "Appointments", to: `${basePath}/appointments`, Icon: Calendar },
    { name: "Edit Profile", to: `${basePath}/profile/edit`, Icon: Edit },
  ];

  return (
    <>
      <nav className={n.navContainer}>
        <div className={n.leftBrand}>
          <div className={n.logoContainer}>
            <img src={logo} alt="logo" className={n.logoImage} />
          </div>

          <div className={n.brandTextContainer}>
            <div className={n.brandTitle}>MedTek</div>
            <div className={n.brandSubtitle}>Healthcare Solutions</div>
          </div>
        </div>

        {/* destop navigaton */}
        <div className={n.desktopMenu}>
          <div className={n.desktopMenuItems}>
            {navItems.map(({ name, to, Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === basePath}
                className={({ isActive }) =>
                  `${n.baseLink} ${isActive ? n.activeLink : n.inactiveLink}`
                }
                onClick={() => setOpen(false)}
              >
                <span className={n.linkContent}>
                  <Icon size={16} className={n.linkIcon} />
                  <span className={n.linkText}>{name}</span>
                </span>
              </NavLink>
            ))}
          </div>
        </div>

        <div className={n.rightActions}>
          <button
            onClick={() => {
              window.location.href = "/doctor-admin/login";
            }}
            className={n.logoutButtonDesktop}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          {/* to togle */}
          <button
            onClick={() => setOpen((s) => !s)}
            className={n.hamburgerButtonMd}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>

          <button
            onClick={() => setOpen((s) => !s)}
            className={n.hamburgerButtonLg}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <div className={n.mobileMenuContainer(open)}>
        <div className={n.mobileMenuContent}>
          {navItems.map(({ name, to, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === basePath}
              className={({ isActive }) =>
                `${n.mobileBaseLink} ${isActive ? n.mobileActiveLink : n.mobileInactiveLink}`
              }
              onClick={() => setOpen(false)}
            >
              <Icon size={18} className="text-emerald-400" />
              <span>{name}</span>
            </NavLink>
          ))}

          <button
            onClick={() => {
              window.location.href = "/doctor-admin/login";
            }}
            className={n.mobileLogoutButton}
          >
            <div className={n.mobileLogoutContent}>
              <LogOut size={16} />
              Logout
            </div>
          </button>
        </div>
      </div>

      <div className={n.spacer}></div>
    </>
  );
};

export default DoctorNavbar;
