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
      const facultyId = req.user.id; // From JWT auth middleware
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

      // Find all teaching assignments for this faculty in the target period
      const teachingAssignments = await TeachingAssignment.find({
        faculty: facultyId,
        feedbackPeriod: targetFeedbackPeriod._id,
      })
        .populate("subject", "subjectCode subjectName branch semester")
        .populate("class", "name branch semester");

      if (teachingAssignments.length === 0) {
        return res.status(404).json({
          message: "No teaching assignments found for this feedback period",
        });
      }

      // Get all rating parameters (assuming 5 from seed-rating.js)
      const ratingParameters = await RatingParameter.find();
      if (ratingParameters.length !== 5) {
        return res.status(500).json({
          message: "Server error: Expected exactly 5 rating parameters",
        });
      }

      // Fetch aggregated ratings for these assignments
      const aggregatedRatings = await AggregatedRating.find({
        teachingAssignment: { $in: teachingAssignments.map((ta) => ta._id) },
      }).populate("ratingParameter", "name");

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
            parameter: param.name,
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
  }
);

module.exports = router;
