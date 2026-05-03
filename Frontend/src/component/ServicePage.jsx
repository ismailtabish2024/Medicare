import React, { useEffect, useState } from "react";
import {
  servicePageStyles as s,
  serviceCardStyles as c,
} from "../assets/dummyStyles";
import { ChevronsRight, MousePointer2Off } from "lucide-react";
import { Link } from "react-router-dom";

const PlaceholderImg = "/placeholder-service.jpg";

const ServiceCard = ({ service }) => {
  const hasSrcSet =
    !!service.imageSrcSet ||
    (!!service.imageSmall && !!service.imageMedium && !!service.imageLarge);

  const src = service.imageUrl || service.image || service.imageSmall || "";
  const srcSet =
    service.imageSrcSet ||
    (service.imageSmall || service.image
      ? `${service.imageSmall || src} 480w, ${
          service.imageMedium || src
        } 768w, ${service.imageLarge || src} 1200w`
      : null);

  const name = service.name || "Service";
  const shortDescription = service.shortDescription || service.about || "";

  return (
    <div className={c.card}>
      <div className={c.imageContainer} aria-hidden="true">
        {hasSrcSet ? (
          <picture className={c.picture}>
            {service.imageWebp && (
              <source srcSet={service.imageWebp} type="image/webp" />
            )}
            {service.imageSrcSet ? (
              <img
                src={src || PlaceholderImg}
                srcSet={service.imageSrcSet}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                alt={name}
                loading="lazy"
                decoding="async"
                className={c.responsiveImage}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PlaceholderImg;
                }}
              />
            ) : (
              <img
                src={src || PlaceholderImg}
                srcSet={srcSet || undefined}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                alt={name}
                loading="lazy"
                decoding="async"
                className={c.responsiveImage}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = PlaceholderImg;
                }}
              />
            )}
          </picture>
        ) : (
          <img
            src={src || PlaceholderImg}
            alt={name}
            loading="lazy"
            decoding="async"
            className={c.fallbackImage}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = PlaceholderImg;
            }}
          />
        )}
      </div>

      <div className={c.content}>
        <h3 className={c.serviceName}>{name}</h3>

        <div className={c.buttonContainer}>
          {service.available ? (
            <Link
              to={`/services/${service.id}`}
              state={{ service: service.raw || service }}
              className={c.buttonAvailable}
              aria-label={`Book ${name}`}
            >
              <ChevronsRight className="w-5 h-5" aria-hidden="true" />
              Book Now
            </Link>
          ) : (
            <button
              disabled
              className={c.buttonUnavailable}
              aria-label={`${name} not available`}
            >
              <MousePointer2Off className="w-5 h-5" aria-hidden="true" />
              Not Available
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ServicePage = ({ previewCount = 9999 } = {}) => {
  const API_BASE = "http://localhost:4000";
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadServices() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/services`);
      const json = await res.json().catch(() => null);

      if (!res.ok) {
        const msg =
          (json && json.message) || `Failed to load services (${res.status})`;
        setError(msg);
        setServices([]);
        setLoading(false);
        return;
      }

      const items = (json && (json.data || json)) || [];
      const normalized = (Array.isArray(items) ? items : []).map((s) => {
        const id = s._id || s.id;
        const image = s.imageUrl || s.image || s.imageSmall || "";
        const available =
          typeof s.available === "boolean"
            ? s.available
            : typeof s.availability === "string"
              ? s.availability.toLowerCase() === "available"
              : s.availability === "Available" || s.available === true;

        return {
          id,
          name: s.name || "Service",
          shortDescription: s.shortDescription || s.about || "",
          image,
          imageSmall: s.imageSmall || null,
          imageMedium: s.imageMedium || null,
          imageLarge: s.imageLarge || null,
          imageSrcSet: s.imageSrcSet || null,
          imageWebp: s.imageWebp || null,
          price: s.price ?? s.fee ?? 0,
          available,
          raw: s,
        };
      });

      setServices(normalized);
    } catch (err) {
      console.error("load services error:", err);
      setError("Network error while loading services.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, [API_BASE]);

  const shown = services.slice(0, previewCount);
  return (
    <div className={s.pageContainer}>
      <div className={s.maxWidthContainer}>
        <header className={s.header}>
          <h1 className={s.title}>Our Diagnostic Services</h1>
          <p className={s.subtitle}>Safe, Accurate & reliable testing.</p>
        </header>
        {error && (
          <div className={s.errorContainer}>
            <div className={s.errorText}>{error}</div>
            <button 
            onClick={loadServices}
            className={s.retryButton}
            >
              Retry
              </button> 

          </div>
        )}

        {loading ? (
          <section className={s.skeletonGrid}>
            {Array.from({length:8}).map((_,i)=>(
              <div key={i} className={s.skeletonCard}>
                <div className={s.skeletonImage}></div>
                <div className={s.skeletonText1}></div>
                <div className={s.skeletonText2}></div>
                <div className={s.skeletonButton}></div>

              </div>
            ))}

          </section>
        )
      :(
        <section className={s.servicesGrid}>
          {shown.length > 0 ? (
            shown.map((s) => <ServiceCard key={s.id || s.name} service={s} />)
          ):(
            <div className={s.emptyState}>
                No Services Avilable
            </div>
          )}

        </section>
      )
      }
      </div>
    </div>
  );
};

export default ServicePage;
