const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { query } = require('express-validator');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');
const checkRole = require('../middleware/role');
const AggregatedRating = require('../models/AggregatedRating');
const TeachingAssignment = require('../models/TeachingAssignment');
const FacultyProfile = require('../models/FacultyProfile');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Class = require('../models/Class');

// GET /api/admin/faculty-ratings - View faculty ratings (admin only)
router.get(
  '/',
  [
    auth,
    checkRole(['admin']),
    query('facultyId').optional().isMongoId().withMessage('Invalid faculty ID'),
    query('subjectId').optional().isMongoId().withMessage('Invalid subject ID'),
    query('feedbackPeriodId').optional().isMongoId().withMessage('Invalid feedback period ID'),
    query('page').optional().isInt({ min: 1 }).toInt().withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt().withMessage('Limit must be between 1 and 100'),
  ],
  validate,
  async (req, res) => {
    try {
      const { facultyId, subjectId, feedbackPeriodId, page = 1, limit = 10 } = req.query;

      // Build match conditions for aggregation
      const match = {};
      if (facultyId) match['facultyProfile.user'] = new mongoose.Types.ObjectId(facultyId);
      if (subjectId) match['teachingAssignment.subject'] = new mongoose.Types.ObjectId(subjectId);
      if (feedbackPeriodId) match['teachingAssignment.feedbackPeriod'] = new mongoose.Types.ObjectId(feedbackPeriodId);

      // Aggregate feedback data
      const ratings = await AggregatedRating.aggregate([
        // Join with TeachingAssignment
        {
          $lookup: {
            from: 'teachingassignments',
            localField: 'teachingAssignment',
            foreignField: '_id',
            as: 'teachingAssignment',
          },
        },
        { $unwind: '$teachingAssignment' },
        // Join with FacultyProfile
        {
          $lookup: {
            from: 'facultyprofiles',
            localField: 'teachingAssignment.faculty',
            foreignField: '_id',
            as: 'facultyProfile',
          },
        },
        { $unwind: '$facultyProfile' },
        // Join with User for faculty name
        {
          $lookup: {
            from: 'users',
            localField: 'facultyProfile.user',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        // Join with Subject
        {
          $lookup: {
            from: 'subjects',
            localField: 'teachingAssignment.subject',
            foreignField: '_id',
            as: 'subject',
          },
        },
        { $unwind: '$subject' },
        // Join with Class
        {
          $lookup: {
            from: 'classes',
            localField: 'teachingAssignment.class',
            foreignField: '_id',
            as: 'class',
          },
        },
        { $unwind: '$class' },
        // Match filters
        { $match: match },
        // Group by faculty, subject, class, and feedback period
        {
          $group: {
            _id: {
              facultyId: '$facultyProfile.user',
              subjectId: '$teachingAssignment.subject',
              classId: '$teachingAssignment.class',
              feedbackPeriodId: '$teachingAssignment.feedbackPeriod',
            },
            facultyName: { $first: '$user.name' },
            subjectCode: { $first: '$subject.subjectCode' },
            subjectName: { $first: '$subject.subjectName' },
            className: { $first: '$class.name' },
            ratings: {
              $push: {
                parameterId: '$ratingParameter',
                averageRating: '$averageRating',
                totalResponses: '$totalResponses',
              },
            },
            ratingCount: { $sum: 1 },
          },
        },
        // Sort by faculty name, subject, and class
        { $sort: { facultyName: 1, subjectCode: 1, className: 1 } },
        // Pagination
        { $skip: (page - 1) * limit },
        { $limit: limit },
        // Project final fields
        {
          $project: {
            facultyId: '$_id.facultyId',
            facultyName: 1,
            subjectId: '$_id.subjectId',
            subjectCode: 1,
            subjectName: 1,
            classId: '$_id.classId',
            className: 1,
            feedbackPeriodId: '$_id.feedbackPeriodId',
            ratings: 1,
            ratingCount: 1,
            _id: 0,
          },
        },
      ]);

      // Populate rating parameters in ratings array
      for (const rating of ratings) {
        rating.ratings = await Promise.all(
          rating.ratings.map(async (r) => {
            const param = await RatingParameter.findById(r.parameterId).select('questionText');
            return {
              parameter: param ? param.questionText : 'Unknown',
              averageRating: r.averageRating.toFixed(2),
              totalResponses: r.totalResponses,
            };
          })
        );
      }

      // Get total count for pagination metadata
      const total = await AggregatedRating.aggregate([
        { $lookup: { from: 'teachingassignments', localField: 'teachingAssignment', foreignField: '_id', as: 'teachingAssignment' } },
        { $unwind: '$teachingAssignment' },
        { $lookup: { from: 'facultyprofiles', localField: 'teachingAssignment.faculty', foreignField: '_id', as: 'facultyProfile' } },
        { $unwind: '$facultyProfile' },
        { $lookup: { from: 'subjects', localField: 'teachingAssignment.subject', foreignField: '_id', as: 'subject' } },
        { $unwind: '$subject' },
        { $lookup: { from: 'classes', localField: 'teachingAssignment.class', foreignField: '_id', as: 'class' } },
        { $unwind: '$class' },
        { $match: match },
        {
          $group: {
            _id: {
              facultyId: '$facultyProfile.user',
              subjectId: '$teachingAssignment.subject',
              classId: '$teachingAssignment.class',
              feedbackPeriodId: '$teachingAssignment.feedbackPeriod',
            },
          },
        },
        { $count: 'total' },
      ]).then((result) => result[0]?.total || 0);

      res.status(200).json({
        message: 'Faculty ratings retrieved successfully',
        data: ratings,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Get Faculty Ratings Error:', error);
      res.status(500).json({ message: 'Server error while retrieving faculty ratings' });
    }
  }
);

module.exports = router;