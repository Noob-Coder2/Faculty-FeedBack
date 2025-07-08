const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const validate = require('../middleware/validate');
const TeachingAssignment = require('../models/TeachingAssignment');
const FeedbackPeriod = require('../models/FeedbackPeriod');
const AggregatedRating = require('../models/AggregatedRating');
const StudentProfile = require('../models/StudentProfile');
const RatingParameter = require('../models/RatingParameter');
const User = require('../models/User');

// GET /api/student/assignments - List teaching assignments they can provide feedback on
router.get(
  '/assignments',
  validate,
  async (req, res) => {
    try {
      const studentId = req.user._id;

      const studentProfile = await StudentProfile.findOne({ user: studentId });
      if (!studentProfile) {
        return res.status(400).json({ message: 'Student profile not found' });
      }

      const currentDate = new Date();
      const activeFeedbackPeriod = await FeedbackPeriod.findOne({
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        isActive: true,
      });
      if (!activeFeedbackPeriod) {
        return res.status(404).json({ message: 'No active feedback period found' });
      }

      const teachingAssignments = await TeachingAssignment.find({
        class: studentProfile.classId,
        feedbackPeriod: activeFeedbackPeriod._id,
      })
        .populate('faculty', 'name')
        .populate('subject', 'subjectCode subjectName branch semester')
        .populate('class', 'name branch semester');

      // Get all rating parameters (expecting 5)
      const ratingParameters = await RatingParameter.find();
      if (ratingParameters.length !== 5) {
        return res.status(500).json({ message: 'Server error: Expected exactly 5 rating parameters' });
      }

      // Check which assignments have complete feedback (all 5 parameters rated)
      const aggregatedRatings = await AggregatedRating.find({
        teachingAssignment: { $in: teachingAssignments.map((ta) => ta._id) },
      });

      const submittedAssignmentIds = [];
      teachingAssignments.forEach((ta) => {
        const ratingsForAssignment = aggregatedRatings.filter(
          (ar) => ar.teachingAssignment.toString() === ta._id.toString()
        );
        // A submission is complete if all 5 rating parameters have ratings
        const ratedParameterIds = new Set(ratingsForAssignment.map((ar) => ar.ratingParameter.toString()));
        if (ratedParameterIds.size === 5) {
          submittedAssignmentIds.push(ta._id.toString());
        }
      });

      const pendingAssignments = teachingAssignments.filter(
        (ta) => !submittedAssignmentIds.includes(ta._id.toString())
      );

      res.status(200).json({
        message: 'Pending teaching assignments retrieved successfully',
        teachingAssignments: pendingAssignments.map((ta) => ({
          id: ta._id,
          faculty: { id: ta.faculty._id, name: ta.faculty.name },
          subject: {
            id: ta.subject._id,
            code: ta.subject.subjectCode,
            name: ta.subject.subjectName,
            branch: ta.subject.branch,
            semester: ta.subject.semester,
          },
          class: {
            id: ta.class._id,
            name: ta.class.name,
            branch: ta.class.branch,
            semester: ta.class.semester,
          },
        })),
        ratingParameters: ratingParameters.map((rp) => ({
          id: rp._id,
          name: rp.name,
          questionText: rp.questionText,
        })),
      });
    } catch (error) {
      console.error('Get Student Assignments Error:', error);
      res.status(500).json({ message: 'Server error while fetching assignments' });
    }
  }
);

// POST /api/student/feedback - Submit feedback for a teaching assignment (5 ratings required)
router.post(
  '/feedback',
  [
    body('teachingAssignment').isMongoId().withMessage('Valid teaching assignment ID is required'),
    body('ratings').isArray({ min: 5, max: 5 }).withMessage('Exactly 5 ratings are required'),
    body('ratings.*.ratingParameter').isMongoId().withMessage('Valid rating parameter ID is required'),
    body('ratings.*.value').isInt({ min: 1, max: 5 }).withMessage('Rating value must be between 1 and 5'),
  ],
  validate,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { teachingAssignment, ratings } = req.body;

      // Verify student profile and class
      const studentProfile = await StudentProfile.findOne({ user: studentId });
      if (!studentProfile) {
        return res.status(400).json({ message: 'Student profile not found' });
      }

      // Verify teaching assignment and class/subject
      const assignment = await TeachingAssignment.findById(teachingAssignment).populate('class subject');
      if (!assignment || assignment.class.toString() !== studentProfile.classId.toString()) {
        return res.status(400).json({ message: 'Invalid teaching assignment for this student' });
      }

      // Verify active feedback period
      const currentDate = new Date();
      const feedbackPeriod = await FeedbackPeriod.findOne({
        _id: assignment.feedbackPeriod,
        startDate: { $lte: currentDate },
        endDate: { $gte: currentDate },
        isActive: true,
      });
      if (!feedbackPeriod) {
        return res.status(400).json({ message: 'Feedback period is not active' });
      }

      // Get all rating parameters (expecting 5)
      const ratingParameters = await RatingParameter.find();
      if (ratingParameters.length !== 5) {
        return res.status(500).json({ message: 'Server error: Expected exactly 5 rating parameters' });
      }

      // Validate that ratings cover all 5 parameters exactly once
      const submittedParameterIds = ratings.map((r) => r.ratingParameter.toString());
      const validParameterIds = ratingParameters.map((rp) => rp._id.toString());
      const uniqueSubmittedIds = new Set(submittedParameterIds);

      if (uniqueSubmittedIds.size !== 5 || !validParameterIds.every((id) => submittedParameterIds.includes(id))) {
        return res.status(400).json({ message: 'Ratings must include exactly one entry for each of the 5 rating parameters' });
      }

      // Check if feedback already submitted (all 5 parameters rated)
      const existingRatings = await AggregatedRating.find({ teachingAssignment });
      const ratedParameterIds = new Set(existingRatings.map((ar) => ar.ratingParameter.toString()));
      if (ratedParameterIds.size === 5) {
        return res.status(400).json({ message: 'Feedback already submitted for this assignment' });
      }

      // Update or create aggregated ratings
      for (const rating of ratings) {
        const { ratingParameter, value } = rating;
        let aggregatedRating = await AggregatedRating.findOne({
          teachingAssignment,
          ratingParameter,
        });

        if (aggregatedRating) {
          aggregatedRating.totalResponses += 1;
          aggregatedRating.ratingSum += value;
          aggregatedRating.averageRating = aggregatedRating.ratingSum / aggregatedRating.totalResponses;
          await aggregatedRating.save();
        } else {
          aggregatedRating = new AggregatedRating({
            teachingAssignment,
            ratingParameter,
            totalResponses: 1,
            ratingSum: value,
            averageRating: value,
          });
          await aggregatedRating.save();
        }
      }

      res.status(201).json({
        message: 'Feedback submitted successfully',
      });
    } catch (error) {
      console.error('Submit Feedback Error:', error);
      res.status(500).json({ message: 'Server error while submitting feedback' });
    }
  }
);

// GET /api/student/submission-status - Check if they’ve submitted feedback for a period
router.get(
  '/submission-status',
  [
    query('feedbackPeriod').optional().isMongoId().withMessage('Valid feedback period ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const studentId = req.user.id;
      const { feedbackPeriod } = req.query;

      const currentDate = new Date();
      const targetFeedbackPeriod = feedbackPeriod
        ? await FeedbackPeriod.findById(feedbackPeriod)
        : await FeedbackPeriod.findOne({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            isActive: true,
          });

      if (!targetFeedbackPeriod) {
        return res.status(404).json({ message: 'No active or specified feedback period found' });
      }

      const studentProfile = await StudentProfile.findOne({ user: studentId });
      if (!studentProfile) {
        return res.status(400).json({ message: 'Student profile not found' });
      }

      const teachingAssignments = await TeachingAssignment.find({
        class: studentProfile.classId,
        feedbackPeriod: targetFeedbackPeriod._id,
      });

      // Get all rating parameters (expecting 5)
      const ratingParameters = await RatingParameter.find();
      if (ratingParameters.length !== 5) {
        return res.status(500).json({ message: 'Server error: Expected exactly 5 rating parameters' });
      }

      // Check submission status
      const aggregatedRatings = await AggregatedRating.find({
        teachingAssignment: { $in: teachingAssignments.map((ta) => ta._id) },
      });

      const submittedAssignmentIds = [];
      teachingAssignments.forEach((ta) => {
        const ratingsForAssignment = aggregatedRatings.filter(
          (ar) => ar.teachingAssignment.toString() === ta._id.toString()
        );
        const ratedParameterIds = new Set(ratingsForAssignment.map((ar) => ar.ratingParameter.toString()));
        if (ratedParameterIds.size === 5) {
          submittedAssignmentIds.push(ta._id.toString());
        }
      });

      const totalAssignments = teachingAssignments.length;
      const submittedCount = submittedAssignmentIds.length;
      const pendingCount = totalAssignments - submittedCount;

      res.status(200).json({
        message: 'Submission status retrieved successfully',
        feedbackPeriod: targetFeedbackPeriod.name,
        totalAssignments,
        submittedCount,
        pendingCount,
        submitted: submittedAssignmentIds,
      });
    } catch (error) {
      console.error('Get Submission Status Error:', error);
      res.status(500).json({ message: 'Server error while fetching submission status' });
    }
  }
);

// GET /api/student/faculty-ratings/:facultyId - View ratings of any faculty
router.get(
  '/faculty-ratings/:facultyId',
  [
    param('facultyId').isMongoId().withMessage('Valid faculty ID is required'),
    query('feedbackPeriod').optional().isMongoId().withMessage('Valid feedback period ID is required'),
  ],
  validate,
  async (req, res) => {
    try {
      const { facultyId } = req.params;
      const { feedbackPeriod } = req.query;

      // Verify the faculty exists and has faculty role
      const faculty = await User.findOne({ _id: facultyId, role: 'faculty' });
      if (!faculty) {
        return res.status(404).json({ message: 'Faculty member not found' });
      }

      // Default to the current active feedback period if none specified
      const currentDate = new Date();
      const targetFeedbackPeriod = feedbackPeriod
        ? await FeedbackPeriod.findById(feedbackPeriod)
        : await FeedbackPeriod.findOne({
            startDate: { $lte: currentDate },
            endDate: { $gte: currentDate },
            isActive: true,
          }) || await FeedbackPeriod.findOne({}, {}, { sort: { endDate: -1 } });

      if (!targetFeedbackPeriod) {
        return res.status(404).json({ message: 'No feedback period found' });
      }

      // Find teaching assignments for this faculty in the target period
      const teachingAssignments = await TeachingAssignment.find({
        faculty: facultyId,
        feedbackPeriod: targetFeedbackPeriod._id,
      })
        .populate('subject', 'subjectCode subjectName branch semester')
        .populate('class', 'name branch semester');

      if (teachingAssignments.length === 0) {
        return res.status(404).json({ message: 'No teaching assignments found for this faculty in this period' });
      }

      // Get all rating parameters (assuming 5)
      const ratingParameters = await RatingParameter.find();
      if (ratingParameters.length !== 5) {
        return res.status(500).json({ message: 'Server error: Expected exactly 5 rating parameters' });
      }

      // Fetch aggregated ratings for these assignments
      const aggregatedRatings = await AggregatedRating.find({
        teachingAssignment: { $in: teachingAssignments.map((ta) => ta._id) },
      }).populate('ratingParameter', 'name questionText');

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
            parameter: param.questionText,
            averageRating: rating ? rating.averageRating.toFixed(2) : 'N/A',
            totalResponses: rating ? rating.totalResponses : 0,
          };
        });

        return {
          assignmentId: assignment._id,
          subject: {
            id: assignment.subject._id,
            code: assignment.subject.subjectCode,
            name: assignment.subject.subjectName,
            branch: assignment.subject.branch,
            semester: assignment.subject.semester,
          },
          class: {
            id: assignment.class._id,
            name: assignment.class.name,
            branch: assignment.class.branch,
            semester: assignment.class.semester,
          },
          ratings,
        };
      });

      res.status(200).json({
        message: 'Faculty ratings retrieved successfully',
        faculty: {
          id: faculty._id,
          name: faculty.name,
          userId: faculty.userId,
        },
        feedbackPeriod: {
          id: targetFeedbackPeriod._id,
          name: targetFeedbackPeriod.name,
          startDate: targetFeedbackPeriod.startDate,
          endDate: targetFeedbackPeriod.endDate,
          status: targetFeedbackPeriod.status,
        },
        ratings: ratingsByAssignment,
      });
    } catch (error) {
      console.error('Get Faculty Ratings for Student Error:', error);
      res.status(500).json({ message: 'Server error while fetching faculty ratings' });
    }
  }
);

module.exports = router;