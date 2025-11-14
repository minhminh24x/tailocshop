// File: backend/server/controllers/supplierSubmission.controller.js
import httpStatus from 'http-status';
import asyncHandler from '../utils/asyncHandler.js';
import { supplierSubmissionService } from '../service/supplierSubmission.service.js';

// (POST) /
const handleCreateSubmission = asyncHandler(async (req, res) => {
  // req.user.id được gán từ middleware auth
  const submission = await supplierSubmissionService.createSubmission(req.user.id, req.body);
  res.status(httpStatus.CREATED).send(submission);
});

// (PUT) /:submissionId/approve
const handleApproveSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  // req.user.id là của Admin/Staff
  const submission = await supplierSubmissionService.approveSubmission(submissionId, req.user.id, req.body);
  res.status(httpStatus.OK).send(submission);
});

// (PUT) /:submissionId/reject
const handleRejectSubmission = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await supplierSubmissionService.rejectSubmission(
    submissionId,
    req.user.id,
    req.body.adminNotes
  );
  res.status(httpStatus.OK).send(submission);
});

// (GET) /
const handleGetSubmissions = asyncHandler(async (req, res) => {
  // req.query sẽ chứa ?status=PENDING v.v.
  const filters = req.query; 
  const submissions = await supplierSubmissionService.getSubmissions(req.user, filters);
  res.status(httpStatus.OK).send(submissions);
});

// (GET) /:submissionId
const handleGetSubmissionById = asyncHandler(async (req, res) => {
  const { submissionId } = req.params;
  const submission = await supplierSubmissionService.getSubmissionById(submissionId, req.user);
  res.status(httpStatus.OK).send(submission);
});

export const supplierSubmissionController = {
  handleCreateSubmission,
  handleApproveSubmission,
  handleRejectSubmission,
  handleGetSubmissions,
  handleGetSubmissionById,
};