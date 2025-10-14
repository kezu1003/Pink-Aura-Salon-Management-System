import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-pink-200 bg-pink-50 p-4">
      <div className="text-xs text-black/60">{label}</div>
      <div className="text-2xl font-semibold text-black">{value}</div>
    </div>
  );
}

export default function AppointmentReports() {
  const { backendUrl } = useContext(AppContext);
  const [filters, setFilters] = useState({ from: "", to: "", staffId: "", serviceId: "" });
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [report, setReport] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const [st, sv] = await Promise.all([
          axios.get(`${backendUrl}/api/admin/staff`),
          axios.get(`${backendUrl}/api/services`),
        ]);
        setStaff(st.data.staff || []);
        setServices(sv.data.services || []);
      } catch {
       
      }
    })();
  }, [backendUrl]);

  async function load() {
    try {
      const qs = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([,v]) => v)));
      const { data } = await axios.get(`${backendUrl}/api/admin/appointment-reports/overview?` + qs.toString());
      if (!data.success) throw new Error(data.message || "Failed");
      setReport(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || e.message || "Failed to load report");
    }
  }

  useEffect(() => { load(); }, []); // initial

  function downloadCSV() {
    if (!report) return;
    const lines = [];
    const t = report.totals || {};
    lines.push("Totals");
    lines.push("Metric,Count");
    ["total","booked","confirmed","rescheduled","completed","cancelled"].forEach(k => lines.push(`${k},${t[k] || 0}`));
    lines.push("");

    lines.push("Top Services");
    lines.push("Service,Count");
    (report.topServices || []).forEach(s => lines.push(`${s.serviceName || s.serviceId},${s.count}`));
    lines.push("");

    lines.push("By Staff");
    lines.push("Staff,Total,Booked,Confirmed,Rescheduled,Completed,Cancelled,Top Services");
    (report.byStaff || []).forEach(s => {
      const st = s.statuses || {};
      const top = (s.services || []).slice().sort((a,b)=>b.count-a.count).slice(0,3)
        .map(x => `${x.serviceName || x.serviceId} (${x.count})`).join("; ");
      lines.push(`${s.staffName || s.staffId},${s.total || 0},${st.booked || 0},${st.confirmed || 0},${st.rescheduled || 0},${st.completed || 0},${st.cancelled || 0},${top}`);
    });
    lines.push("");

    lines.push("Peak Hours");
    lines.push("Hour,Count");
    (report.peak?.hours || []).forEach(h => lines.push(`${h.hour},${h.count}`));
    lines.push("");

    lines.push("Peak Days (1=Sun..7=Sat)");
    lines.push("Day,Count");
    (report.peak?.days || []).forEach(d => lines.push(`${d.day},${d.count}`));

    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "appointments_overview.csv";
    a.click();
    URL.revokeObjectURL(url);
  }


  const handleGenerateClientPDF = async () => {
    if (!report) {
      toast.error("No report data available to generate PDF");
      return;
    }
    
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up colors - matching enrollment report theme
      const headerColor = [251, 170, 153]; // #FBAA99 - Pink
      const darkColor = [77, 66, 58]; // #4D423A - Dark brown
      const lightPink = [254, 244, 241]; // #FEF4F1 - Light pink
      
      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      
      // Header Section
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, 0, pageWidth, 40, 'F');
      
      // Load and process logo image
      try {
        const logoImg = new Image();
        logoImg.crossOrigin = 'anonymous';
        
        const whiteLogoBase64 = await new Promise((resolve) => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
              if (data[i + 3] > 0) {
                data[i] = 255;     // Red
                data[i + 1] = 255; // Green
                data[i + 2] = 255; // Blue
              }
            }
            
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          };
          img.src = '/logo-removebg.png';
        });
        
        if (whiteLogoBase64) {
          doc.addImage(whiteLogoBase64, 'PNG', 10, 5, 30, 30);
        }
      } catch (error) {
        console.log('Logo loading failed, using text fallback:', error);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('Pink Aura', 20, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Beauty Salon', 20, 25);
      }
      
      // Add main title in center
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('Pink Aura', pageWidth / 2, 15, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Beauty Salon & Appointment Management', pageWidth / 2, 25, { align: 'center' });
      
      // Decorative circle on the right
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.circle(pageWidth - 20, 20, 8, 'F');
      
      // Separator line
      doc.setFillColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.rect(0, 40, pageWidth, 3, 'F');
      
      let yPosition = 60;
      
      // Report title
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Appointment Management Report', pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 20;
      
      // Date range
      if (report.range) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const fromStr = report.range.from ? new Date(report.range.from).toLocaleDateString() : 'All Time';
        const toStr = report.range.to ? new Date(report.range.to).toLocaleDateString() : 'Present';
        doc.text(`Report Period: ${fromStr} to ${toStr}`, pageWidth / 2, yPosition, { align: 'center' });
        yPosition += 15;
      }
      
      // Overview section
      doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
      doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'F');
      doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setLineWidth(1);
      doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'S');
      
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Overview Statistics', margin + 10, yPosition + 8);
      yPosition += 35;
      
      // Statistics grid
      const stats = [
        ['Total Appointments', report.totals.total || 0],
        ['Booked', report.totals.booked || 0],
        ['Confirmed', report.totals.confirmed || 0],
        ['Rescheduled', report.totals.rescheduled || 0],
        ['Completed', report.totals.completed || 0],
        ['Cancelled', report.totals.cancelled || 0]
      ];
      
      const colWidth = (pageWidth - (margin * 2) - 20) / 3;
      let col = 0;
      let row = 0;
      
      stats.forEach(([label, value], index) => {
        const x = margin + (col * (colWidth + 10));
        const y = yPosition + (row * 25);
        
        // Stat box
        doc.setFillColor(255, 255, 255);
        doc.rect(x, y, colWidth, 20, 'F');
        doc.setDrawColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.setLineWidth(1);
        doc.rect(x, y, colWidth, 20, 'S');
        
        // Value
        doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(value.toString(), x + 10, y + 8);
        
        // Label
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x + 10, y + 15);
        
        col++;
        if (col >= 3) {
          col = 0;
          row++;
        }
      });
      
      yPosition += (Math.ceil(stats.length / 3) * 25) + 20;
      
      // Top Services section
      if (report.topServices && report.topServices.length > 0) {
        doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'F');
        doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setLineWidth(1);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'S');
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Most Booked Services', margin + 10, yPosition + 8);
        yPosition += 35;
        
        // Services table
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        
        // Table header
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(margin, yPosition, pageWidth - (margin * 2), 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Service Name', margin + 5, yPosition + 10);
        doc.text('Bookings', pageWidth - margin - 30, yPosition + 10);
        yPosition += 15;
        
        // Table rows
        report.topServices.slice(0, 8).forEach((service, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
            doc.rect(margin, yPosition, pageWidth - (margin * 2), 12, 'F');
          }
          
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          doc.setFont('helvetica', 'normal');
          const serviceName = service.serviceName || service.serviceId || 'Unknown Service';
          doc.text(serviceName.length > 40 ? serviceName.substring(0, 40) + '...' : serviceName, margin + 5, yPosition + 8);
          doc.text(service.count.toString(), pageWidth - margin - 30, yPosition + 8);
          yPosition += 12;
        });
        
        yPosition += 10;
      }
      
      // Peak Hours and Days section
      if (report.peak) {
        doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'F');
        doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setLineWidth(1);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'S');
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Peak Hours & Days', margin + 10, yPosition + 8);
        yPosition += 35;
        
        const colWidthPeak = (pageWidth - (margin * 2) - 10) / 2;
        
        // Peak Hours
        if (report.peak.topHours && report.peak.topHours.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Peak Hours:', margin, yPosition);
          yPosition += 15;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          report.peak.topHours.forEach(hour => {
            doc.text(`${hour.hour}:00 - ${hour.count} appointments`, margin + 10, yPosition);
            yPosition += 12;
          });
        }
        
        yPosition += 10;
        
        // Peak Days
        if (report.peak.topDays && report.peak.topDays.length > 0) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.text('Peak Days:', margin, yPosition);
          yPosition += 15;
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          report.peak.topDays.forEach(day => {
            const dayName = dayNames[day.day % 7] || `Day ${day.day}`;
            doc.text(`${dayName} - ${day.count} appointments`, margin + 10, yPosition);
            yPosition += 12;
          });
        }
        
        yPosition += 20;
      }
      
      // Staff Performance section
      if (report.byStaff && report.byStaff.length > 0) {
        doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'F');
        doc.setDrawColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setLineWidth(1);
        doc.rect(margin, yPosition - 5, pageWidth - (margin * 2), 25, 'S');
        
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Staff Performance', margin + 10, yPosition + 8);
        yPosition += 35;
        
        // Staff table header
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
        
        doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
        doc.rect(margin, yPosition, pageWidth - (margin * 2), 12, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Staff Member', margin + 2, yPosition + 8);
        doc.text('Total', margin + 80, yPosition + 8);
        doc.text('Completed', margin + 110, yPosition + 8);
        doc.text('Pending', margin + 140, yPosition + 8);
        doc.text('Top Service', margin + 170, yPosition + 8);
        yPosition += 12;
        
        // Staff rows
        report.byStaff.slice(0, 10).forEach((staff, index) => {
          if (index % 2 === 0) {
            doc.setFillColor(lightPink[0], lightPink[1], lightPink[2]);
            doc.rect(margin, yPosition, pageWidth - (margin * 2), 10, 'F');
          }
          
          doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
          doc.setFont('helvetica', 'normal');
          const staffName = staff.staffName || staff.staffId || 'Unknown Staff';
          doc.text(staffName.length > 15 ? staffName.substring(0, 15) + '...' : staffName, margin + 2, yPosition + 7);
          doc.text((staff.total || 0).toString(), margin + 80, yPosition + 7);
          doc.text((staff.statuses?.completed || 0).toString(), margin + 110, yPosition + 7);
          doc.text((staff.statuses?.pending || 0).toString(), margin + 140, yPosition + 7);
          
          // Top service
          const topService = staff.services && staff.services.length > 0 
            ? staff.services.sort((a, b) => b.count - a.count)[0]
            : null;
          if (topService) {
            const serviceName = topService.serviceName || 'Unknown';
            doc.text(serviceName.length > 12 ? serviceName.substring(0, 12) + '...' : serviceName, margin + 170, yPosition + 7);
          } else {
            doc.text('N/A', margin + 170, yPosition + 7);
          }
          
          yPosition += 10;
        });
        
        yPosition += 20;
      }
      
      // Footer
      const footerY = pageHeight - 30;
      
      // Footer background (pink bar)
      doc.setFillColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.rect(0, footerY, pageWidth, 20, 'F');
      
      // Footer text in white
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleDateString()}, ${new Date().toLocaleTimeString()}`, margin, footerY + 8);
      doc.setFont('helvetica', 'italic');
      doc.text('Pink Aura Beauty Salon - Professional Appointment Management', pageWidth - margin, footerY + 8, { align: 'right' });
      
      // White strip for page number
      doc.setFillColor(255, 255, 255);
      doc.rect(0, footerY + 20, pageWidth, 10, 'F');
      
      // Page number in dark text
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Page 1 of 1', pageWidth / 2, pageHeight - 5, { align: 'center' });
      
      // Save the PDF
      const filename = `Pink-Aura-Appointment-Report-${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      toast.success("PDF report generated successfully!");
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error("Failed to generate PDF report");
    }
  };

  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Filters */}
      <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-lg font-semibold text-black">Appointment Reports</div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs text-black/60">From</label>
            <input type="date" className="rounded-xl border border-black/10 p-2"
                   value={filters.from} onChange={e=>setFilters({...filters, from:e.target.value})}/>
          </div>
          <div>
            <label className="block text-xs text-black/60">To</label>
            <input type="date" className="rounded-xl border border-black/10 p-2"
                   value={filters.to} onChange={e=>setFilters({...filters, to:e.target.value})}/>
          </div>
          <div>
            <label className="block text-xs text-black/60">Service</label>
            <select className="rounded-xl border border-black/10 p-2"
                    value={filters.serviceId} onChange={e=>setFilters({...filters, serviceId:e.target.value})}>
              <option value="">All</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-black/60">Staff</label>
            <select className="rounded-xl border border-black/10 p-2"
                    value={filters.staffId} onChange={e=>setFilters({...filters, staffId:e.target.value})}>
              <option value="">All</option>
              {staff.map(st => <option key={st._id} value={st._id}>{st.name}</option>)}
            </select>
          </div>
          <button className="rounded-xl bg-black px-4 py-2 text-white hover:opacity-90" onClick={load}>Generate</button>
          <button className="rounded-xl border border-black/10 px-4 py-2 text-black hover:bg-pink-50" onClick={downloadCSV}>Download CSV</button>
          <button className="rounded-xl border border-black/10 px-4 py-2 text-black hover:bg-pink-50" onClick={handleGenerateClientPDF}>Generate PDF Report</button>
        </div>
      </div>

      {!report ? (
        <div className="text-sm text-gray-500">No data yet.</div>
      ) : (
        <>
          {/* Totals */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <Stat label="Total"       value={report.totals.total} />
            <Stat label="Booked"      value={report.totals.booked} />
            <Stat label="Confirmed"   value={report.totals.confirmed} />
            <Stat label="Rescheduled" value={report.totals.rescheduled} />
            <Stat label="Completed"   value={report.totals.completed} />
            <Stat label="Cancelled"   value={report.totals.cancelled} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Services */}
            <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-medium text-black">Most-Booked Services</div>
              <table className="w-full text-sm">
                <thead className="text-black/60">
                  <tr><th className="p-2 text-left">Service</th><th className="p-2 text-left">Count</th></tr>
                </thead>
                <tbody>
                  {(report.topServices || []).map(s => (
                    <tr key={s.serviceId} className="border-t">
                      <td className="p-2">{s.serviceName || s.serviceId}</td>
                      <td className="p-2">{s.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Peaks */}
            <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
              <div className="mb-2 font-medium text-black">Peak Hours / Days</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="mb-1 text-xs text-black/60">Top Hours</div>
                  <ul className="list-disc pl-5">
                    {(report.peak?.topHours || []).map((h,i) => <li key={i}>{h.hour}:00 — {h.count}</li>)}
                  </ul>
                </div>
                <div>
                  <div className="mb-1 text-xs text-black/60">Top Days</div>
                  <ul className="list-disc pl-5">
                    {(report.peak?.topDays || []).map((d,i) => <li key={i}>{dayNames[d.day % 7]} — {d.count}</li>)}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* By Staff */}
          <div className="rounded-2xl border border-pink-200 bg-white p-4 shadow-sm">
            <div className="mb-2 font-medium text-black">Appointments by Staff</div>
            <table className="w-full text-sm">
              <thead className="text-black/60">
                <tr>
                  <th className="p-2 text-left">Staff</th>
                  <th className="p-2 text-left">Total</th>
                  <th className="p-2 text-left">Booked</th>
                  <th className="p-2 text-left">Confirmed</th>
                  <th className="p-2 text-left">Rescheduled</th>
                  <th className="p-2 text-left">Completed</th>
                  <th className="p-2 text-left">Cancelled</th>
                  <th className="p-2 text-left">Top Services</th>
                </tr>
              </thead>
              <tbody>
                {(report.byStaff || []).map((s) => {
                  const st = s.statuses || {};
                  const top = (s.services || []).slice().sort((a,b)=>b.count-a.count).slice(0,3)
                    .map(x => `${x.serviceName || x.serviceId} (${x.count})`).join(", ");
                  return (
                    <tr key={s.staffId} className="border-t">
                      <td className="p-2">{s.staffName || s.staffId}</td>
                      <td className="p-2">{s.total || 0}</td>
                      <td className="p-2">{st.booked || 0}</td>
                      <td className="p-2">{st.confirmed || 0}</td>
                      <td className="p-2">{st.rescheduled || 0}</td>
                      <td className="p-2">{st.completed || 0}</td>
                      <td className="p-2">{st.cancelled || 0}</td>
                      <td className="p-2">{top || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
