import React from "react";
import { footerStyles as f } from "../assets/dummyStyles";
import logo from "../assets/logo.png";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";
import {
  Stethoscope,
  Activity,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Send,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Doctors", href: "/doctors" },
    { name: "Services", href: "/services" },
    { name: "Contact", href: "/contact" },
    { name: "Appointments", href: "/appointments" },
  ];
  const services = [
    { name: "Blood Pressure Check", href: "/services" },
    { name: "Blood Sugar Test", href: "/services" },
    { name: "Full Blood Count", href: "/services" },
    { name: "X-Ray Scan", href: "/services" },
    { name: "Blood Sugar Test", href: "/services" },
  ];

  const socialLinks = [
    {
      Icon: FaFacebook,
      color: f.facebookColor,
      name: "Facebook",
      href: "https://www.facebook.com/people/Hexagon-Digital-Services/61567156598660/",
    },
    {
      Icon: FaTwitter,
      color: f.twitterColor,
      name: "Twitter",
      href: "https://twitter.com/hexagondigitalservices",
    },
    {
      Icon: FaInstagram,
      color: f.instagramColor,
      name: "Instagram",
      href: "http://instagram.com/hexagondigitalservices?igsh=MWp2NG1oNTlibWVnZA%3D%3D",
    },
    {
      Icon: FaLinkedin,
      color: f.linkedinColor,
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/hexagondigtial-services/",
    },
    {
      Icon: FaYoutube,
      color: f.youtubeColor,
      name: "YouTube",
      href: "https://youtube.com/@hexagondigitalservices?si=lxEFYNCP42t6AoDJ",
    },
  ];
  return (
    <footer className={f.footerContainer}>
      <div className={f.floatingIcon1}>
        <Stethoscope />
      </div>
      <div
        className={f.floatingIcon2}
        style={{
          animationDelay: "3s",
        }}
      >
        <Activity className={f.activityIcon} />
      </div>

      <div className={f.mainContent}>
        <div className={f.gridContainer}>
          <div className={f.companySection}>
            <div className={f.logoContainer}>
              <div className={f.logoWrapper}>
                <div className={f.logoImageContainer}>
                  <img src={logo} alt="logo" className={f.logoImage} />
                </div>
              </div>

              <div>
                <h2 className={f.companyName}>Medicare</h2>
                <p className={f.companyTagline}>Healthcare Solutions</p>
              </div>
            </div>
            <p className={f.companyDescription}>
              Your trusted partner in healthcare innovation. We're committed to
              providing exceptional medical care with cutting-edge technology
              and compassionate service.
            </p>
            <div className={f.contactContainer}>
              <div className={f.contactItem}>
                <div className={f.contactIconWrapper}>
                  <Phone className={f.contactIcon} />
                </div>
                <span className={f.contactText}>+91 9179800430</span>
              </div>

              <div className={f.contactItem}>
                <div className={f.contactIconWrapper}>
                  <Mail className={f.contactIcon} />
                </div>
                <span className={f.contactText}>ismailtabish17@gmail.com</span>
              </div>

              <div className={f.contactItem}>
                <div className={f.contactIconWrapper}>
                  <MapPin className={f.contactIcon} />
                </div>
                <span className={f.contactText}>Mumbai, India</span>
              </div>
            </div>
          </div>
          {/* quick links */}

          <div className={f.linksSection}>
            <h3 className={f.sectionTitle}>Quick Links</h3>
            <ul className={f.linksList}>
              {quickLinks.map((link, index) => (
                <li key={link.name} className={f.linkItem}>
                  <a
                    href={link.href}
                    className={f.quickLink}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <div className={f.quickLinkIconWrapper}>
                      <ArrowRight className={f.quickLinkIcon} />
                    </div>
                    <span>{link.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className={f.linksSection}>
            <h3 className={f.sectionTitle}>Our Service </h3>
            <ul className={f.linksList}>
              {services.map((service, index) => (
                <li key={service.name}>
                  <a href={service.href} className={f.serviceLink}>
                    <div className={f.serviceIcon}></div>
                    <span>{service.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter & Social */}
          <div className={f.newsletterSection}>
            <h3 className={f.newsletterTitle}>Stay Connected</h3>
            <p className={f.newsletterDescription}>
              Subscribe for health tips, medical updates, and wellness insights
              delivered to your inbox.
            </p>

            {/* Newsletter form */}
            <div className={f.newsletterForm}>
              <div className={f.mobileNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={f.emailInput}
                />
                <button className={f.mobileSubscribeButton}>
                  <Send className={f.mobileButtonIcon} />
                  Subscribe
                </button>
              </div>

              {/* Desktop newsletter */}
              <div className={f.desktopNewsletterContainer}>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className={f.desktopEmailInput}
                />
                <button className={f.desktopSubscribeButton}>
                  <Send className={f.desktopButtonIcon} />
                  <span className={f.desktopButtonText}>Subscribe</span>
                </button>
              </div>

              {/* Social icons */}
              <div className={f.socialContainer}>
                {socialLinks.map(({ Icon, color, name, href }, index) => (
                  <a
                    key={name}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={f.socialLink}
                    style={{ animationDelay: `${index * 120}ms` }}
                  >
                    <div className={f.socialIconBackground} />
                    <Icon className={`${f.socialIcon} ${color}`} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className={f.bottomSection}>
          <div className={f.copyright}>
            <span>&copy;{currentYear} Medicare Healthcare</span>
          </div>

          <div className={f.designerText}>
                <span>Designed By</span>
                <a href="https://www.hexagondigitalservices.com/" target="_blank" className={f.designerLink}>
                Hexagon Digital Services
                </a>
          </div>
        </div>
      </div>
      <style>{f.animationStyles}</style>
    </footer>
  );
};

export default Footer;
