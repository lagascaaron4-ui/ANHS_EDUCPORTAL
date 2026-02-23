const schemas = require('../schemas/request');

const rules = [
  { method: 'POST', path: /^\/auth\/register$/, schema: schemas.registerSchema },
  { method: 'POST', path: /^\/auth\/login$/, schema: schemas.loginSchema },
  { method: 'PUT', path: /^\/auth\/preferences$/, schema: schemas.preferencesSchema },

  { method: 'POST', path: /^\/users$/, schema: schemas.userCreateSchema },
  { method: 'PUT', path: /^\/users\/[^/]+$/, schema: schemas.userUpdateSchema },

  { method: 'POST', path: /^\/students$/, schema: schemas.studentCreateSchema },
  { method: 'PUT', path: /^\/students\/me$/, schema: schemas.studentSelfUpdateSchema },
  { method: 'PUT', path: /^\/students\/[^/]+$/, schema: schemas.studentUpdateSchema },

  { method: 'POST', path: /^\/teachers$/, schema: schemas.teacherCreateSchema },
  { method: 'PUT', path: /^\/teachers\/[^/]+$/, schema: schemas.teacherUpdateSchema },

  { method: 'POST', path: /^\/parents$/, schema: schemas.parentCreateSchema },
  { method: 'PUT', path: /^\/parents\/me$/, schema: schemas.parentSelfUpdateSchema },
  { method: 'PUT', path: /^\/parents\/[^/]+$/, schema: schemas.parentUpdateSchema },

  { method: 'POST', path: /^\/classes$/, schema: schemas.classCreateSchema },
  { method: 'PUT', path: /^\/classes\/[^/]+$/, schema: schemas.classUpdateSchema },

  { method: 'POST', path: /^\/enrollments$/, schema: schemas.enrollmentCreateSchema },
  { method: 'PUT', path: /^\/enrollments\/[^/]+$/, schema: schemas.enrollmentUpdateSchema },

  { method: 'POST', path: /^\/attendance$/, schema: schemas.attendanceCreateSchema },
  { method: 'PUT', path: /^\/attendance\/[^/]+$/, schema: schemas.attendanceUpdateSchema },

  { method: 'POST', path: /^\/grades$/, schema: schemas.gradeCreateSchema },
  { method: 'PUT', path: /^\/grades\/[^/]+$/, schema: schemas.gradeUpdateSchema },

  { method: 'POST', path: /^\/announcements$/, schema: schemas.announcementCreateSchema },
  { method: 'PUT', path: /^\/announcements\/[^/]+$/, schema: schemas.announcementUpdateSchema },

  { method: 'POST', path: /^\/news$/, schema: schemas.newsCreateSchema },
  { method: 'PUT', path: /^\/news\/[^/]+$/, schema: schemas.newsUpdateSchema },

  { method: 'POST', path: /^\/events$/, schema: schemas.eventCreateSchema },
  { method: 'PUT', path: /^\/events\/[^/]+$/, schema: schemas.eventUpdateSchema },

  { method: 'POST', path: /^\/programs$/, schema: schemas.programCreateSchema },
  { method: 'PUT', path: /^\/programs\/[^/]+$/, schema: schemas.programUpdateSchema },

  { method: 'POST', path: /^\/admissions$/, schema: schemas.admissionCreateSchema },
  { method: 'PUT', path: /^\/admissions\/[^/]+$/, schema: schemas.admissionUpdateSchema },

  { method: 'POST', path: /^\/contacts$/, schema: schemas.contactCreateSchema },

  { method: 'POST', path: /^\/invites$/, schema: schemas.inviteCreateSchema },

  { method: 'POST', path: /^\/assignments$/, schema: schemas.assignmentCreateSchema },
  { method: 'PUT', path: /^\/assignments\/[^/]+$/, schema: schemas.assignmentUpdateSchema },
  { method: 'PATCH', path: /^\/assignments\/submissions\/[^/]+$/, schema: schemas.assignmentSubmissionGradeSchema },

  { method: 'POST', path: /^\/schedule$/, schema: schemas.scheduleCreateSchema },
  { method: 'PUT', path: /^\/schedule\/[^/]+$/, schema: schemas.scheduleUpdateSchema },

  { method: 'POST', path: /^\/parent-links\/request$/, schema: schemas.parentLinkRequestSchema },

  { method: 'POST', path: /^\/parent-messages\/me$/, schema: schemas.parentMessageCreateSchema },
  { method: 'POST', path: /^\/parent-messages\/[^/]+\/reply$/, schema: schemas.parentMessageReplySchema }
];

function validateRequestBody(req, res, next) {
  const method = String(req.method || '').toUpperCase();
  const path = req.path || '/';
  const rule = rules.find((candidate) => candidate.method === method && candidate.path.test(path));
  if (!rule) return next();

  const parsed = rule.schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: 'Invalid request body',
      issues: parsed.error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  req.body = parsed.data;
  return next();
}

module.exports = { validateRequestBody };
