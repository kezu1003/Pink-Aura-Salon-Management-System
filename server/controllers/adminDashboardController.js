import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, parseISO } from 'date-fns';
import PDFDocument from 'pdfkit';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import User from '../models/userModel.js';
import StaffTimeOff from '../models/StaffTimeOff.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';

//  calculate expiry days left
function computeExpiryDaysLeft(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const diffMs = new Date(expiryDate).getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

//  validate and  date range
function parseDateRange(req, defaultStart, defaultEnd) {
  const { startDate, endDate } = req.query;
  return {
    start: startDate ? parseISO(startDate) : defaultStart,
    end: endDate ? parseISO(endDate) : defaultEnd,
  };
}

// Get appointments for a date range
export const getAppointmentsToday = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, startOfDay(new Date()), endOfDay(new Date()));
    const count = await Appointment.countDocuments({
      startTime: { $gte: start, $lte: end },
      status: { $in: ['pending', 'confirmed', 'completed'] },
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get revenue for a date range 
export const getRevenueMonthly = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, startOfMonth(new Date()), endOfMonth(new Date()));

    // Appointment revenue
    const appointments = await Appointment.find({
      startTime: { $gte: start, $lte: end },
      paymentStatus: 'paid',
    }).populate('services');
    const appointmentRevenue = appointments.reduce((sum, appt) => {
      const serviceTotal = appt.services.reduce((s, service) => s + (service.price || 0), 0);
      return sum + serviceTotal;
    }, 0);

    // Order revenue
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
      status: { $in: ['placed', 'processing', 'shipped', 'delivered'] },
    });
    const orderRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    const total = appointmentRevenue + orderRevenue;
    res.json({ success: true, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active clients 
export const getActiveClients = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, subDays(new Date(), 30), new Date());
    const [appointmentClients, orderClients] = await Promise.all([
      Appointment.distinct('customer', { startTime: { $gte: start, $lte: end } }),
      Order.distinct('user', { createdAt: { $gte: start, $lte: end } }),
    ]);
    const uniqueClients = [...new Set([...appointmentClients, ...orderClients])];
    res.json({ success: true, count: uniqueClients.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff utilization 
export const getStaffUtilization = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, startOfDay(new Date()), endOfDay(new Date()));
    const staff = await User.find({ role: 'staff', status: 'active' });
    const totalHours = staff.length * 7; 
    const bookedHours = await Appointment.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end },
          status: { $in: ['pending', 'confirmed'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 1000 * 60 * 60] } },
        },
      },
    ]);
    const utilization = totalHours > 0 ? ((bookedHours[0]?.total || 0) / totalHours) * 100 : 0;
    res.json({ success: true, utilization: Math.round(utilization) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get inventory alerts 
export const getInventoryAlerts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    const count = products.filter(
      (p) => p.stock < 10 || (computeExpiryDaysLeft(p.expiryDate) !== null && computeExpiryDaysLeft(p.expiryDate) < 30)
    ).length;
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer satisfaction (default: last 30 days)
export const getCustomerSatisfaction = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, subDays(new Date(), 30), new Date());
    const result = await Review.aggregate([
      { $match: { createdAt: { $gte: start, $lte: end } } },
      { $group: { _id: null, average: { $avg: '$rating' } } },
    ]);
    const average = result[0]?.average ? Math.round(result[0].average * 10) / 10 : 0;
    res.json({ success: true, average });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get revenue trend (default: past month)
export const getRevenueTrend = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, startOfMonth(subDays(new Date(), 30)), endOfMonth(new Date()));

    // Appointment revenue by week
    const appointmentRevenue = await Appointment.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end },
          paymentStatus: 'paid',
        },
      },
      { $lookup: { from: 'services', localField: 'services', foreignField: '_id', as: 'services' } },
      {
        $group: {
          _id: { $week: '$startTime' },
          total: {
            $sum: {
              $sum: '$services.price',
            },
          },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Order revenue by week
    const orderRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['placed', 'processing', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: { $week: '$createdAt' },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { '_id': 1 } },
    ]);

    // Merge revenues
    const weeks = [];
    const values = [];
    const allWeeks = [...new Set([...appointmentRevenue.map(r => r._id), ...orderRevenue.map(r => r._id)])].sort();
    for (const week of allWeeks) {
      const appRev = appointmentRevenue.find(r => r._id === week)?.total || 0;
      const ordRev = orderRevenue.find(r => r._id === week)?.total || 0;
      weeks.push(`Week ${week}`);
      values.push(appRev + ordRev);
    }

    res.json({ success: true, weeks, values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get appointment distribution (default: past month)
export const getAppointmentDistribution = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, subDays(new Date(), 30), new Date());
    const values = await Appointment.aggregate([
      {
        $match: {
          startTime: { $gte: start, $lte: end },
          status: { $in: ['pending', 'confirmed', 'completed'] },
        },
      },
      { $group: { _id: { $dayOfWeek: '$startTime' }, count: { $sum: 1 } } },
      { $sort: { '_id': 1 } },
    ]);
    const data = Array(7).fill(0);
    values.forEach(v => { data[v._id - 1] = v.count; });
    res.json({ success: true, values });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top services (default: all time)
export const getTopServices = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, new Date(0), new Date());
    const services = await Appointment.aggregate([
      { $match: { startTime: { $gte: start, $lte: end } } },
      { $unwind: '$services' },
      { $group: { _id: '$services', count: { $sum: 1 } } },
      { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
      { $unwind: '$service' },
      { $sort: { count: -1 } },
      { $limit: 4 },
    ]);
    res.json({
      success: true,
      services: services.map(s => ({ name: s.service.name, count: s.count })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent activities (default: last 10)
export const getRecentActivities = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, subDays(new Date(), 30), new Date());
    const [appointments, orders] = await Promise.all([
      Appointment.find({ updatedAt: { $gte: start, $lte: end } })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('customer', 'name')
        .populate('services', 'name')
        .lean(),
      Order.find({ updatedAt: { $gte: start, $lte: end } })
        .sort({ updatedAt: -1 })
        .limit(10)
        .populate('user', 'name')
        .lean(),
    ]);

    const activities = [
      ...appointments.map(a => ({
        id: a._id,
        type: a.status === 'confirmed' ? 'booking' : a.status === 'cancelled' ? 'cancellation' : 'appointment',
        description: `${a.status === 'confirmed' ? 'New booking' : a.status === 'cancelled' ? 'Appointment cancelled' : 'Appointment updated'} by ${a.customer?.name || 'Customer'} for ${a.services[0]?.name || 'Service'} at ${new Date(a.startTime).toLocaleTimeString()}`,
        time: new Date(a.updatedAt).toLocaleTimeString(),
      })),
      ...orders.map(o => ({
        id: o._id,
        type: 'payment',
        description: `Order ${o.orderNumber} (${o.status}) by ${o.user?.name || 'Customer'} for ${o.items[0]?.name || 'Product'}`,
        time: new Date(o.updatedAt).toLocaleTimeString(),
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

    res.json({ success: true, activities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get staff overview (default: today)
export const getStaffOverview = async (req, res) => {
  try {
    const { start, end } = parseDateRange(req, startOfDay(new Date()), endOfDay(new Date()));
    const staff = await User.find({ role: 'staff', status: 'active' }).lean();

    const staffData = await Promise.all(
      staff.map(async s => {
        const [appointmentsToday, ratingData, timeOff, currentAppointment] = await Promise.all([
          Appointment.countDocuments({
            staff: s._id,
            startTime: { $gte: start, $lte: end },
            status: { $in: ['pending', 'confirmed'] },
          }),
          Review.aggregate([
            { $match: { staff: s._id, createdAt: { $gte: subDays(new Date(), 30) } } },
            { $group: { _id: null, average: { $avg: '$rating' } } },
          ]),
          StaffTimeOff.findOne({
            staff: s._id,
            start: { $lte: new Date() },
            end: { $gte: new Date() },
          }).lean(),
          Appointment.findOne({
            staff: s._id,
            startTime: { $lte: new Date() },
            endTime: { $gte: new Date() },
            status: { $in: ['pending', 'confirmed'] },
          }).lean(),
        ]);

        const status = timeOff ? 'On Break' : currentAppointment ? 'Busy' : 'Available';
        const rating = ratingData[0]?.average ? Math.round(ratingData[0].average * 10) / 10 : 0;

        return {
          id: s._id,
          name: s.name,
          appointmentsToday,
          rating,
          status,
        };
      })
    );

    res.json({ success: true, staff: staffData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate PDF report using PDFKit with improved formatting
export const generateReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? parseISO(startDate) : startOfMonth(new Date());
    const end = endDate ? parseISO(endDate) : endOfMonth(new Date());
    const dateRangeStr = `${format(start, 'MMMM d, yyyy')} to ${format(end, 'MMMM d, yyyy')}`;

    // Fetch all dashboard data
    const [
      appointmentsCount,
      revenueTotal,
      clientsCount,
      utilization,
      inventoryCount,
      satisfaction,
      topServices,
      staffOverview,
    ] = await Promise.all([
      Appointment.countDocuments({
        startTime: { $gte: start, $lte: end },
        status: { $in: ['pending', 'confirmed', 'completed'] },
      }),
      (async () => {
        const appointments = await Appointment.find({
          startTime: { $gte: start, $lte: end },
          paymentStatus: 'paid',
        }).populate('services');
        const appointmentRevenue = appointments.reduce((sum, appt) => {
          return sum + appt.services.reduce((s, service) => s + (service.price || 0), 0);
        }, 0);
        const orders = await Order.find({
          createdAt: { $gte: start, $lte: end },
          status: { $in: ['placed', 'processing', 'shipped', 'delivered'] },
        });
        const orderRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
        return appointmentRevenue + orderRevenue;
      })(),
      (async () => {
        const [appointmentClients, orderClients] = await Promise.all([
          Appointment.distinct('customer', { startTime: { $gte: start, $lte: end } }),
          Order.distinct('user', { createdAt: { $gte: start, $lte: end } }),
        ]);
        return [...new Set([...appointmentClients, ...orderClients])].length;
      })(),
      (async () => {
        const staff = await User.find({ role: 'staff', status: 'active' });
        const totalHours = staff.length * 7;
        const bookedHours = await Appointment.aggregate([
          {
            $match: {
              startTime: { $gte: start, $lte: end },
              status: { $in: ['pending', 'confirmed'] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 1000 * 60 * 60] } },
            },
          },
        ]);
        return totalHours > 0 ? Math.round(((bookedHours[0]?.total || 0) / totalHours) * 100) : 0;
      })(),
      (async () => {
        const products = await Product.find({ isActive: true });
        return products.filter(
          (p) => p.stock < 10 || (computeExpiryDaysLeft(p.expiryDate) !== null && computeExpiryDaysLeft(p.expiryDate) < 30)
        ).length;
      })(),
      (async () => {
        const result = await Review.aggregate([
          { $match: { createdAt: { $gte: start, $lte: end } } },
          { $group: { _id: null, average: { $avg: '$rating' } } },
        ]);
        return result[0]?.average ? Math.round(result[0].average * 10) / 10 : 0;
      })(),
      (async () => {
        const services = await Appointment.aggregate([
          { $match: { startTime: { $gte: start, $lte: end } } },
          { $unwind: '$services' },
          { $group: { _id: '$services', count: { $sum: 1 } } },
          { $lookup: { from: 'services', localField: '_id', foreignField: '_id', as: 'service' } },
          { $unwind: '$service' },
          { $sort: { count: -1 } },
          { $limit: 4 },
        ]);
        return services.map(s => ({ name: s.service.name, count: s.count }));
      })(),
      (async () => {
        const staff = await User.find({ role: 'staff', status: 'active' }).lean();
        return Promise.all(
          staff.map(async s => {
            const [appointmentsToday, ratingData, timeOff, currentAppointment] = await Promise.all([
              Appointment.countDocuments({
                staff: s._id,
                startTime: { $gte: start, $lte: end },
                status: { $in: ['pending', 'confirmed'] },
              }),
              Review.aggregate([
                { $match: { staff: s._id, createdAt: { $gte: subDays(new Date(), 30) } } },
                { $group: { _id: null, average: { $avg: '$rating' } } },
              ]),
              StaffTimeOff.findOne({
                staff: s._id,
                start: { $lte: new Date() },
                end: { $gte: new Date() },
              }).lean(),
              Appointment.findOne({
                staff: s._id,
                startTime: { $lte: new Date() },
                endTime: { $gte: new Date() },
                status: { $in: ['pending', 'confirmed'] },
              }).lean(),
            ]);

            const status = timeOff ? 'On Break' : currentAppointment ? 'Busy' : 'Available';
            const rating = ratingData[0]?.average ? Math.round(ratingData[0].average * 10) / 10 : 0;

            return { name: s.name, appointmentsToday, rating, status };
          })
        );
      })(),
    ]);

    // Create PDF with PDFKit
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard_report_${format(start, 'yyyyMMdd')}.pdf"`);
    doc.pipe(res);

    // Title
    doc.fontSize(20).text('Admin Dashboard Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date Range: ${dateRangeStr}`, { align: 'center' });
    doc.moveDown(1.5);

    // Summary Section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown();
    const summaryTable = [
      ['Metric', 'Value'],
      ['Total Appointments', appointmentsCount.toString()],
      ['Revenue', `$${revenueTotal.toLocaleString()}`],
      ['Active Clients', clientsCount.toString()],
      ['Staff Utilization', `${utilization}%`],
      ['Inventory Alerts', inventoryCount.toString()],
      ['Customer Satisfaction', `${satisfaction}/5`],
    ];
    doc.fontSize(10);
    summaryTable.forEach((row, index) => {
      if (index === 0) {
        doc.font('Helvetica-Bold');
        doc.text(row[0], 50, doc.y, { width: 200 });
        doc.text(row[1], 270, doc.y, { width: 150, align: 'right' });
        doc.font('Helvetica');
      } else {
        doc.text(row[0], 50, doc.y, { width: 200 });
        doc.text(row[1], 270, doc.y, { width: 150, align: 'right' });
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(1);

    // Top Services Section
    doc.fontSize(16).text('Top Services', { underline: true });
    doc.moveDown();
    const servicesTable = [['Service', 'Bookings'], ...topServices.map(s => [s.name, s.count.toString()])];
    doc.fontSize(10);
    servicesTable.forEach((row, index) => {
      if (index === 0) {
        doc.font('Helvetica-Bold');
        doc.text(row[0], 50, doc.y, { width: 200 });
        doc.text(row[1], 270, doc.y, { width: 150, align: 'right' });
        doc.font('Helvetica');
      } else {
        doc.text(row[0], 50, doc.y, { width: 200 });
        doc.text(row[1], 270, doc.y, { width: 150, align: 'right' });
      }
      doc.moveDown(0.3);
    });
    doc.moveDown(1);

    // Staff Overview Section
    doc.fontSize(16).text('Staff Overview', { underline: true });
    doc.moveDown();
    const staffTable = [['Name', 'Appointments', 'Rating', 'Status'], ...staffOverview.map(s => [s.name, s.appointmentsToday.toString(), `${s.rating}/5`, s.status])];
    doc.fontSize(10);
    staffTable.forEach((row, index) => {
      if (index === 0) {
        doc.font('Helvetica-Bold');
        doc.text(row[0], 50, doc.y, { width: 150 });
        doc.text(row[1], 220, doc.y, { width: 80, align: 'right' });
        doc.text(row[2], 310, doc.y, { width: 80, align: 'right' });
        doc.text(row[3], 400, doc.y, { width: 100, align: 'right' });
        doc.font('Helvetica');
      } else {
        doc.text(row[0], 50, doc.y, { width: 150 });
        doc.text(row[1], 220, doc.y, { width: 80, align: 'right' });
        doc.text(row[2], 310, doc.y, { width: 80, align: 'right' });
        doc.text(row[3], 400, doc.y, { width: 100, align: 'right' });
      }
      doc.moveDown(0.3);
      if (doc.y > 750 && index < staffTable.length - 1) {
        doc.addPage();
        doc.text('Staff Overview (Continued)', { align: 'center' });
        doc.moveDown(1);
      }
    });

    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ success: false, message: 'Error generating PDF: ' + error.message });
  }
};