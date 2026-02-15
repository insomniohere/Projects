import { pgTable, text, timestamp, varchar, boolean, integer, jsonb, uuid, index, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (synced from Clerk)
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  email: text('email').notNull().unique(),
  username: text('username').unique(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  websiteUrl: text('website_url'),
  verifiedArtist: boolean('verified_artist').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('users_email_idx').on(table.email),
    usernameIdx: index('users_username_idx').on(table.username),
  };
});

// Artist profiles (extended info)
export const artistProfiles = pgTable('artist_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  portfolioTitle: text('portfolio_title'),
  artistStatement: text('artist_statement'),
  specialties: text('specialties').array(),
  location: text('location'),
  socialLinks: jsonb('social_links').$type<{ platform: string; url: string }[]>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Artworks
export const artworks = pgTable('artworks', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // e.g., 'digital', 'painting', 'photography', '3d', 'illustration'
  tags: text('tags').array(),

  // Image URLs
  originalUrl: text('original_url').notNull(), // Private, high-res original
  watermarkedUrl: text('watermarked_url').notNull(), // Public, watermarked version
  thumbnailUrl: text('thumbnail_url').notNull(), // Small thumbnail

  // Protection
  watermarkId: text('watermark_id').notNull().unique(), // Unique ID embedded in image
  protectionLevel: text('protection_level').notNull().default('standard'), // 'basic', 'standard', 'enhanced'
  licenseType: text('license_type').notNull().default('all-rights-reserved'), // 'all-rights-reserved', 'cc-by', 'cc-by-nc', etc.

  // Metadata
  viewCount: integer('view_count').default(0).notNull(),
  status: text('status').notNull().default('draft'), // 'draft', 'published', 'archived'
  publishedAt: timestamp('published_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('artworks_user_id_idx').on(table.userId),
    statusIdx: index('artworks_status_idx').on(table.status),
    publishedAtIdx: index('artworks_published_at_idx').on(table.publishedAt),
    watermarkIdIdx: index('artworks_watermark_id_idx').on(table.watermarkId),
    categoryIdx: index('artworks_category_idx').on(table.category),
  };
});

// Protection logs
export const protectionLogs = pgTable('protection_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  artworkId: uuid('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  eventType: text('event_type').notNull(), // 'view', 'download_attempt', 'violation_detected', 'watermark_verified'
  details: jsonb('details').$type<Record<string, any>>(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    artworkIdIdx: index('protection_logs_artwork_id_idx').on(table.artworkId),
    createdAtIdx: index('protection_logs_created_at_idx').on(table.createdAt),
  };
});

// Collections
export const collections = pgTable('collections', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  coverArtworkId: uuid('cover_artwork_id').references(() => artworks.id, { onDelete: 'set null' }),
  isPublic: boolean('is_public').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('collections_user_id_idx').on(table.userId),
  };
});

// Collection items (many-to-many relationship)
export const collectionItems = pgTable('collection_items', {
  collectionId: uuid('collection_id').notNull().references(() => collections.id, { onDelete: 'cascade' }),
  artworkId: uuid('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  position: integer('position').notNull().default(0),
  addedAt: timestamp('added_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.collectionId, table.artworkId] }),
    collectionIdIdx: index('collection_items_collection_id_idx').on(table.collectionId),
  };
});

// Follows (social connections)
export const follows = pgTable('follows', {
  followerId: text('follower_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  followingId: text('following_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.followerId, table.followingId] }),
    followerIdIdx: index('follows_follower_id_idx').on(table.followerId),
    followingIdIdx: index('follows_following_id_idx').on(table.followingId),
  };
});

// Activities (activity feed)
export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  activityType: text('activity_type').notNull(), // 'artwork_uploaded', 'collection_created', 'user_followed'
  entityType: text('entity_type').notNull(), // 'artwork', 'collection', 'user'
  entityId: text('entity_id').notNull(),
  metadata: jsonb('metadata').$type<Record<string, any>>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    userIdIdx: index('activities_user_id_idx').on(table.userId),
    createdAtIdx: index('activities_created_at_idx').on(table.createdAt),
  };
});

// Violation reports (future feature)
export const violationReports = pgTable('violation_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  artworkId: uuid('artwork_id').notNull().references(() => artworks.id, { onDelete: 'cascade' }),
  reportedBy: text('reported_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  violationType: text('violation_type').notNull(), // 'unauthorized_use', 'copyright_infringement', 'trademark', 'impersonation'
  violationUrl: text('violation_url'),
  description: text('description'),
  evidence: jsonb('evidence').$type<{ type: string; url: string }[]>(),
  status: text('status').notNull().default('pending'), // 'pending', 'investigating', 'resolved', 'dismissed'
  resolution: text('resolution'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    artworkIdIdx: index('violation_reports_artwork_id_idx').on(table.artworkId),
    statusIdx: index('violation_reports_status_idx').on(table.status),
  };
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  artworks: many(artworks),
  collections: many(collections),
  following: many(follows, { relationName: 'following' }),
  followers: many(follows, { relationName: 'followers' }),
  activities: many(activities),
  artistProfile: one(artistProfiles, {
    fields: [users.id],
    references: [artistProfiles.userId],
  }),
}));

export const artworksRelations = relations(artworks, ({ one, many }) => ({
  user: one(users, {
    fields: [artworks.userId],
    references: [users.id],
  }),
  protectionLogs: many(protectionLogs),
  collectionItems: many(collectionItems),
  violationReports: many(violationReports),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  user: one(users, {
    fields: [collections.userId],
    references: [users.id],
  }),
  coverArtwork: one(artworks, {
    fields: [collections.coverArtworkId],
    references: [artworks.id],
  }),
  items: many(collectionItems),
}));

export const collectionItemsRelations = relations(collectionItems, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionItems.collectionId],
    references: [collections.id],
  }),
  artwork: one(artworks, {
    fields: [collectionItems.artworkId],
    references: [artworks.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: 'following',
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: 'followers',
  }),
}));

// TypeScript types inferred from schema
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type ArtistProfile = typeof artistProfiles.$inferSelect;
export type NewArtistProfile = typeof artistProfiles.$inferInsert;

export type Artwork = typeof artworks.$inferSelect;
export type NewArtwork = typeof artworks.$inferInsert;

export type ProtectionLog = typeof protectionLogs.$inferSelect;
export type NewProtectionLog = typeof protectionLogs.$inferInsert;

export type Collection = typeof collections.$inferSelect;
export type NewCollection = typeof collections.$inferInsert;

export type CollectionItem = typeof collectionItems.$inferSelect;
export type NewCollectionItem = typeof collectionItems.$inferInsert;

export type Follow = typeof follows.$inferSelect;
export type NewFollow = typeof follows.$inferInsert;

export type Activity = typeof activities.$inferSelect;
export type NewActivity = typeof activities.$inferInsert;

export type ViolationReport = typeof violationReports.$inferSelect;
export type NewViolationReport = typeof violationReports.$inferInsert;
