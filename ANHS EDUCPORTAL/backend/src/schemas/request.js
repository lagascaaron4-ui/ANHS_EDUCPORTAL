const { z } = require('zod');

const nonEmptyString = z.string().trim().min(1);
const optionalString = z.string().trim().optional();
const optionalDate = z.union([z.string().datetime().or(z.string().min(1)), z.date()]).optional();

function withAtLeastOneField(schema) {
  return schema.refine((value) => Object.keys(value).length > 0, {
    message: 'At least one field is required'
  });
}

const registerSchema = z.object({
  name: nonEmptyString,
  email: z.string().trim().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'teacher', 'student', 'staff', 'parent']).optional(),
  inviteToken: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  staffId: optionalString,
  department: optionalString,
  subjects: z.array(nonEmptyString).optional(),
  gradeLevels: z.array(nonEmptyString).optional(),
  studentId: optionalString,
  gradeLevel: optionalString,
  birthDate: optionalDate,
  contactInfo: optionalString,
  address: optionalString,
  guardianName: optionalString,
  guardianContact: optionalString
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
  role: z.enum(['admin', 'teacher', 'student', 'staff', 'parent']).optional(),
  invitationCode: optionalString
});

const preferencesSchema = z.object({
  preferences: z.object({
    darkMode: z.boolean().optional(),
    highContrast: z.boolean().optional(),
    rememberUser: z.boolean().optional(),
    rememberedEmail: optionalString,
    rememberedRole: optionalString
  }).optional(),
  darkMode: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  rememberUser: z.boolean().optional(),
  rememberedEmail: optionalString,
  rememberedRole: optionalString
});

const userBase = z.object({
  name: nonEmptyString,
  email: z.string().trim().email(),
  password: z.string().min(8).optional(),
  role: z.enum(['admin', 'teacher', 'student', 'staff', 'parent']).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

const studentBase = z.object({
  user: nonEmptyString.optional(),
  studentId: nonEmptyString,
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  gradeLevel: nonEmptyString,
  section: optionalString,
  birthDate: optionalDate,
  contactInfo: optionalString,
  address: optionalString,
  guardianName: optionalString,
  guardianContact: optionalString,
  status: z.enum(['active', 'inactive']).optional()
});

const teacherBase = z.object({
  user: nonEmptyString.optional(),
  teacherId: nonEmptyString,
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  department: optionalString,
  subjects: z.array(nonEmptyString).optional(),
  gradeLevels: z.array(nonEmptyString).optional(),
  contactInfo: optionalString,
  status: z.enum(['active', 'inactive']).optional()
});

const parentBase = z.object({
  user: nonEmptyString.optional(),
  firstName: nonEmptyString,
  lastName: nonEmptyString,
  contactInfo: optionalString,
  relationship: optionalString,
  children: z.array(nonEmptyString).optional(),
  status: z.enum(['active', 'inactive']).optional()
});

const classBase = z.object({
  name: nonEmptyString,
  gradeLevel: nonEmptyString,
  section: optionalString,
  adviser: optionalString,
  schoolYear: optionalString,
  schedule: optionalString
});

const enrollmentBase = z.object({
  student: nonEmptyString,
  class: nonEmptyString,
  status: z.enum(['enrolled', 'dropped', 'completed']).optional(),
  enrolledAt: optionalDate
});

const attendanceBase = z.object({
  class: nonEmptyString,
  date: z.union([z.string().min(1), z.date()]),
  records: z.array(
    z.object({
      student: nonEmptyString,
      status: z.enum(['present', 'late', 'absent']).optional()
    })
  ).optional()
});

const gradeBase = z.object({
  student: nonEmptyString,
  class: nonEmptyString,
  subject: nonEmptyString,
  gradingPeriod: nonEmptyString,
  score: z.number(),
  remarks: optionalString
});

const announcementBase = z.object({
  title: nonEmptyString,
  content: nonEmptyString,
  targetClasses: z.array(nonEmptyString).optional(),
  author: optionalString
});

const newsBase = z.object({
  title: nonEmptyString,
  content: nonEmptyString,
  author: optionalString,
  tags: z.array(nonEmptyString).optional(),
  publishedAt: optionalDate
});

const eventBase = z.object({
  title: nonEmptyString,
  description: optionalString,
  startDate: z.union([z.string().min(1), z.date()]),
  endDate: optionalDate,
  location: optionalString
});

const programBase = z.object({
  name: nonEmptyString,
  description: optionalString,
  department: optionalString,
  requirements: optionalString
});

const admissionBase = z.object({
  studentName: nonEmptyString,
  gradeLevel: nonEmptyString,
  applicantEmail: z.string().trim().email().optional(),
  guardianName: optionalString,
  contactInfo: optionalString,
  previousSchool: optionalString,
  status: z.enum(['submitted', 'reviewing', 'accepted', 'rejected']).optional(),
  submittedAt: optionalDate
});

const contactBase = z.object({
  name: nonEmptyString,
  email: z.string().trim().email(),
  subject: optionalString,
  message: nonEmptyString
});

const inviteBase = z.object({
  email: z.string().trim().email(),
  role: z.enum(['admin', 'teacher'])
});

const assignmentBase = z.object({
  title: nonEmptyString,
  description: optionalString,
  subject: optionalString,
  dueDate: z.union([z.string().min(1), z.date()]),
  gradeLevel: nonEmptyString,
  section: optionalString,
  createdBy: optionalString,
  status: z.enum(['open', 'closed']).optional()
});

const assignmentScorePatch = withAtLeastOneField(z.object({
  score: z.number().optional(),
  feedback: optionalString
}).partial());

const scheduleBase = z.object({
  subject: nonEmptyString,
  teacherName: optionalString,
  room: optionalString,
  time: nonEmptyString,
  day: optionalString,
  gradeLevel: nonEmptyString,
  section: optionalString
});

const parentLinkRequest = z.object({
  studentId: nonEmptyString
});

const parentMessageCreate = z.object({
  subject: nonEmptyString,
  content: nonEmptyString,
  recipient: optionalString
});

const parentMessageReply = z.object({
  subject: nonEmptyString,
  content: nonEmptyString
});

const studentSelfUpdate = withAtLeastOneField(z.object({
  firstName: optionalString,
  lastName: optionalString,
  birthDate: optionalDate,
  contactInfo: optionalString,
  address: optionalString,
  guardianName: optionalString,
  guardianContact: optionalString,
  email: z.string().trim().email().optional(),
  name: optionalString
}).partial());

const parentSelfUpdate = withAtLeastOneField(z.object({
  firstName: optionalString,
  lastName: optionalString,
  contactInfo: optionalString,
  relationship: optionalString
}).partial());

function updateSchema(base) {
  return withAtLeastOneField(base.partial());
}

module.exports = {
  registerSchema,
  loginSchema,
  preferencesSchema,
  userCreateSchema: userBase.extend({ password: z.string().min(8) }),
  userUpdateSchema: updateSchema(userBase.omit({ password: true }).extend({ password: z.string().min(8).optional() })),
  studentCreateSchema: studentBase,
  studentUpdateSchema: updateSchema(studentBase),
  teacherCreateSchema: teacherBase,
  teacherUpdateSchema: updateSchema(teacherBase),
  parentCreateSchema: parentBase,
  parentUpdateSchema: updateSchema(parentBase),
  classCreateSchema: classBase,
  classUpdateSchema: updateSchema(classBase),
  enrollmentCreateSchema: enrollmentBase,
  enrollmentUpdateSchema: updateSchema(enrollmentBase),
  attendanceCreateSchema: attendanceBase,
  attendanceUpdateSchema: updateSchema(attendanceBase),
  gradeCreateSchema: gradeBase,
  gradeUpdateSchema: updateSchema(gradeBase),
  announcementCreateSchema: announcementBase,
  announcementUpdateSchema: updateSchema(announcementBase),
  newsCreateSchema: newsBase,
  newsUpdateSchema: updateSchema(newsBase),
  eventCreateSchema: eventBase,
  eventUpdateSchema: updateSchema(eventBase),
  programCreateSchema: programBase,
  programUpdateSchema: updateSchema(programBase),
  admissionCreateSchema: admissionBase,
  admissionUpdateSchema: updateSchema(admissionBase),
  contactCreateSchema: contactBase,
  inviteCreateSchema: inviteBase,
  assignmentCreateSchema: assignmentBase,
  assignmentUpdateSchema: updateSchema(assignmentBase),
  assignmentSubmissionGradeSchema: assignmentScorePatch,
  scheduleCreateSchema: scheduleBase,
  scheduleUpdateSchema: updateSchema(scheduleBase),
  parentLinkRequestSchema: parentLinkRequest,
  parentMessageCreateSchema: parentMessageCreate,
  parentMessageReplySchema: parentMessageReply,
  studentSelfUpdateSchema: studentSelfUpdate,
  parentSelfUpdateSchema: parentSelfUpdate
};
