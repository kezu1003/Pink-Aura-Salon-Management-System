import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../../context/AppContext";
import { makeApi } from "../../api/appointments";
import { makePackagesApi } from "../../api/packages";
import SlotGrid from "../../components/appointments/SlotGrid";
import Calendar from "../../components/appointments/Calendar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";

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

  const [date, setDate] = useState(() => format(new Date(), "yyyy-MM-dd"));
  const [slots, setSlots] = useState([]);
  const [picked, setPicked] = useState(null);
  const [loading, setLoading] = useState(false);

  // Packages
  const [searchParams] = useSearchParams();
  const packageFromQuery = searchParams.get("package");
  const [pkg, setPkg] = useState(null);
  const [pkgServiceIds, setPkgServiceIds] = useState([]);

  const navigate = useNavigate();


  // Load services and packages 
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
  }, [backendUrl]); 

  // Handle package query 
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

      setSelectionKey(`pkg:${p._id}`);
      if (matched.length > 0) setServiceId(matched[0]);
    })();
  }, [packageFromQuery, services]); 


  // Load slots whenever service/date changes
  useEffect(() => {
    if (!serviceId || !date) return;

    // date and today compared as yyyy-MM-dd strings (local)
    const today = format(new Date(), "yyyy-MM-dd");
    if (date < today) {
      setSlots([]);
      setPicked(null);
      toast.info("Cannot book past dates.");
      return;
    }

    setLoading(true);
    apptApi
      .slots({ serviceId, date })
      .then(({ success, slots, message }) => {
        if (!success) {
          toast.error(message || "Failed to load slots");
          setSlots([]);
          return;
        }
        // mark booked slots as disabled 
        const availableSlots = (slots || []).map((slot) => ({
          ...slot,
          disabled: slot.booked || false,
        }));


        // create extra static slots from 9:00 AM to 11:59 AM
        const today = new Date(date);
        const extraSlots = [
          { start: new Date(today.setHours(9, 0, 0, 0)), end: new Date(today.setHours(9, 30, 0, 0)) },
          { start: new Date(today.setHours(9, 30, 0, 0)), end: new Date(today.setHours(10, 0, 0, 0)) },
          { start: new Date(today.setHours(10, 0, 0, 0)), end: new Date(today.setHours(10, 30, 0, 0)) },
          { start: new Date(today.setHours(10, 30, 0, 0)), end: new Date(today.setHours(11, 0, 0, 0)) },
          { start: new Date(today.setHours(11, 0, 0, 0)), end: new Date(today.setHours(11, 30, 0, 0)) },
          { start: new Date(today.setHours(11, 30, 0, 0)), end: new Date(today.setHours(11, 59, 0, 0)) },
        ];

        // merge backend + extra and sort by time
        const combined = [...availableSlots, ...extraSlots].sort(
          (a, b) => new Date(a.start) - new Date(b.start)
        );

        setSlots(combined);
        setPicked(null);
      })
      .catch((err) => {
        toast.error(err?.message || "Failed to load slots");
        setSlots([]);
      })
      .finally(() => setLoading(false));
  }, [serviceId, date, apptApi]);

  //  dropdown selection (services/packages)
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

    // create appointment 
    const { success, appointment, message } = await apptApi.create(body);
  
    if (!success) {
      return toast.error(message || "Failed to create appointment");
    }

    // success toast
    toast.success("Appointment created. Complete payment to confirm.");

    const apptId = (appointment && appointment._id) || (appointment && appointment.id) || null;

    if (apptId) {
      navigate(`/appointments/mine`);
    } else {
      navigate(`/appointments/mine`);
    }
  };

  const hideServicePicker = !!packageFromQuery && !!pkg && pkgServiceIds.length > 0;

  // Package banner
  
  const PackageBanner = () =>
    !pkg ? null : (
      <div className="mb-4 p-4 rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm text-[#4D423A]/70">Selected Package</div>
            <div className="text-lg font-semibold text-[#4D423A]">{pkg.name}</div>
            <div className="text-sm text-[#4D423A]/70">
              {pkg.category} • ~ {pkg.estimatedTimeMins || 60} mins
            </div>
            {Array.isArray(pkg.servicesIncluded) && pkg.servicesIncluded.length > 0 && (
              <div className="text-xs text-[#4D423A]/50 mt-1">
                Includes: {pkg.servicesIncluded.join(", ")}
              </div>
            )}
          </div>
          <div className="text-right">
            {pkg.discountPrice != null && Number(pkg.discountPrice) < Number(pkg.price) ? (
              <div className="text-base">
                <span className="font-semibold text-[#FBAA99]">
                  Rs.{pkg.discountPrice?.toLocaleString?.() ?? pkg.discountPrice}
                </span>{" "}
                <span className="line-through text-[#4D423A]/50">
                  Rs.{pkg.price?.toLocaleString?.() ?? pkg.price}
                </span>
              </div>
            ) : (
              <div className="text-base font-semibold text-[#FBAA99]">
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
          <div className="mt-3 text-xs text-[#4D423A]/50">
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
    <div
      className="bg-[#FEF4F1] min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/book01.jpg')" }}
    >
      <Navbar />
      {/* Increased spacing between Navbar and heading */}
      <div className="h-32 md:h-40" />

      <div className="max-w-6xl mx-auto px-4 pb-16">
        <h1 className="text-3xl md:text-4xl font-serif text-center mb-10 text-[#4D423A]">
          Book Your Appointment
        </h1>

        <PackageBanner />

        {!hideServicePicker && (services.length > 0 || packages.length > 0) && (
          <div className="max-w-2xl mx-auto mb-6">
            <label className="block text-sm font-medium mb-1 text-[#4D423A]">
              Select Service or Package
            </label>
            <select
              value={selectionKey}
              onChange={onSelectChange}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#FBAA99]"
            >
              {packages.length > 0 && (
                <optgroup label="Packages">
                  {packages.map((p) => (
                    <option key={p._id} value={`pkg:${p._id}`}>
                      {OptionLabelForPackage(p)}
                    </option>
                  ))}
                </optgroup>
              )}
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
         
          <Calendar value={date} onChange={(val) => {
            
            if (!val) return;
            
            if (typeof val === "string") {
              
              try {
                const parsed = new Date(val);
                // if parsed is invalid, back to original
                if (!isNaN(parsed.getTime())) {
                  setDate(format(parsed, "yyyy-MM-dd"));
                } else {
                  // assume yyyy-mm-dd
                  setDate(val.slice(0, 10));
                }
              } catch {
                setDate(val.slice(0, 10));
              }
            } else if (val instanceof Date) {
              setDate(format(val, "yyyy-MM-dd"));
            } else {
              // fallback
              setDate(String(val).slice(0, 10));
            }
          }} minDate={new Date()} />

          <div className="p-6 bg-white rounded-2xl shadow border">
            <div className="text-xl font-serif font-semibold mb-4 text-center text-[#4D423A]">
                PICK A SLOT
            </div>

            {loading ? (
              <div className="text-sm text-gray-500">Loading…</div>
            ) : (
              // keep SlotGrid usage identical
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
                ? "bg-[#FBAA99] text-white hover:bg-[#F68B78]"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Confirm & Continue
          </button>
        </div>

        <p className="text-xs text-[#4D423A]/70 mt-3">
          Appointment status will show <b>Pending</b> until payment is completed.
        </p>
      </div>

      <Footer />
    </div>
  );
}
