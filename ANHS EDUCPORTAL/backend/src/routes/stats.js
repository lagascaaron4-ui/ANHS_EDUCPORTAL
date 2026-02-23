const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Program = require('../models/Program');
const News = require('../models/News');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');
const Grade = require('../models/Grade');
const Enrollment = require('../models/Enrollment');

// Get dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    const [
      studentCount,
      teacherCount,
      programCount,
      newsCount,
      upcomingEvents,
      recentAnnouncements
    ] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Program.countDocuments(),
      News.countDocuments(),
      Event.find({ startDate: { $gte: new Date() } })
        .sort({ startDate: 1 })
        .limit(5)
        .lean(),
      Announcement.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean()
    ]);

    res.json({
      success: true,
      data: {
        counts: {
          students: studentCount,
          teachers: teacherCount,
          programs: programCount,
          news: newsCount
        },
        upcomingEvents,
        recentAnnouncements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get hero statistics
router.get('/hero', async (req, res) => {
  try {
    const [studentCount, teacherCount, programCount, totalGrades, passingGrades] = await Promise.all([
      Student.countDocuments(),
      Teacher.countDocuments(),
      Program.countDocuments(),
      Grade.countDocuments(),
      Grade.countDocuments({ score: { $gte: 75 } })
    ]);
    const graduationRate = totalGrades > 0
      ? Math.round((passingGrades / totalGrades) * 100)
      : null;

    res.json({
      success: true,
      data: {
        students: studentCount,
        graduationRate,
        faculty: teacherCount,
        programs: programCount
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get chart data
router.get('/charts', async (req, res) => {
  try {
    // Get enrollment data by grade level
    const enrollmentData = await Enrollment.aggregate([
      {
        $group: {
          _id: '$gradeLevel',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get grade distribution
    const gradeDistribution = await Grade.aggregate([
      {
        $group: {
          _id: '$score',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        enrollmentByGrade: enrollmentData,
        gradeDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
