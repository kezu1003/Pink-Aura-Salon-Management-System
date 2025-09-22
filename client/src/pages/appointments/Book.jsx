import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { makePackagesApi } from "../../api/packages";
import SlotGrid from "../../components/appointments/SlotGrid";
import Calendar from "../../components/appointments/Calendar";
import { useNavigate, useSearchParams } from "react-router-dom";

/* ✅ Added */
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

export default function Book() {
  const { backendUrl, userData } = useContext(AppContext);
  const apptApi = useMemo(() => makeApi(backendUrl), [backendUrl]);
  const packagesApi = useMemo(() => makePackagesApi(backendUrl), [backendUrl]);

  const [services, setServices] = useState([]);
  const [packages, setPackages] = useState([]);
  const [selectionKey, setSelectionKey] = useState("");
  const [serviceId, setServiceId] = useState("");

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  // Package-awareness
  const [searchParams] = useSearchParams();
  const packageFromQuery = searchParams.get("package");
  const [pkg, setPkg] = useState(null);
  const [pkgServiceIds, setPkgServiceIds] = useState([]);

  const navigate = useNavigate();

  // Load services and packages once
  useEffect(() => {
    (async () => {
      try {
        const [{ data: sData }, pList] = await Promise.all([
          axios.get(`${backendUrl}/api/services?activeOnly=true`),
          packagesApi.list({ activeOnly: "true", includeArchived: "false", limit: 100 }),
        ]);

        const list = sData?.services || [];
        setServices(list);

        if (pList?.success) setPackages(pList.packages || []);

        if (list.length && !selectionKey) {
          setServiceId(list[0]._id);
          setSelectionKey(`svc:${list[0]._id}`);
        }
      } catch (e) {
        toast.error(e?.response?.data?.message || e.message || "Failed to load data");
      }
    })();
  }, [backendUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    (async () => {
      if (!packageFromQuery) {
        setPkg(null);
        setPkgServiceIds([]);
        return;
      }
      const { success, package: p, message } = await packagesApi.get(packageFromQuery);
      if (!success || !p) {
        toast.error(message || "Failed to load package");
        setPkg(null);
        setPkgServiceIds([]);
        return;
      }
      setPkg(p);

      const nameSet = new Set((p.servicesIncluded || []).map((s) => String(s).trim().toLowerCase()));
      const matched = (services || [])
        .filter((sv) => nameSet.has(String(sv.name).trim().toLowerCase()))
        .map((sv) => sv._id);

      setPkgServiceIds(matched);

      // Set dropdown to package
      setSelectionKey(`pkg:${p._id}`);
      if (matched.length > 0) setServiceId(matched[0]);
    })();
  }, [packageFromQuery, services]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load slots whenever service/date changes
  useEffect(() => {
    if (!serviceId || !date) return;
    setLoading(true);
    apptApi
      .slots({ serviceId, date })
      .then(({ success, slots, message }) => {
        if (!success) {
          toast.error(message || "Failed to load slots");
          setSlots([]);
          return;
        }
        setSlots(slots || []);
        setPicked(null);
      })
      .finally(() => setLoading(false));
  }, [serviceId, date, apptApi]);

  // Handle dropdown selection (supports services & packages)
  const onSelectChange = async (e) => {
    const v = e.target.value;
    setSelectionKey(v);

    if (v.startsWith("svc:")) {
      const id = v.slice(4);
      setPkg(null);
      setPkgServiceIds([]);
      setServiceId(id);
      return;
    }

    if (v.startsWith("pkg:")) {
      const id = v.slice(4);

      let p = packages.find((pp) => pp._id === id);
      if (!p) {
        const { success, package: one } = await packagesApi.get(id);
        if (!success || !one) {
          toast.error("Failed to load selected package");
          return;
        }
        p = one;
      }
      setPkg(p);

      const nameSet = new Set((p.servicesIncluded || []).map((s) => String(s).trim().toLowerCase()));
      const matched = (services || [])
        .filter((sv) => nameSet.has(String(sv.name).trim().toLowerCase()))
        .map((sv) => sv._id);

      setPkgServiceIds(matched);
      if (matched.length > 0) setServiceId(matched[0]);
    }
  };

  const onConfirm = async () => {
    if (!userData) {
      toast.info("Please login to book an appointment.");
      return navigate("/login");
    }
    if (!picked) return toast.info("Pick a time");

    const finalServiceIds = pkg && pkgServiceIds.length > 0 ? pkgServiceIds : [serviceId];

    const body = {
      serviceIds: finalServiceIds,
      date,
      start: picked.start,
      paymentMode: "online",
      notes: pkg ? `Booked package: ${pkg.name}` : "",
    };

    const { success, message } = await apptApi.create(body);
    if (!success) return toast.error(message || "Failed to create appointment");

    toast.success("Appointment created. Complete payment to confirm.");
    navigate("/appointments/mine");
  };

  const hideServicePicker = !!packageFromQuery && !!pkg && pkgServiceIds.length > 0;

  const PackageBanner = () =>
    !pkg ? null : (
      <div className="mb-4 p-4 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-gray-500">Selected Package</div>
            <div className="text-lg font-semibold">{pkg.name}</div>
            <div className="text-sm text-gray-600">
              {pkg.category} • ~ {pkg.estimatedTimeMins || 60} mins
            </div>
            {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
              <div className="text-xs text-gray-500 mt-1">
                Includes: {pkg.servicesIncluded.join(", ")}
              </div>
            )}
          </div>
          <div className="text-right">
            {pkg.discountPrice != null && Number(pkg.discountPrice) < Number(pkg.price) ? (
              <div className="text-base">
                <span className="font-semibold">
                  Rs.{pkg.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
                </span>{" "}
                <span className="line-through text-gray-500">
                  Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
                </span>
              </div>
            ) : (
              <div className="text-base font-semibold">
                Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
              </div>
            )}
            {pkg?.seasonalOffer?.enabled && (
              <div className="mt-1 inline-block text-xs px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                {pkg.seasonalOffer?.label || "Offer"}
              </div>
            )}
          </div>
        </div>

        {pkgServiceIds.length > 0 && (
          <div className="mt-3 text-xs text-gray-500">
            Slots are shown based on the first service in this package; the appointment will include all items.
          </div>
        )}
      </div>
    );

  const OptionLabelForPackage = (p) => {
    const price =
      p.discountPrice != null && Number(p.discountPrice) < Number(p.price)
        ? `Rs.${p.discountPrice?.toLocaleString?.() ?? p.discountPrice} (was Rs.${p.price?.toLocaleString?.() ?? p.price})`
        : `Rs.${p.price?.toLocaleString?.() ?? p.price}`;
    const mins = p.estimatedTimeMins || 60;
    return `Package: ${p.name} — ${price} • ~${mins} mins`;
  };

  return (
    <div className="bg-[#FEF4F1] min-h-screen">
      
      <Navbar />
      <div className="h-20" />

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-10">
          Book Your Appointment
        </h1>

        <PackageBanner />

        {/* Combined selector (Services + Packages) */}
        {!hideServicePicker && (services.length > 0 || packages.length > 0) && (
          <div className="max-w-2xl mx-auto mb-6">
            <label className="block text-sm font-medium mb-1">
              Select Service or Package
            </label>
            <select
              value={selectionKey}
              onChange={onSelectChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-pink-400"
            >
              {/* Packages first */}
              {packages.length > 0 && (
                <optgroup label="Packages">
                  {packages.map((p) => (
                    <option key={p._id} value={`pkg:${p._id}`}>
                      {OptionLabelForPackage(p)}
                    </option>
                  ))}
                </optgroup>
              )}

              {/* Individual services */}
              {services.length > 0 && (
                <optgroup label="Services">
                  {services.map((s) => (
                    <option key={s._id} value={`svc:${s._id}`}>
                      {s.name} — Rs.{s.price} • {s.durationMins} mins
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: calendar */}
          <Calendar value={date} onChange={setDate} />

          {/* Right: time slots */}
          <div className="p-6 bg-white rounded-2xl shadow border">
            <div className="font-semibold mb-3">Select your time</div>
            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : (
              <SlotGrid slots={slots} selected={picked?.start} onSelect={setPicked} />
            )}
          </div>
        </div>

        <div className="mt-10 flex justify-end">
          <button
            onClick={onConfirm}
            disabled={!picked || (!pkg && !serviceId)}
            className={`px-8 py-3 text-base font-medium rounded-full transition ${
              picked
                ? "bg-pink-600 text-white hover:bg-pink-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm & Continue
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-3">
          Appointment status will show <b>Pending</b> until payment is completed.
        </p>
      </div>

      
      <Footer />
    </div>
  );
}
