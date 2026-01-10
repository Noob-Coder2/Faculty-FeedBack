// server/routes/faculty.js
const express = require("express");
const router = express.Router();
const { query, validationResult } = require("express-validator");
const TeachingAssignment = require("../models/TeachingAssignment");
const AggregatedRating = require("../models/AggregatedRating");
const FeedbackPeriod = require("../models/FeedbackPeriod");
const Subject = require("../models/Subject");
const Class = require("../models/Class");
const RatingParameter = require("../models/RatingParameter");
const validate = require("../middleware/validate");
const auth = require("../middleware/auth");
const User = require("../models/User");
const FacultyProfile = require("../models/FacultyProfile");

// GET /api/faculty/analytics - Get analytics data for the logged-in faculty
router.get('/analytics', async (req, res) => {
  try {
    const userId = req.user.id;

    // Find user to get MongoDB ObjectId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const facultyProfile = await FacultyProfile.findOne({ user: user._id });
    if (!facultyProfile) {
      return res.status(404).json({ message: 'Faculty profile not found' });
    }

    // 1. Trend Data: Average rating per feedback period
    const trendData = await AggregatedRating.aggregate([
      {
        $lookup: {
          from: 'teachingassignments',
          localField: 'teachingAssignment',
          foreignField: '_id',
          as: 'teachingAssignment'
        }
      },
      { $unwind: '$teachingAssignment' },
      {
        $match: {
          'teachingAssignment.faculty': user._id
        }
      },
      {
        $lookup: {
          from: 'feedbackperiods',
          localField: 'teachingAssignment.feedbackPeriod',
          foreignField: '_id',
          as: 'feedbackPeriod'
        }
      },
      { $unwind: '$feedbackPeriod' },
      {
        $group: {
          _id: '$feedbackPeriod.name',
          averageRating: { $avg: '$averageRating' },
          endDate: { $first: '$feedbackPeriod.endDate' }
        }
      },
      { $sort: { endDate: 1 } },
      {
        $project: {
          period: '$_id',
          averageRating: { $round: ['$averageRating', 2] },
          _id: 0
        }
      }
    ]);

    // 2. Department Average
    const departmentAverageResult = await AggregatedRating.aggregate([
      {
        $lookup: {
          from: 'teachingassignments',
          localField: 'teachingAssignment',
          foreignField: '_id',
          as: 'teachingAssignment'
        }
      },
      { $unwind: '$teachingAssignment' },
      {
        $lookup: {
          from: 'facultyprofiles',
          localField: 'teachingAssignment.faculty',
          foreignField: 'user',
          as: 'facultyProfile'
        }
      },
      { $unwind: '$facultyProfile' },
      {
        $match: {
          'facultyProfile.department': facultyProfile.department
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$averageRating' }
        }
      }
    ]);

    const departmentAverage = departmentAverageResult.length > 0
      ? parseFloat(departmentAverageResult[0].averageRating.toFixed(2))
      : 0;

    res.status(200).json({
      trendData,
      departmentAverage
    });

  } catch (error) {
    console.error('Analytics Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/faculty/ratings - Retrieve their aggregated, anonymous feedback ratings in real-time
router.get(
  "/ratings",
  [
    query("feedbackPeriod")
      .optional()
      .isMongoId()
      .withMessage("Valid feedback period ID is required"),
  ],
  validate,
  async (req, res) => {
    try {
      const facultyUserId = req.user.id; // From JWT auth middleware (e.g., "FAC001")

      // Find the user document to get the MongoDB ObjectId
      const facultyUser = await User.findOne({ userId: facultyUserId });
      if (!facultyUser) {
        return res.status(404).json({ message: "Faculty user not found" });
      }
      const facultyId = facultyUser._id; // The ObjectId needed for referencing in other collections

      const { feedbackPeriod } = req.query;

      // Default to the current active feedback period if none specified
      const currentDate = new Date();
      const targetFeedbackPeriod = feedbackPeriod
        ? await FeedbackPeriod.findById(feedbackPeriod)
        : (await FeedbackPeriod.findOne({
          startDate: { $lte: currentDate },
          endDate: { $gte: currentDate },
          isActive: true,
        })) ||
        (await FeedbackPeriod.findOne({}, {}, { sort: { endDate: -1 } })); // Fallback to most recent if no active period

      if (!targetFeedbackPeriod) {
        return res.status(404).json({ message: "No feedback period found" });
      }

      // Find all teaching assignments for this faculty in the target period using the ObjectId
      const teachingAssignments = await TeachingAssignment.find({
        faculty: facultyId,
        feedbackPeriod: targetFeedbackPeriod._id,
      })
        .populate("subject", "subjectCode subjectName branch semester")
        .populate("class", "name branch semester");

      if (teachingAssignments.length === 0) {
        return res.status(200).json({
          message: "No teaching assignments found for this feedback period",
          ratings: [],
          feedbackPeriod: targetFeedbackPeriod,
        });
      }

      // Get all rating parameters
      const ratingParameters = await RatingParameter.find();

      // Fetch aggregated ratings for these assignments
      const aggregatedRatings = await AggregatedRating.find({
        teachingAssignment: { $in: teachingAssignments.map((ta) => ta._id) },
      }).populate("ratingParameter", "name questionText");

      // Organize ratings by assignment
      const ratingsByAssignment = teachingAssignments.map((assignment) => {
        const assignmentRatings = aggregatedRatings.filter(
          (ar) => ar.teachingAssignment.toString() === assignment._id.toString()
        );

        const ratings = ratingParameters.map((param) => {
          const rating = assignmentRatings.find(
            (ar) => ar.ratingParameter._id.toString() === param._id.toString()
          );
          return {
            parameter: param.questionText, // Use the full question text
            averageRating: rating ? rating.averageRating.toFixed(2) : "N/A",
            totalResponses: rating ? rating.totalResponses : 0,
          };
        });

        return {
          assignmentId: assignment._id,
          subject: {
            code: assignment.subject.subjectCode,
            name: assignment.subject.subjectName,
            branch: assignment.subject.branch,
            semester: assignment.subject.semester,
          },
          class: {
            name: assignment.class.name,
            branch: assignment.class.branch,
            semester: assignment.class.semester,
          },
          ratings,
        };
      });

      res.status(200).json({
        message: "Aggregated ratings retrieved successfully",
        feedbackPeriod: {
          name: targetFeedbackPeriod.name,
          startDate: targetFeedbackPeriod.startDate,
          endDate: targetFeedbackPeriod.endDate,
          status: targetFeedbackPeriod.status,
        },
        ratings: ratingsByAssignment,
      });
    } catch (error) {
      console.error("Get Faculty Ratings Error:", error);
      res.status(500).json({ message: "Server error while fetching ratings" });
    }
  }
);

// GET /api/faculty/search?name=<query> - Search faculty by name (shared: admin, faculty, student)
router.get(
  "/search",
  [
    auth,
    query("name")
      .trim()
      .notEmpty()
      .withMessage("Search query is required")
      .isLength({ min: 2 })
      .withMessage("Search query must be at least 2 characters"),
    query("page")
      .optional()
      .isInt({ min: 1 })
      .toInt()
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .toInt()
      .withMessage("Limit must be between 1 and 50"),
  ],
  validate,
  async (req, res) => {
    try {
      const { name, page = 1, limit = 10 } = req.query;

      // Case-insensitive regex search for faculty names
      const searchRegex = new RegExp(name, "i");
      const query = { role: "faculty", name: { $regex: searchRegex } };

      // Fetch matching faculty with pagination
      const faculty = await User.find(query)
        .select("_id name")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      // Get total count for pagination
      const total = await User.countDocuments(query);

      res.status(200).json({
        message: "Faculty search completed successfully",
        data: faculty.map((f) => ({ id: f._id, name: f.name })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Faculty Search Error:", error);
      res.status(500).json({ message: "Server error during faculty search" });
    }
  });

// GET /api/faculty/comments - Get comments for the logged-in faculty
router.get('/comments', async (req, res) => {
  try {
    const userId = req.user.id;
    const Feedback = require('../models/Feedback');

    // Find user to get MongoDB ObjectId
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find all teaching assignments for this faculty
    const assignments = await TeachingAssignment.find({ faculty: user._id }).select('_id');
    const assignmentIds = assignments.map(a => a._id);

    // Fetch comments for these assignments
    const comments = await Feedback.find({
      teachingAssignment: { $in: assignmentIds },
      comment: { $exists: true, $ne: '' }
    })
      .populate({
        path: 'teachingAssignment',
        populate: { path: 'subject class feedbackPeriod', select: 'subjectName name name' }
      })
      .select('comment submittedAt teachingAssignment')
      .sort({ submittedAt: -1 })
      .limit(50);

    const formattedComments = comments.map(c => ({
      id: c._id,
      text: c.comment,
      date: c.submittedAt,
      subject: c.teachingAssignment?.subject?.subjectName || 'Unknown',
      class: c.teachingAssignment?.class?.name || 'Unknown',
      period: c.teachingAssignment?.feedbackPeriod?.name || 'Unknown'
    }));

    res.status(200).json({ comments: formattedComments });
  } catch (error) {
    console.error('Get Comments Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

