import {
  Calendar,
  Clock,
  Phone,
  Ribbon,
  ShieldUser,
  Star,
  Stethoscope,
  Users,
} from "lucide-react";
import { bannerStyles as b, bannerStyles } from "../assets/dummyStyles";
import { useNavigate } from "react-router-dom";
import banner from "../assets/BannerImg.png"

const Banner = () => {
  const navigate = useNavigate();
  return (
    <div className={b.bannerContainer}>
      <div className={b.mainContainer}>
        <div className={b.borderOutline}>
          <div className={b.outerAnimatedBand}></div>
          <div className={b.innerWhiteBorder}></div>
        </div>
        <div className={b.contentContainer}>
          <div className={b.flexContainer}>
            <div className={b.leftContent}>
              <div className={b.headerBadgeContainer}>
                <div className={b.stethoscopeContainer}>
                  <div className={b.stethoscopeInner}>
                    <Stethoscope className={b.stethoscopeIcon} />
                  </div>
                </div>
                <div className={b.titleContainer}>
                  <h1 className={b.title}>
                    Medi
                    <span className={b.titleGradient}>Care+</span>
                  </h1>

                  {/* Stars */}
                  <div className={b.starsContainer}>
                    <div className={b.starsInner}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star className={b.starIcon} key={star} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* tagline  */}

              <p className={b.tagline}>
                Premium Healthcare
                <span className={`block ${bannerStyles.taglineHighlight}`}>
                  At Your Fingertips
                </span>
              </p>
              <div className={b.featuresGrid}>
                <div className={`${b.featureItem} ${b.featureBorderGreen}`}>
                  <Ribbon className={b.featureIcon} />
                  <span className={b.featureText}>Certified Specialists</span>
                </div>

                <div className={`${b.featureItem} ${b.featureBorderBlue}`}>
                  <Clock className={b.featureIcon} />
                  <span className={b.featureText}>24/7 Availability</span>
                </div>

                <div className={`${b.featureItem} ${b.featureBorderEmerald}`}>
                  <ShieldUser className={b.featureIcon} />
                  <span className={b.featureText}>Safe &amp; Secure </span>
                </div>

                <div className={`${b.featureItem} ${b.featureBorderPurple}`}>
                  <Users className={b.featureIcon} />
                  <span className={b.featureText}>500+ Doctors</span>
                </div>
              </div>

              <div className={b.ctaButtonsContainer}>
                <button
                  onClick={() => navigate("/doctors")}
                  className={b.bookButton}
                >
                  <div className={b.bookButtonOverlay}></div>
                  <div className={b.bookButtonContent}>
                    <Calendar className={b.bookButtonIcon} />
                    <span>Book Appointment Now</span>
                  </div>
                </button>

                <button
                  onClick={() => (window.location.href = "tel:9179800430")}
                  className={b.emergencyButton}
                >
                  <div className={b.emergencyButtonContent}>
                    <Phone className={b.emergencyButtonIcon} />
                    <span>Emergency Call</span>
                  </div>
                </button>
              </div>
            </div>
            <div className={b.rightImageSection}>
                <div className={b.imageContainer}>
                      <div className={b.imageFrame}>
                        <img src={banner} alt="banner" className={b.image} />
                      </div>
                </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
