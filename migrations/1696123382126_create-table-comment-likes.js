/* eslint-disable camelcase */

/**
 * Migration: Create comment_likes table
 * This table stores like relationships between users and comments
 * Implements toggle like/unlike functionality for comments
 */

exports.up = (pgm) => {
  // Create comment_likes table
  pgm.createTable('comment_likes', {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    comment_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  });

  // Add foreign key constraint to comments table
  pgm.addConstraint(
    'comment_likes',
    'fk_comment_likes.comment_id_comments.id',
    'FOREIGN KEY(comment_id) REFERENCES comments(id) ON DELETE CASCADE',
  );

  // Add foreign key constraint to users table
  pgm.addConstraint(
    'comment_likes',
    'fk_comment_likes.user_id_users.id',
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE',
  );

  // Add unique constraint to prevent duplicate likes from same user on same comment
  pgm.addConstraint(
    'comment_likes',
    'unique_comment_user_like',
    'UNIQUE(comment_id, user_id)',
  );
};

exports.down = (pgm) => {
  // Drop comment_likes table (constraints will be dropped automatically)
  pgm.dropTable('comment_likes');
};
