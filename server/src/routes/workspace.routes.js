const express = require('express');
const router = express.Router();
// Auth middleware removed
const {
  createWorkspace,
  getUserWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteMember,
  removeMember,
  changeMemberRole,
  getMembers,
  getActivity,
  acceptInvite
} = require('../controllers/workspace.controller');

// Public route for accepting invite
router.get('/join', acceptInvite);

// All other routes are protected
// protect middleware removed

router.post('/', createWorkspace);
router.get('/', getUserWorkspaces);
router.get('/:id', getWorkspace);
router.put('/:id', updateWorkspace);
router.delete('/:id', deleteWorkspace);

router.post('/:id/invite', inviteMember);
router.get('/:id/members', getMembers);
router.delete('/:id/members/:userId', removeMember);
router.put('/:id/members/:userId/role', changeMemberRole);

router.get('/:id/activity', getActivity);

module.exports = router;
