import {
  pgTable,
  text,
  timestamp,
  boolean,
  serial,
  integer,
  real,
} from 'drizzle-orm/pg-core'

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expiresAt').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
  refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
  updatedAt: timestamp('updatedAt').notNull().defaultNow(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow(),
  updatedAt: timestamp('updatedAt').defaultNow(),
})

// --- Student management tables ---------------------------------------------
// Every table is scoped by `userId` (the signed-in admin/teacher). There is no
// RLS on Neon, so every query filters by userId. No FK constraints on app
// tables by design.

export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  studentNumber: text('studentNumber').notNull(),
  phone: text('phone'),
  gradeLevel: text('gradeLevel'),
  status: text('status').notNull().default('active'), // active | inactive
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const courses = pgTable('courses', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  instructor: text('instructor'),
  credits: integer('credits').notNull().default(3),
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})

export const enrollments = pgTable('enrollments', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  studentId: integer('studentId').notNull(),
  courseId: integer('courseId').notNull(),
  score: real('score'), // 0 - 100, null = not graded yet
  createdAt: timestamp('createdAt').notNull().defaultNow(),
})
